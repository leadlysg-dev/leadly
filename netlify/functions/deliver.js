/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — DELIVER TO GHL  ·  /netlify/functions/deliver.js

   The prospect finished the check, got their analysis, and asked for a copy.
   This hands the lead — and the PDF — to GoHighLevel, which runs the WhatsApp
   automation that actually sends it.

   ── SETUP ────────────────────────────────────────────────────────────────
   Netlify → Site configuration → Environment variables:

     GHL_WEBHOOK_URL   the Inbound Webhook trigger URL from your GHL workflow
                       (GHL → Automation → Workflows → Add Trigger →
                        "Inbound Webhook" → copy the URL)

   Optional:
     GHL_API_KEY       only if you later swap the webhook for the v2 API

   ── WHAT GHL RECEIVES ────────────────────────────────────────────────────
   A flat JSON payload. Flat on purpose: GHL's custom-value mapping cannot
   reach into nested objects, so anything nested is a field you cannot use in
   the WhatsApp template. Everything you'd want to say in a message is a
   top-level key.

     name, phone, company, email          ← company/email may be ""
     all_in_cost, cost_per_lead, gaps
     verdict, priority, closing
     leak_1 … leak_4                      ← flattened, not an array
     plan_1 … plan_4
     report_url                           ← the living report page (NOT a PDF)
     analysed_by                          "claude" | "fallback"

   ── THE PDF ──────────────────────────────────────────────────────────────
   The browser builds the PDF (it already has every number on screen) and posts
   it here as base64. We put it in Netlify Blobs and hand GHL a PUBLIC URL,
   because WhatsApp cannot attach a base64 blob — it needs a link it can fetch.

   If Blobs is unavailable, we still forward the lead WITHOUT the report_url and
   say so in the response. The lead is never lost because a file store hiccuped.
   ═══════════════════════════════════════════════════════════════════════════ */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad json' }) };
  }

  const { contact = {}, facts = {}, analysis = {}, variant = '' } = payload;

  if (!contact.phone || !contact.name) {
    return { statusCode: 400, body: JSON.stringify({ error: 'name and phone are required' }) };
  }

  /* ── 1. MINT THE REPORT ─────────────────────────────────────────────────
     A PDF is a dead end — the last thing that ever happens between you and
     this lead. A URL is not. We store the analysis under a random slug and
     hand WhatsApp a link to a living page that can still answer questions at
     11pm three weeks from now, and still ask for the meeting.

     8 chars from a 32-char alphabet = ~2^40. These pages carry the prospect's
     own spend figures, so they must not be enumerable. */
  let reportUrl = '';
  let reportNote = '';
  const ALPHA = 'abcdefghijkmnpqrstuvwxyz23456789';   /* no l/o/0/1 — people read these aloud */
  const slug = Array.from({ length: 8 }, () =>
    ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');

  try {
    const { getStore } = await import('@netlify/blobs');
    /* Netlify auto-configures Blobs on Git-built deploys. On manual / drag-drop
       deploys it does NOT, and getStore throws MissingBlobsEnvironmentError.
       If BLOBS_SITE_ID + BLOBS_TOKEN are set, use them so it works either way. */
    const blobOpts = { name: 'reports', consistency: 'strong' };
    if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
      blobOpts.siteID = process.env.BLOBS_SITE_ID;
      blobOpts.token  = process.env.BLOBS_TOKEN;
    }
    const store = getStore(blobOpts);
    await store.setJSON(slug, {
      contact, facts, analysis,
      analysed_by: analysis && analysis._fallback ? 'fallback' : 'claude',
      created: new Date().toISOString()
    });
    const base = process.env.URL || `https://${event.headers.host}`;
    reportUrl = `${base}/r/${slug}`;
  } catch (e) {
    /* Blobs failed. The LEAD still goes through — losing a lead because a file
       store hiccuped would be indefensible. */
    reportNote = 'report_store_failed: ' + String(e).slice(0, 90);
  }

  /* ── 1b. STATELESS FALLBACK — the link must NEVER be empty ──────────────
     If Blobs is unavailable (mis-deployed env, outage, anything), carry the
     report IN the URL itself: /r/p?d=<base64url(JSON)>. The report function
     decodes it and renders the same page with zero storage involved. */
  if (!reportUrl) {
    try {
      const slim = {
        v: 1,
        created: new Date().toISOString(),
        contact: { name: contact.name, company: contact.company || '' },
        facts: facts,
        analysis: {
          verdict:   analysis.verdict   || '',
          diagnosis: analysis.diagnosis || '',
          leaks:     (analysis.leaks || []).slice(0, 4),
          priority:  analysis.priority  || null,
          closing:   analysis.closing   || ''
        }
      };
      let d = Buffer.from(JSON.stringify(slim), 'utf8').toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      if (d.length > 7000) {           // keep the URL sane — trim leak detail
        slim.analysis.leaks = slim.analysis.leaks.map(l => ({ title: l.title, severity: l.severity, detail: '' }));
        d = Buffer.from(JSON.stringify(slim), 'utf8').toString('base64')
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      const base = process.env.URL || `https://${event.headers.host}`;
      reportUrl = `${base}/r/p?d=${d}`;
      reportNote = reportNote ? reportNote + ' | stateless_link_used' : 'stateless_link_used';
    } catch (e2) {
      reportNote += ' | stateless_failed: ' + String(e2).slice(0, 60);
    }
  }

  /* ── 2. flatten it. GHL cannot map nested fields. ───────────────────────*/
  const leaks = analysis.leaks || [];
  const plan  = analysis.plan  || [];

  /* ── E.164, OR WHATSAPP WILL NEVER FIRE ──────────────────────────────────
     The form collects a Singapore mobile the way people actually type it:
     "9123 4567", "+65 9123 4567", "6591234567". GHL and WhatsApp need exactly
     one shape: +6591234567. Send anything else and the workflow runs, the log
     says success, and the message silently never arrives — the worst kind of
     failure, because nothing looks broken. */
  const e164 = (raw) => {
    const d = String(raw || '').replace(/[^\d]/g, '').replace(/^65/, '');
    return /^[89]\d{7}$/.test(d) ? '+65' + d : String(raw || '');
  };

  /* slug/report_path must describe the link that actually works. When the
     stateless fallback fired, the stored-slug page does NOT exist — so derive
     both from reportUrl instead of handing GHL a dead path to build with. */
  const isStateless = reportUrl.indexOf('/r/p?d=') !== -1;
  const out = {
    /* which A/B landing page produced this lead ('' from the original page) */
    variant:       variant,
    report_url:    reportUrl,
    slug:          isStateless ? '' : slug,
    report_path:   isStateless ? reportUrl.slice(reportUrl.indexOf('/r/')) : (slug ? '/r/' + slug : ''),
    report_note:   reportNote,
    name:    contact.name,
    phone:   e164(contact.phone),      /* +6591234567 */
    phone_local: contact.phone,        /* as they typed it, for your reps */
    company: contact.company || '',
    email:   contact.email   || '',

    all_in_cost:   facts.total   ? 'S$' + Number(facts.total).toLocaleString('en-SG') : '',
    cost_per_lead: facts.perLead ? 'S$' + Number(facts.perLead).toLocaleString('en-SG') : '',
    leads_per_month: facts.leadsN || '',
    gaps: facts.gaps != null ? String(facts.gaps) : '',
    lead_timing: facts.timing || '',
    lead_role:   facts.role   || '',

    leak_1: leaks[0] ? leaks[0].title + ' \u2014 ' + leaks[0].detail : '',
  leak_2: leaks[1] ? leaks[1].title + ' \u2014 ' + leaks[1].detail : '',
  leak_3: leaks[2] ? leaks[2].title + ' \u2014 ' + leaks[2].detail : '',
  leak_4: leaks[3] ? leaks[3].title + ' \u2014 ' + leaks[3].detail : '',

  plan_1: plan[0] ? plan[0].when + ': ' + plan[0].what : '',
  plan_2: plan[1] ? plan[1].when + ': ' + plan[1].what : '',
  plan_3: plan[2] ? plan[2].when + ': ' + plan[2].what : '',
  plan_4: plan[3] ? plan[3].when + ': ' + plan[3].what : '',

  verdict:  analysis.verdict || '',
    priority: analysis.priority ? analysis.priority.title : '',
    priority_why: analysis.priority ? analysis.priority.why : '',
    closing:  analysis.closing || '',
    analysed_by: analysis._fallback ? 'fallback' : 'claude',

      source: 'leadly.sg /for/insurance · 2-minute check'
  };
  for (let i = 0; i < 4; i++) {
    out[`leak_${i + 1}`] = leaks[i] ? `${leaks[i].title} — ${leaks[i].detail}` : '';
    out[`plan_${i + 1}`] = plan[i]  ? `${plan[i].when}: ${plan[i].what} — ${plan[i].detail}` : '';
  }
  if (reportNote) out.report_note = reportNote;

  /* ── 3. hand it to GHL ─────────────────────────────────────────────────*/
  const hook = process.env.GHL_WEBHOOK_URL;
  if (!hook) {
    /* No webhook configured yet. The REPORT still exists and still works — so
       hand it back with a 200. Failing the whole request here would tell the
       prospect their analysis was lost when it plainly was not, and would cost
       you the lead over a missing environment variable. */
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, report_url: reportUrl, delivered: false,
                             note: 'GHL_WEBHOOK_URL not set — report minted, nothing sent' })
    };
  }

  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(out)
    });
    return {
      statusCode: r.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: r.ok, delivered: r.ok, ghl_status: r.status,
                             report_url: reportUrl, report_note: reportNote || undefined })
    };
  } catch (e) {
    /* GHL is down. The report EXISTS. Hand it back — do not lose the lead
       because someone else's server had a bad minute. */
    return { statusCode: 200,
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ ok: true, delivered: false, report_url: reportUrl,
                                    note: 'ghl_failed: ' + String(e).slice(0, 120) }) };
  }
};
