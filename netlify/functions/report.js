/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE REPORT  ·  /netlify/functions/report.js

   Every completed check mints a report at a random, unguessable URL:

       leadly.sg/r/k3n9x2p8

   WhatsApp sends that link. Not a PDF — a link.

   ── WHY NOT A PDF ────────────────────────────────────────────────────────
   A PDF is a dead end. It is the last thing that ever happens between you and
   that prospect. It cannot answer a question at 11pm, it cannot notice they
   came back a third time, and it cannot ask for the meeting.

   This page can. It carries the same analysis, and it carries an ADVISER — a
   real model call, primed with THEIR numbers — that answers whatever they want
   to ask about their own situation and, when the moment is right, puts the
   booking in front of them. It keeps working long after the call is over.

   ── THE SLUG ─────────────────────────────────────────────────────────────
   8 chars from a 32-char alphabet = 2^40 possibilities. These pages contain a
   prospect's own spend figures, so they must not be enumerable. Not a secret,
   but not a guess either.

   ── SETUP ────────────────────────────────────────────────────────────────
   Netlify Blobs must be enabled on the site (it is, by default, on any site
   with Functions). No other configuration.
   ═══════════════════════════════════════════════════════════════════════════ */

const esc = (v) =>
  String(v == null ? '' : v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (n) => 'S$' + Math.round(Number(n) || 0).toLocaleString('en-SG');

const PIECES = [
  ['Leads qualified before reaching an advisor', 'Qualified before the call'],
  ['New leads reach the team within seconds',    'Delivered in seconds'],
  ['One shared live call list',                  'One live call sheet'],
  ['Automatic follow-up at 30 and 60 days',      'Automatic winback'],
  ['A live dashboard of performance by ad',      'Live dashboard']
];

const SEG = ['#0055E8', '#4D8CF0', '#7BA2F6', '#A8C3FB', '#0F2247'];

function page(d) {
  const c = d.contact || {};
  const f = d.facts || {};
  const a = d.analysis || {};
  const parts = (f.breakdown || []).filter((p) => p[1] > 0);
  const total = Number(f.total) || 0;

  const bars = parts.map((p, i) => {
    const pct = total ? (p[1] / total) * 100 : 0;
    return `<div class="seg" style="width:${pct.toFixed(2)}%;background:${SEG[i % 5]}"></div>`;
  }).join('');

  const key = parts.map((p, i) =>
    `<span><i style="background:${SEG[i % 5]}"></i>${esc(p[0])} <b>${money(p[1])}</b></span>`).join('');

  const pieces = PIECES.map(([full, short]) => {
    const have = (f.features || []).includes(full);
    return `<div class="piece ${have ? 'have' : 'miss'}">
      <span class="ic">${have ? '&#10003;' : '&#10005;'}</span><span>${esc(short)}</span></div>`;
  }).join('');

  const leaks = (a.leaks || []).map((l) =>
    `<div class="leak ${esc(l.severity || 'low')}">
       <span class="sev">${esc(l.severity || 'low')}</span>
       <div><b>${esc(l.title)}</b><p>${esc(l.detail)}</p></div>
     </div>`).join('');

  const plan = (a.plan || []).map((m) =>
    `<div class="ms"><div class="when">${esc(m.when)}</div>
       <div class="what">${esc(m.what)}</div>
       <p>${esc(m.detail)}</p></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="only light">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Your lead-generation analysis \u00b7 Leadly</title>
<meta property="og:title" content="${esc(a.verdict || 'Your lead-generation analysis')}">
<meta property="og:description" content="Prepared for ${esc(c.name || 'you')} by Leadly.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/assets/brand.css">
<link rel="stylesheet" href="/assets/leadly-report.css">
</head>
<body>

<header class="rp-top tex-dark">
  <div class="rp-in">
    <div class="rp-brand">
      <span class="rp-mark"><svg viewBox="0 0 24 24" fill="none"><path d="M2 14h4l2.5-7 3.5 12 3-9 2 4h5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span>Leadly<b>.</b></span>
    </div>
    <span class="rp-when">Prepared for <b>${esc(c.name || '')}</b>${c.company ? ' \u00b7 ' + esc(c.company) : ''}</span>
  </div>
  <div class="rp-in rp-say">
    <span class="rp-badge"><i></i>${d.analysed_by === 'claude' ? 'Analysed by Claude' : 'Instant analysis'}</span>
    <h1>${esc(a.verdict || '')}</h1>
    <p>${esc(a.diagnosis || '')}</p>
  </div>
</header>

<main class="rp-in rp-body">

  <!-- ── THE ADVISER ───────────────────────────────────────────────────────
       This is why the report is a page and not a PDF. It has read their whole
       analysis and it will answer anything they ask about it — at 11pm, on a
       Sunday, three weeks after the call. And when the question is one only a
       human should answer, it says so and offers the meeting. -->
  <section class="rp-ask">
    <div class="ask-h">
      <span class="ask-dot"></span>
      <div>
        <h2>Ask about any of this.</h2>
        <p>It has read your analysis. Ask it anything \u2014 what a number means, what we\u2019d do differently, what it would cost.</p>
      </div>
    </div>
    <div class="ask-log" id="log"><div class="msg ai">Hi${c.name ? ' ' + esc(c.name.split(' ')[0]) : ''} \u2014 I've read your whole report. I'm here to walk you through it: what the numbers mean, where the leaks are, and what we'd build first. Pick a question below or ask me anything.</div></div>
    <div class="ask-chips" id="chips">
      <button data-q="Walk me through my report \u2014 what matters most?">Walk me through my report</button>
      <button data-q="Why is my cost per lead so high?">Why is my cost per lead so high?</button>
      <button data-q="Anyone can run one good campaign \u2014 why does the infrastructure matter more?">Why infrastructure over campaigns?</button>
      <button data-q="What would you fix first, and why that?">What would you fix first?</button>
      <button data-q="What would this actually cost me, and what do I get?">What does it cost?</button>
    </div>
    <form class="ask-form" id="askf">
      <input id="askq" type="text" placeholder="Ask about your analysis\u2026" autocomplete="off">
      <button class="btn btn-primary" type="submit"><span>Ask</span></button>
    </form>
  </section>

  ${total > 0 ? `<section class="rp-figs">
    <div class="fig"><span class="l">Your all-in cost</span><span class="v warn">${money(total)}</span><span class="s">every month, not just ad spend</span></div>
    <div class="fig"><span class="l">Cost per lead</span><span class="v">${f.perLead ? money(f.perLead) : '\u2014'}</span><span class="s">${f.perLead ? 'across ~' + esc(f.leadsN) + ' leads a month' : 'you did not tell us how many'}</span></div>
    <div class="fig"><span class="l">Pieces missing</span><span class="v ${f.gaps ? 'warn' : ''}">${esc(f.gaps)} of 5</span><span class="s">where the money leaks out</span></div>
  </section>` : ''}

  ${parts.length ? `<section>
    <h2>Where it actually goes</h2>
    <div class="bar">${bars}</div>
    <div class="key">${key}</div>
  </section>` : ''}

  <section>
    <h2>The five pieces</h2>
    <div class="pieces">${pieces}</div>
  </section>

  ${leaks ? `<section><h2>What we can see leaking</h2><div class="leaks">${leaks}</div></section>` : ''}

  ${a.priority ? `<section>
    <h2>Fix this first</h2>
    <div class="prio tex-dark">
      <span class="l">Your single highest-value move</span>
      <h3>${esc(a.priority.title)}</h3>
      <p>${esc(a.priority.why)}</p>
    </div>
  </section>` : ''}

  <section><h2>Setup: live in under 5 working days</h2><div class="plan">
    <div class="ms"><div class="when">Day 1</div><div class="what">Tracking wired in</div><div class="detail">Pixel, server-side events and per-ad tagging \u2014 every dollar measured from the first click.</div></div>
    <div class="ms"><div class="when">Day 2</div><div class="what">Your qualifier goes live</div><div class="detail">The branching check your leads answer \u2014 like the one you just did \u2014 so every lead arrives pre-qualified.</div></div>
    <div class="ms"><div class="when">Day 3</div><div class="what">Instant delivery to WhatsApp</div><div class="detail">New leads land in your team\u2019s WhatsApp in seconds, with the live call sheet everyone works from.</div></div>
    <div class="ms"><div class="when">Day 4\u20135</div><div class="what">Ads on, Pulse on</div><div class="detail">First creative rotation starts and your Leadly Pulse dashboard is live. From here it is optimisation, not setup.</div></div>
  </div>
  <div class="prio tex-dark" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">
    <div style="min-width:220px">
      <span class="l">This report is valid until</span>
      <h3 id="rp-countdown" style="font-variant-numeric:tabular-nums">7d 00:00:00</h3>
      <p>The pricing offered with it ends when the report does.</p>
    </div>
    <a class="btn btn-primary" href="https://www.leadly.sg/for/insurance"><span>Book a demo</span></a>
  </div></section>



  <section class="rp-cta">
    <p>${esc(a.closing || '')}</p>
    <a class="btn btn-primary" href="https://www.leadly.sg/for/insurance#pricing"><span>See what it costs</span></a>
    <a class="btn btn-secondary" href="https://www.leadly.sg/for/insurance" id="bookbtn"><span>Book a demo</span></a>
  </section>

  <footer class="rp-foot">
    <p>The judgement in this report was written by a model reading your answers. Every figure comes from what you told us. Nothing here is a promise.</p>
    <p>Leadly \u00b7 Elephant &amp; Ostrich LLP \u00b7 One flat S$1,500/month plus your own ad spend, which we never mark up.</p>
  </footer>
</main>

<script>(function(){var el=document.getElementById('rp-countdown');if(!el)return;
var created=${JSON.stringify(d.created || null)};var end=(created?new Date(created).getTime():Date.now())+7*86400000;
function pad(n){return(n<10?'0':'')+n}
(function t(){var ms=end-Date.now();if(ms<=0){el.textContent='Expired';return}
el.textContent=Math.floor(ms/86400000)+'d '+pad(Math.floor(ms%86400000/3600000))+':'+pad(Math.floor(ms%3600000/60000))+':'+pad(Math.floor(ms%60000/1000));setTimeout(t,1000)})()})();</script>
<script>window.__REPORT__ = ${JSON.stringify({ slug: d.slug, created: d.created, contact: { name: c.name, company: c.company }, facts: d.facts, analysis: d.analysis })};</script>
<script src="/assets/leadly-report.js"></script>
</body>
</html>`;
}

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const slug = qs.s || (event.path || '').split('/').filter(Boolean).pop();

  /* ── STATELESS REPORT: /r/p?d=<base64url(JSON)> ──────────────────────────
     Written by deliver.js when Blobs is unavailable. The whole report rides
     in the URL; no storage round-trip, cannot 404. */
  if (qs.d) {
    try {
      const b64 = String(qs.d).replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (!data || !data.analysis) throw new Error('bad payload');
      data.slug = 'p';
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, nofollow'
        },
        body: page(data)
      };
    } catch (e) {
      return { statusCode: 404, headers: { 'Content-Type': 'text/html' },
               body: '<h1>This report link is not valid.</h1>' };
    }
  }

  if (!slug || !/^[a-z0-9]{6,16}$/i.test(slug)) {
    return { statusCode: 404, headers: { 'Content-Type': 'text/html' }, body: '<h1>Not found</h1>' };
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    /* Must match deliver.js — same store, same manual-fallback credentials,
       or the reader won't find what the writer stored. */
    const blobOpts = { name: 'reports', consistency: 'strong' };
    if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
      blobOpts.siteID = process.env.BLOBS_SITE_ID;
      blobOpts.token  = process.env.BLOBS_TOKEN;
    }
    const store = getStore(blobOpts);
    const data = await store.get(slug, { type: 'json' });
    if (!data) {
      return { statusCode: 404, headers: { 'Content-Type': 'text/html' },
               body: '<h1>This report has expired or does not exist.</h1>' };
    }
    data.slug = slug;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',        /* it is personal — never cache it */
        'X-Robots-Tag': 'noindex, nofollow'
      },
      body: page(data)
    };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'text/html' },
             body: '<h1>Could not load the report.</h1>' };
  }
};
