/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE ANALYSIS  ·  /assets/leadly-analysis.js

   Turns the 2-minute check's answers into an analysis.

   ── HOW IT WORKS, HONESTLY ───────────────────────────────────────────────
   Two things happen, and they are different things:

   1. THE ARITHMETIC is done here, in the browser, from what the prospect typed.
      Their all-in cost, their cost per lead, where the money splits, which of
      the five pieces they are missing. This is not AI and never pretends to be.

   2. THE JUDGEMENT is done by a model. /.netlify/functions/analyse sends the
      answers to Claude, which writes the verdict, the leaks, the priority and
      the 90-day plan. That is a real call to a real model.

   The model is explicitly forbidden from inventing numbers — see the system
   prompt in the function. It writes what the numbers MEAN. It does not make
   them up.

   If the key isn't set, or the call fails, we fall back to a deterministic
   analysis written from the same arithmetic — and the badge on screen changes
   from "Analysed by Claude" to "Instant analysis", because claiming a model
   ran when it didn't is the one thing we will not do.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var money = function (n) { return 'S$' + Math.round(n).toLocaleString('en-SG'); };
  var wait  = function (ms) { return new Promise(function (r) { setTimeout(r, REDUCED ? 1 : ms); }); };

  var PIECES = [
    { key: 'Leads qualified before reaching an advisor', short: 'Qualified<br>before the call' },
    { key: 'New leads reach the team within seconds',    short: 'Delivered<br>in seconds' },
    { key: 'One shared live call list',                  short: 'One live<br>call sheet' },
    { key: 'Automatic follow-up at 30 and 60 days',      short: 'Automatic<br>winback' },
    { key: 'A live dashboard of performance by ad',      short: 'Live<br>dashboard' }
  ];

  var SEG_COLOURS = ['#0055E8', '#4D8CF0', '#7BA2F6', '#A8C3FB', '#0F2247'];

  var TICK  = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4 4L19 7"/></svg>';
  var CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.6" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  /* ── the thinking sequence — the wait IS the proof ──────────────────────*/
  var THINKING = [
    'Reading your answers',
    'Adding up what leads actually cost you',
    'Finding where the money leaks',
    'Working out what to fix first',
    'Writing your 90-day plan'
  ];

  async function think(host, done) {
    host.innerHTML =
      '<div class="an-think">' +
        '<div class="an-orb"><i></i></div>' +
        '<h3>Reading what you told us.</h3>' +
        '<p class="sub">A few seconds. This is a real analysis, not a lookup.</p>' +
        '<div class="an-steps">' +
          THINKING.map(function (t) {
            return '<div class="an-line"><span class="dot"></span>' + esc(t) + '</div>';
          }).join('') +
        '</div>' +
      '</div>';

    var lines = [].slice.call(host.querySelectorAll('.an-line'));
    for (var i = 0; i < lines.length; i++) {
      lines[i].classList.add('in', 'doing');
      await wait(120);
    }
    /* the lines tick off while the model is actually working */
    var t = 0;
    var timer = setInterval(function () {
      if (t < lines.length) {
        lines[t].classList.remove('doing');
        lines[t].classList.add('done');
        if (lines[t + 1]) lines[t + 1].classList.add('doing');
        t++;
      }
    }, 620);

    var result = await done;                     /* the real call */
    clearInterval(timer);
    lines.forEach(function (l) { l.classList.remove('doing'); l.classList.add('done'); });
    await wait(420);
    return result;
  }

  /* ── the fallback: same arithmetic, no model, and it SAYS so ────────────*/
  function fallback(f) {
    var leaks = [];
    if (!f.features.includes('Leads qualified before reaching an advisor'))
      leaks.push({ title: 'Nothing filters the list', detail: 'Your advisors find out whether someone is a fit during the call, not before it — so the unqualified ones still cost you an hour.', severity: 'high' });
    if (!f.features.includes('New leads reach the team within seconds'))
      leaks.push({ title: 'Leads arrive cold', detail: 'A lead is warmest in the minutes after they raise their hand. If yours arrive by digest or export, that window has already closed.', severity: 'high' });
    if (!f.features.includes('Automatic follow-up at 30 and 60 days'))
      leaks.push({ title: 'You only ask once', detail: 'Most people are not ready the first time. You paid for those leads either way, and nothing goes back to them.', severity: 'medium' });
    if (!f.features.includes('A live dashboard of performance by ad'))
      leaks.push({ title: 'You cannot see the ads', detail: 'Without event-level tracking you are guessing which ad is working, so budget keeps flowing to the ones that are not.', severity: 'medium' });
    if (!leaks.length)
      leaks.push({ title: 'The pieces are in place', detail: 'On your own account you have all five. The question is whether each one is actually being worked, not whether it exists.', severity: 'low' });

    return {
      _fallback: true,
      verdict: f.total > 0
        ? 'You are paying ' + money(f.total) + ' a month and losing most of it after the click.'
        : 'You have never added up what a lead actually costs you.',
      diagnosis: f.total > 0
        ? (f.perLead
            ? 'Every lead is costing you about ' + money(f.perLead) + ' all-in, and you are missing ' + f.gaps + ' of the five pieces that decide whether that lead is ever spoken to. The ad spend is not your problem. What happens in the ten minutes after the click is.'
            : 'You told us what you spend but not how many leads it produces — which is itself the finding. You cannot improve a number you have never measured.')
        : 'You did not put a figure in, which is the most common answer we get. Most teams under-count this badly, because the staff hours are the part nobody adds up.',
      leaks: leaks.slice(0, 4),
      priority: {
        title: f.features.includes('New leads reach the team within seconds')
          ? 'Qualify before the call, not on it'
          : 'Get the lead in front of a human in under two minutes',
        why: 'Leads called 60–120 seconds after they come in convert 160% more often than those called later (Leads360 / Velocify). Everything else you fix is worth less until that window is closed.'
      },
      plan: [
        { when: 'Week 1',      what: 'Tracking and the call sheet',   detail: 'Pixel, Conversions API and UTM tagging wired in, and one live sheet your whole team works from. Nothing improves until it is measured.' },
        { when: 'Weeks 2–3',   what: 'The Smart Qualifier goes live', detail: 'A branching funnel that asks what your advisors would ask, so a lead arrives already answered.' },
        { when: 'Weeks 4–6',   what: 'Instant Ping and first creative', detail: 'Leads land in your team\u2019s WhatsApp within seconds, and the first creative rotation starts testing angles against each other.' },
        { when: 'Weeks 7–12',  what: 'Winback and the second round',  detail: 'Automatic re-engagement at 30 and 60 days, and the creative that lost gets replaced with what the data says works.' }
      ],
      closing: f.gaps === 0
        ? 'You have all five pieces. Honestly, you may not need us — but the call is free and we will tell you straight.'
        : 'Nothing here is a promise. It is what your own answers say, and what we would build first.'
    };
  }

  /* ── draw it ────────────────────────────────────────────────────────────*/
  function render(host, f, a) {
    var parts = (f.breakdown || []).filter(function (p) { return p[1] > 0; });
    var total = f.total || 0;

    var barHTML = '';
    var keyHTML = '';
    parts.forEach(function (p, i) {
      var pct = total ? (p[1] / total * 100) : 0;
      barHTML += '<div class="seg" data-w="' + pct.toFixed(2) + '" style="background:' + SEG_COLOURS[i % 5] + '"></div>';
      keyHTML += '<span><i style="background:' + SEG_COLOURS[i % 5] + '"></i>' + esc(p[0]) + ' <b>' + money(p[1]) + '</b></span>';
    });

    var piecesHTML = PIECES.map(function (p) {
      var have = (f.features || []).includes(p.key);
      return '<div class="an-piece ' + (have ? 'have' : 'miss') + '">' +
               '<span class="ic">' + (have ? TICK : CROSS) + '</span>' +
               '<span class="nm">' + p.short + '</span>' +
             '</div>';
    }).join('');

    host.innerHTML =
      '<div class="an on">' +

        '<div class="an-blk">' +
          '<span class="an-badge' + (a._fallback ? ' is-fallback' : '') + '"><i></i>' +
            (a._fallback ? 'Instant analysis' : 'Analysed by Claude') +
          '</span>' +
          '<h3 class="an-verdict">' + esc(a.verdict) + '</h3>' +
          '<p class="an-diag">' + esc(a.diagnosis) + '</p>' +
        '</div>' +

        (total > 0 ?
        '<div class="an-blk">' +
          '<div class="an-figs">' +
            '<div class="an-fig"><div class="lbl">Your all-in cost</div>' +
              '<div class="val warn" data-count="' + total + '">S$0</div>' +
              '<div class="sub">every month, not just the ad spend</div></div>' +
            '<div class="an-fig"><div class="lbl">Cost per lead</div>' +
              '<div class="val' + (f.perLead ? '' : ' ') + '" ' + (f.perLead ? 'data-count="' + f.perLead + '"' : '') + '>' +
                (f.perLead ? 'S$0' : '\u2014') + '</div>' +
              '<div class="sub">' + (f.perLead ? 'across roughly ' + f.leadsN + ' leads a month' : 'you did not tell us how many leads you get') + '</div></div>' +
            '<div class="an-fig"><div class="lbl">Pieces missing</div>' +
              '<div class="val' + (f.gaps ? ' warn' : '') + '">' + f.gaps + ' of 5</div>' +
              '<div class="sub">' + (f.gaps ? 'this is where the money leaks out' : 'you have the whole system') + '</div></div>' +
          '</div>' +
        '</div>' : '') +

        (parts.length ?
        '<div class="an-blk">' +
          '<p class="an-sec-h">Where it actually goes</p>' +
          '<div class="an-bar"><div class="track">' + barHTML + '</div>' +
          '<div class="an-key">' + keyHTML + '</div></div>' +
        '</div>' : '') +

        '<div class="an-blk">' +
          '<p class="an-sec-h">The five pieces</p>' +
          '<div class="an-pieces">' + piecesHTML + '</div>' +
        '</div>' +

        '<div class="an-blk">' +
          '<p class="an-sec-h">What we can see leaking</p>' +
          '<div class="an-leaks">' +
            (a.leaks || []).map(function (l) {
              return '<div class="an-leak ' + esc(l.severity || 'low') + '">' +
                       '<span class="sev">' + esc(l.severity || 'low') + '</span>' +
                       '<span class="tx"><b>' + esc(l.title) + '</b><p>' + esc(l.detail) + '</p></span>' +
                     '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="an-blk">' +
          '<p class="an-sec-h">Fix this first</p>' +
          '<div class="an-prio tex-dark">' +
            '<div class="lbl">Your single highest-value move</div>' +
            '<h4>' + esc(a.priority.title) + '</h4>' +
            '<p>' + esc(a.priority.why) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="an-blk">' +
          '<p class="an-sec-h">Setup: live in under 5 working days</p>' +
          '<div class="an-plan">' +
            [ ['Day 1','Tracking wired in','Pixel, server-side events and per-ad tagging \u2014 so every dollar is measured from the first click.'],
              ['Day 2','Your qualifier goes live','The branching check your leads answer \u2014 like the one you just did \u2014 so every lead arrives pre-qualified.'],
              ['Day 3','Instant delivery to WhatsApp','New leads land in your team\u2019s WhatsApp in seconds, with the live call sheet everyone works from.'],
              ['Day 4\u20135','Ads on, Pulse on','First creative rotation starts and your Leadly Pulse dashboard is live. From here it is optimisation, not setup.']
            ].map(function (m) {
              return '<div class="an-milestone">' +
                       '<div class="when">' + m[0] + '</div>' +
                       '<div class="what">' + m[1] + '</div>' +
                       '<div class="detail">' + m[2] + '</div>' +
                     '</div>';
            }).join('') +
          '</div>' +

          '<div class="an-validity tex-dark" style="background:#0E0F11;border-radius:14px;padding:18px 20px;margin-top:14px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">' +
            '<div style="min-width:220px">' +
              '<div class="lbl" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55)">This report is valid until</div>' +
              '<div id="an-countdown" style="font-size:22px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums">7d 00:00:00</div>' +
              '<div style="font-size:12.5px;color:rgba(255,255,255,.6);margin-top:2px">The pricing offered with it ends when the report does.</div>' +
            '</div>' +
            '<button type="button" class="btn btn-primary" data-book><span>Book a demo</span><i class="btn-ico" aria-hidden="true"></i></button>' +
          '</div>' +

          '<div class="an-close">' +
            '<p>' + esc(a.closing) + '</p>' +
            '<div class="an-actions">' +
              '<button type="button" class="btn btn-primary" id="an-pdf"><span>Open my report</span><i class="btn-ico" aria-hidden="true"></i></button>' +
              '<a class="btn btn-secondary" href="#pricing"><span>See what it costs</span></a>' +
            '</div>' +
            '<p class="an-sent" id="an-sent" hidden></p>' +
            '<p class="an-foot">' +
              '<b>One more thing.</b> That questionnaire you just filled in \u2014 that is the product. Your leads answer one like it before they ever reach an advisor, and it comes back with an analysis like this one. You have just used the thing we are selling you.' +
            '</p>' +
          '</div>' +
        '</div>' +

      '</div>';

    /* the 7-day validity countdown. Anchor: window.__LEADLY_REPORT_CREATED
       (ISO string, set by the /r/ page from the stored blob) or now. */
    (function(){
      var cd = host.querySelector('#an-countdown'); if(!cd) return;
      var created = window.__LEADLY_REPORT_CREATED ? new Date(window.__LEADLY_REPORT_CREATED).getTime() : Date.now();
      var end = created + 7*24*60*60*1000;
      var pad = function(n){ return (n<10?'0':'')+n; };
      var tick = function(){
        var ms = end - Date.now();
        if (ms <= 0){ cd.textContent = 'Expired'; return; }
        var d = Math.floor(ms/86400000), h = Math.floor(ms%86400000/3600000),
            m = Math.floor(ms%3600000/60000), s = Math.floor(ms%60000/1000);
        cd.textContent = d + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s);
        setTimeout(tick, 1000);
      };
      tick();
    })();

    /* the bar fills, the figures climb */
    requestAnimationFrame(function () {
      host.querySelectorAll('.an-bar .seg').forEach(function (s) {
        s.style.width = s.dataset.w + '%';
      });
      host.querySelectorAll('[data-count]').forEach(function (el) {
        var to = +el.dataset.count;
        if (REDUCED) { el.textContent = money(to); return; }
        var t0 = performance.now(), dur = 1200;
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          el.textContent = money(to * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    });
  }

  /* ── the public call ────────────────────────────────────────────────────*/
  async function run(host, facts) {
    var call = fetch('/.netlify/functions/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facts)
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) {
        if (!j || !j.verdict || !j.priority || !j.plan) throw new Error('shape');
        return j;
      })
      .catch(function () { return fallback(facts); });   /* never leave them stranded */

    var a = await think(host, call);
    render(host, facts, a);
    host.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });

    /* ── THE REPORT ────────────────────────────────────────────────────────
       Not a PDF. A PDF is a dead end — the last thing that ever happens between
       you and this lead. It cannot answer a question at 11pm, it cannot notice
       they came back a third time, and it cannot ask for the meeting.

       So the analysis is stored under a random slug and WhatsApp gets a LINK to
       a living page that carries the same numbers AND an adviser primed with
       them. It keeps working long after the call is over.                    */
    var c = facts.contact;
    if (!c || !c.phone) return;

    var sent = document.getElementById('an-sent');

    fetch('/.netlify/functions/deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      /* variant rides along so a lead in GHL can be attributed to the A/B
         page it came from. Reads the hidden field the variant pages carry;
         undefined on the original page, which deliver.js simply ignores. */
      body: JSON.stringify({ contact: c, facts: facts, analysis: a,
        variant: (document.querySelector('#qform input[name="variant"]') || {}).value || undefined })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) {
        var url = j && j.report_url;
        var btn = document.getElementById('an-pdf');
        if (btn && url) {
          btn.addEventListener('click', function () { window.open(url, '_blank', 'noopener'); });
        } else if (btn) {
          /* no link came back — don't leave a dead button */
          btn.querySelector('span').textContent = 'Report shown above';
          btn.disabled = true; btn.style.opacity = '.55'; btn.style.cursor = 'default';
        }
        if (!sent) return;
        sent.hidden = false;
        if (url) {
          sent.className = 'an-sent ok';
          sent.innerHTML = '\u2713 Sent to WhatsApp on <b>' + esc(c.phone) + '</b>. It should arrive within a minute.';
        } else {
          /* the send may have fired, but WITHOUT a link it is not the promise we made */
          sent.className = 'an-sent bad';
          sent.innerHTML = 'Your report is on screen. We could not generate its link just now \u2014 an adviser will follow up on <b>' + esc(c.phone) + '</b>.';
        }
      })
      .catch(function () {
        if (!sent) return;
        sent.hidden = false;
        sent.className = 'an-sent bad';
        sent.innerHTML = 'We could not send it just now \u2014 but it is on screen, and an adviser will call you.';
      });
  }

  window.LeadlyAnalysis = { run: run };
})();
