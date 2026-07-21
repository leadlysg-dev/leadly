/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE FUNNEL PAGE ENGINE  ·  /assets/funnel-page.js

   Drives every Smart Qualifier landing page. One engine, three funnels.

   Each page defines window.FUNNEL before this loads:

     window.FUNNEL = {
       name:    'critical-illness',        // the Netlify form name
       steps:   [ …see below… ],
       lead:    { … },                     // scoring weights, optional
       done:    { title, body, steps:[] }  // the success screen
     };

   A step is one of:
     { type:'choice', q, hint, name, opts:[{ label, value, score }] }
     { type:'multi',  q, hint, name, opts:[…] }          // Continue to advance
     { type:'calc',   … }                                // page supplies render()
     { type:'slots',  … }                                // page supplies render()
     { type:'form',   q, hint }                          // name + mobile + PDPA

   ── WHY IT POSTS THE WAY IT DOES ──────────────────────────────────────────
   The form posts to Netlify Forms. Netlify needs a real <form> in the static
   HTML at build time to register the fields — a form built by JS at runtime is
   invisible to it, and submissions silently vanish. So the <form> and every
   hidden field are in the markup, and this file only fills them in.

   PDPA consent is REQUIRED and blocks submission. That is not a UX opinion —
   in Singapore you cannot call someone about a product without it.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var F = window.FUNNEL;
  if (!F) return;

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  var stepsEl = $('.lp-steps');
  var trackEl = $('.lp-track i');
  var countEl = $('.lp-count');
  var backB   = $('.lp-back');
  var nextB   = $('.lp-next');
  var form    = $('#lp-form');

  var dl = window.dataLayer = window.dataLayer || [];

  var answers = {};
  var score   = 0;
  var cur     = 0;
  var started = false;
  var TOTAL   = F.steps.length;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  /* ── render every step up front, show one at a time ─────────────────────*/
  F.steps.forEach(function (S, i) {
    var el = document.createElement('div');
    el.className = 'lp-step';
    el.dataset.i = i;

    if (S.type === 'choice' || S.type === 'multi') {
      el.innerHTML =
        '<h2 class="lp-q">' + esc(S.q) + '</h2>' +
        (S.hint ? '<p class="lp-hint">' + esc(S.hint) + '</p>' : '') +
        '<div class="lp-opts">' +
          S.opts.map(function (o, n) {
            return '<button type="button" class="lp-opt' + (S.type === 'multi' ? ' multi' : '') + '" ' +
                   'data-n="' + n + '"><span class="rd"></span>' + esc(o.label) + '</button>';
          }).join('') +
        '</div>';
    } else if (S.type === 'form') {
      el.innerHTML =
        '<h2 class="lp-q">' + esc(S.q) + '</h2>' +
        (S.hint ? '<p class="lp-hint">' + esc(S.hint) + '</p>' : '') +
        '<div class="lp-field" id="f-name">' +
          '<label for="lp-name">Your name</label>' +
          '<input id="lp-name" name="name" type="text" autocomplete="name" required>' +
          '<div class="lp-err">Please enter your name.</div>' +
        '</div>' +
        '<div class="lp-field" id="f-phone">' +
          '<label for="lp-phone">Mobile number</label>' +
          '<input id="lp-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required>' +
          '<div class="lp-err">Please enter a valid mobile number.</div>' +
        '</div>' +
        '<label class="lp-consent" id="f-consent">' +
          '<input id="lp-consent" type="checkbox" name="consent" value="yes">' +
          '<span>' + esc(F.consent) + '</span>' +
        '</label>' +
        '<div class="lp-err" id="consent-err" style="margin-top:2px">Please tick the box so an adviser can reach you.</div>';
    } else if (S.render) {
      el.innerHTML = S.render();          /* calc / slots — the page owns these */
    }

    stepsEl.appendChild(el);
  });

  /* the success screen */
  var doneEl = document.createElement('div');
  doneEl.className = 'lp-step';
  doneEl.dataset.i = 'done';
  doneEl.innerHTML =
    '<div class="lp-done">' +
      '<div class="lp-tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.4 4.4L19.5 7"/></svg></div>' +
      '<h2>' + esc(F.done.title) + '</h2>' +
      '<p>' + F.done.body + '</p>' +
      (F.done.steps && F.done.steps.length
        ? '<ul class="lp-next-steps">' + F.done.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>'
        : '') +
    '</div>';
  stepsEl.appendChild(doneEl);

  var stepEls = $$('.lp-step', stepsEl);

  /* the bottom fade — only ON when there is actually more below */
  var fade = document.createElement('div');
  fade.className = 'lp-scrollfade';
  stepsEl.parentNode.insertBefore(fade, stepsEl.nextSibling);
  function syncFade() {
    var more = stepsEl.scrollHeight - stepsEl.clientHeight - stepsEl.scrollTop > 4;
    fade.classList.toggle('on', more);
  }
  stepsEl.addEventListener('scroll', syncFade, { passive: true });
  window.addEventListener('resize', syncFade);

  /* ── navigation ─────────────────────────────────────────────────────────*/
  function valid(i) {
    var S = F.steps[i];
    if (!S) return true;
    if (S.type === 'choice') return answers[S.name] != null;
    if (S.type === 'multi')  return (answers[S.name] || []).length > 0;
    if (S.type === 'form')   return true;    /* validated on submit */
    return true;                             /* calc / slots self-advance */
  }

  function show(i, dir) {
    /* forward slides in from the right, Back slides in from the left. Small,
       and nobody will name it — but going Back should FEEL like going back. */
    stepsEl.classList.remove('fwd', 'rev');
    void stepsEl.offsetWidth;                       /* restart the animation */
    stepsEl.classList.add(dir === 'rev' ? 'rev' : 'fwd');

    cur = i;
    stepEls.forEach(function (e) { e.classList.toggle('on', e.dataset.i === String(i)); });
    stepsEl.scrollTop = 0;

    var done = (i === 'done');
    var S = done ? null : F.steps[i];

    trackEl.style.width = done ? '100%' : ((i / TOTAL) * 100) + '%';
    countEl.textContent = done ? 'Done' : (i + 1) + ' of ' + TOTAL;
    $('.lp-actions').style.display = done ? 'none' : 'flex';
    $('.lp-progress').style.display = done ? 'none' : 'flex';
    if (done) return;

    backB.style.display = i > 0 ? '' : 'none';

    /* a single-choice step advances on tap — no Continue button needed */
    var auto = S.type === 'choice';
    nextB.style.display = auto ? 'none' : '';
    nextB.disabled = !valid(i);
    nextB.textContent = (S.type === 'form') ? (F.submitLabel || 'Get my results') : 'Continue';
    if (S.type !== 'form') {
      nextB.insertAdjacentHTML('beforeend',
        '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    }
    if (S.onShow) S.onShow(stepEls[i], api);
    requestAnimationFrame(syncFade);
  }

  function next() {
    if (cur === 'done') return;
    if (F.steps[cur].type === 'form') return submit();
    if (!valid(cur)) return;
    if (cur + 1 < TOTAL) show(cur + 1, 'fwd');
    else show('done', 'fwd');
  }

  function back() {
    if (cur === 'done' || cur === 0) return;
    show(cur - 1, 'rev');
  }

  /* ── answers ────────────────────────────────────────────────────────────*/
  stepsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.lp-opt');
    if (!btn) return;
    var i = +btn.closest('.lp-step').dataset.i;
    var S = F.steps[i];
    var o = S.opts[+btn.dataset.n];

    if (!started) { started = true; dl.push({ event: 'funnel_start', funnel: F.name }); }

    if (S.type === 'multi') {
      btn.classList.toggle('on');
      answers[S.name] = $$('.lp-opt.on', btn.parentNode).map(function (b) {
        return S.opts[+b.dataset.n].value;
      });
      nextB.disabled = !valid(i);
      return;
    }

    $$('.lp-opt', btn.parentNode).forEach(function (b) { b.classList.remove('on'); });
    btn.classList.add('on');
    answers[S.name] = o.value;
    if (o.score) answers[S.name + '_score'] = o.score;
    setTimeout(next, 260);               /* let the tick land before moving */
  });

  /* ── submit ─────────────────────────────────────────────────────────────*/
  function submit() {
    var nameF  = $('#f-name'),  nameI  = $('#lp-name');
    var phoneF = $('#f-phone'), phoneI = $('#lp-phone');
    var consF  = $('#f-consent'), consI = $('#lp-consent');
    var consErr = $('#consent-err');

    var ok = true;
    nameF.classList.remove('bad'); phoneF.classList.remove('bad');
    consF.classList.remove('bad'); consErr.style.display = 'none';

    if (!nameI.value.trim()) { nameF.classList.add('bad'); ok = false; }
    /* SG mobiles are 8 digits and start 8 or 9; allow +65 and spacing */
    var digits = phoneI.value.replace(/[^\d]/g, '').replace(/^65/, '');
    if (!/^[89]\d{7}$/.test(digits)) { phoneF.classList.add('bad'); ok = false; }
    if (!consI.checked) { consF.classList.add('bad'); consErr.style.display = 'block'; ok = false; }
    if (!ok) return;

    /* fill the real <form> Netlify registered at build time */
    F.steps.forEach(function (S) {
      if (!S.name) return;
      var v = answers[S.name];
      var f = form.querySelector('[name="' + S.name + '"]');
      if (f) f.value = Array.isArray(v) ? v.join(', ') : (v == null ? '' : v);
    });
    score = Object.keys(answers).reduce(function (a, k) {
      return a + (/_score$/.test(k) ? answers[k] : 0);
    }, 0);
    form.querySelector('[name="lead_score"]').value = score;
    form.querySelector('[name="priority"]').value = score >= 10 ? 'HOT' : score >= 6 ? 'WARM' : 'COOL';
    form.querySelector('[name="name"]').value    = nameI.value.trim();
    form.querySelector('[name="phone"]').value   = phoneI.value.trim();
    form.querySelector('[name="consent"]').value = 'yes';
    if (F.extra) F.extra(form, answers);

    nextB.classList.add('busy');
    nextB.textContent = 'Sending\u2026';

    dl.push({ event: 'generate_lead', funnel: F.name, lead_score: score });

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function () { show('done', 'fwd'); })
      .catch(function () { show('done', 'fwd'); });   /* never trap the lead on an error screen */
  }

  nextB.addEventListener('click', next);
  backB.addEventListener('click', back);
  stepsEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && cur !== 'done' && F.steps[cur].type === 'form') { e.preventDefault(); submit(); }
  });

  /* ── the count-up ────────────────────────────────────────────────────────
     A number that lands instantly is just text. A number that CLIMBS is an
     event — the prospect watches their own gap being assembled in front of
     them. This is the one flourish on these pages that is doing real work, so
     it is the one that gets to be big. */
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el, to, dur, fmt) {
    if (REDUCED) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    var ease = function (t) { return 1 - Math.pow(1 - t, 4); };   /* fast, then settles */
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(to * ease(p));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* what a custom step (calc / slots) can call */
  var api = {
    countUp: countUp,
    reduced: REDUCED,
    set: function (k, v) { answers[k] = v; },
    next: next,
    enable: function (on) { nextB.disabled = !on; },
    answers: answers
  };
  window.FUNNEL_API = api;

  show(0, 'fwd');
})();
