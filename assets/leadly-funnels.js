/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE SMART QUALIFIERS  ·  /assets/leadly-funnels.js

   Three insurance funnels, each running live on a phone. They loop, they pause
   when off-screen, and they respect prefers-reduced-motion.

     quiz   The Questionnaire     — filters on need, cover and timing
     gap    The Gap Calculator    — turns a vague worry into a dollar figure
     book   The Booking Calendar  — puts a time in the advisor's diary

   Markup:  <div data-leadly-funnel="quiz"></div>

   NOTE ON THE NUMBERS. The Gap Calculator uses a stated rule of thumb — ten
   years of income — and shows it on screen. It is not a real actuarial figure
   and does not pretend to be. If you swap in a different rule, change the
   caption too.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, REDUCED ? Math.min(ms, 200) : ms); }); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  function countTo(el, from, to, dur, fmt) {
    return new Promise(function (res) {
      if (REDUCED) { el.textContent = fmt(to); return res(); }
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(from + (to - from) * easeOut(p));
        p < 1 ? requestAnimationFrame(step) : res();
      })(t0);
    });
  }

  var money = function (n) { return 'S$' + Math.round(n).toLocaleString('en-SG'); };

  /* ═══ 1 · THE QUESTIONNAIRE ═══════════════════════════════════════════════ */

  var QUIZ = [
    { q: 'Do you have critical illness cover today?',
      hint: 'Anything beyond what your employer provides.',
      opts: ['No, nothing', 'Only through work', 'Yes, a private policy'], pick: 1 },
    { q: 'If you couldn\u2019t work for 12 months, could you cover the bills?',
      hint: 'Mortgage, school fees, everything.',
      opts: ['Comfortably', 'For a few months', 'No \u2014 not for long'], pick: 2 },
    { q: 'Who depends on your income?',
      hint: 'Select the closest.',
      opts: ['Just me', 'Partner', 'Partner and children'], pick: 2 },
    { q: 'What could you set aside each month?',
      hint: 'A rough range is fine.',
      opts: ['Under S$100', 'S$100 \u2013 300', 'S$300+'], pick: 1 },
    { q: 'When would you want this sorted?',
      hint: 'Be honest \u2014 it changes who calls you.',
      opts: ['This month', 'This quarter', 'Just looking'], pick: 0 }
  ];

  var QUIZ_MARKUP =
    '<div class="phone"><div class="screen">' +
      '<div class="fn-top">' +
        '<div class="fn-brand">' +
          '<span class="fn-dot"></span>' +
          '<span class="fn-title">Critical illness check</span>' +
          '<span class="fn-step">1 / 5</span>' +
        '</div>' +
        '<div class="fn-bar"><i></i></div>' +
      '</div>' +
      '<div class="fn-body"><div class="fq-card">' +
        '<p class="fq-q"></p><p class="fq-hint"></p><div class="fq-opts"></div>' +
      '</div></div>' +
      '<div class="fn-foot">Free 2-minute check \u00b7 No obligation</div>' +
    '</div></div>';

  async function runQuiz(root, alive) {
    var card = root.querySelector('.fq-card');
    var qEl  = root.querySelector('.fq-q');
    var hEl  = root.querySelector('.fq-hint');
    var oEl  = root.querySelector('.fq-opts');
    var step = root.querySelector('.fn-step');
    var bar  = root.querySelector('.fn-bar i');
    var foot = root.querySelector('.fn-foot');

    while (alive()) {
      foot.textContent = 'Free 2-minute check \u00b7 No obligation';
      foot.style.color = '';

      for (var i = 0; i < QUIZ.length; i++) {
        if (!alive()) return;
        var Q = QUIZ[i];

        card.style.opacity = 0;
        card.style.transform = 'translateX(14px)';
        await wait(180);
        if (!alive()) return;

        step.textContent = (i + 1) + ' / ' + QUIZ.length;
        bar.style.width = ((i + 1) / QUIZ.length * 100) + '%';
        qEl.textContent = Q.q;
        hEl.textContent = Q.hint;
        oEl.innerHTML = Q.opts.map(function (o) {
          return '<div class="fq-opt"><span class="rd"></span><span class="lb">' + o + '</span></div>';
        }).join('');

        card.style.opacity = 1;
        card.style.transform = 'translateX(0)';

        await wait(900);
        if (!alive()) return;
        var chosen = oEl.children[Q.pick];
        if (chosen) chosen.classList.add('on');
        await wait(700);
      }

      if (!alive()) return;
      foot.textContent = '\u2713 Qualified \u2014 sending to an advisor';
      foot.style.color = 'var(--accent)';
      await wait(2200);
    }
  }

  /* ═══ 2 · THE GAP CALCULATOR ══════════════════════════════════════════════ */

  var INCOME = 8500, YEARS = 10, HAVE = 150000;
  var NEED = INCOME * 12 * YEARS;          /* 1,020,000 */
  var GAP  = NEED - HAVE;                  /*   870,000 */

  var GAP_MARKUP =
    '<div class="phone"><div class="screen">' +
      '<div class="fn-top">' +
        '<div class="fn-brand">' +
          '<span class="fn-dot"></span>' +
          '<span class="fn-title">Coverage gap check</span>' +
          '<span class="fn-step">3 / 3</span>' +
        '</div>' +
        '<div class="fn-bar"><i></i></div>' +
      '</div>' +
      '<div class="fn-body"><div class="fg-wrap">' +
        '<div class="fg-fields">' +
          '<div class="fg-field" data-f="0"><div class="fg-label">Monthly income</div><div class="fg-value">S$0</div></div>' +
          '<div class="fg-field" data-f="1"><div class="fg-label">People who depend on it</div><div class="fg-value">0</div></div>' +
          '<div class="fg-field" data-f="2"><div class="fg-label">Cover you already have</div><div class="fg-value">S$0</div></div>' +
        '</div>' +
        '<div class="fg-result">' +
          '<div class="fg-rows">' +
            '<div class="fg-row">' +
              '<div class="fg-rl"><span>What your family would need</span><b class="fg-need">S$0</b></div>' +
              '<div class="fg-track"><div class="fg-fill need"></div></div>' +
            '</div>' +
            '<div class="fg-row">' +
              '<div class="fg-rl"><span>What they\u2019d actually get</span><b class="fg-have">S$0</b></div>' +
              '<div class="fg-track"><div class="fg-fill have"></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="fg-gap"><div class="gl">The gap</div><div class="gv">S$0</div></div>' +
          '<p class="fg-note">Rule of thumb: ten years of income. Your advisor will work out the real figure with you.</p>' +
        '</div>' +
        '<div class="fg-cta">See how to close it</div>' +
      '</div></div>' +
      '<div class="fn-foot">Takes 60 seconds \u00b7 No obligation</div>' +
    '</div></div>';

  async function runGap(root, alive) {
    var fields = root.querySelectorAll('.fg-field');
    var vals   = root.querySelectorAll('.fg-value');
    var bar    = root.querySelector('.fn-bar i');
    var result = root.querySelector('.fg-result');
    var needB  = root.querySelector('.fg-need');
    var haveB  = root.querySelector('.fg-have');
    var needF  = root.querySelector('.fg-fill.need');
    var haveF  = root.querySelector('.fg-fill.have');
    var gapV   = root.querySelector('.fg-gap .gv');
    var cta    = root.querySelector('.fg-cta');

    while (alive()) {
      /* reset */
      fields.forEach(function (f) { f.classList.remove('on'); });
      vals[0].textContent = 'S$0'; vals[1].textContent = '0'; vals[2].textContent = 'S$0';
      result.classList.remove('on'); cta.classList.remove('on');
      needF.style.width = '0'; haveF.style.width = '0';
      needB.textContent = 'S$0'; haveB.textContent = 'S$0'; gapV.textContent = 'S$0';
      bar.style.width = '0';
      await wait(700);
      if (!alive()) return;

      /* the three inputs land one by one */
      fields[0].classList.add('on'); bar.style.width = '33%';
      await countTo(vals[0], 0, INCOME, 700, money);
      await wait(320); if (!alive()) return;

      fields[1].classList.add('on'); bar.style.width = '66%';
      await countTo(vals[1], 0, 3, 400, function (v) { return Math.round(v); });
      await wait(320); if (!alive()) return;

      fields[2].classList.add('on'); bar.style.width = '100%';
      await countTo(vals[2], 0, HAVE, 700, money);
      await wait(520); if (!alive()) return;

      /* the answer */
      result.classList.add('on');
      await wait(180);
      needF.style.width = '100%';
      haveF.style.width = (HAVE / NEED * 100).toFixed(1) + '%';
      countTo(needB, 0, NEED, 1100, money);
      countTo(haveB, 0, HAVE, 1100, money);
      await wait(900); if (!alive()) return;

      await countTo(gapV, 0, GAP, 1000, money);
      cta.classList.add('on');
      await wait(3400);
    }
  }

  /* ═══ 3 · THE BOOKING CALENDAR ════════════════════════════════════════════ */

  /* July 2026 begins on a WEDNESDAY, so the grid is padded with TWO blanks,
     not three. Get this wrong and the 17th lands on a Saturday while the
     confirmation card says Friday — the kind of detail a prospect notices even
     if they can't say why the page felt off.
     Free days are weekdays only: Thu 16, Fri 17, Mon 20, Tue 21, Wed 22, Thu 23. */
  var FREE_DAYS = [16, 17, 20, 21, 22, 23];
  var PICK_DAY  = 17;                       /* Friday 17 July 2026 */
  var SLOTS     = ['9:30 AM', '11:30 AM', '2:00 PM', '4:30 PM'];
  var PICK_SLOT = 1;

  var BOOK_MARKUP = (function () {
    /* a plain month grid. 1st falls on a Wednesday, 31 days. */
    var cells = '';
    for (var b = 0; b < 2; b++) cells += '<div class="fb-day mute"></div>';   /* 1 Jul = Wed */
    for (var d = 1; d <= 31; d++) {
      var cls = 'fb-day' + (FREE_DAYS.indexOf(d) > -1 ? ' free' : (d < 15 ? ' mute' : ''));
      cells += '<div class="' + cls + '" data-d="' + d + '">' + d + '</div>';
    }
    return '<div class="phone"><div class="screen">' +
      '<div class="fn-top">' +
        '<div class="fn-brand">' +
          '<span class="fn-dot"></span>' +
          '<span class="fn-title">Book your advisor</span>' +
          '<span class="fn-step">Last step</span>' +
        '</div>' +
        '<div class="fn-bar"><i style="width:100%"></i></div>' +
      '</div>' +
      '<div class="fn-body">' +
        '<div class="fb-wrap">' +
          '<div class="fb-month">July 2026</div>' +
          '<div class="fb-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>' +
          '<div class="fb-days">' + cells + '</div>' +
          '<div class="fb-slots">' +
            '<div class="sh">Available times</div>' +
            '<div class="fb-slot-row">' +
              SLOTS.map(function (s) { return '<div class="fb-slot">' + s + '</div>'; }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fb-done">' +
          '<div class="fb-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></div>' +
          '<div class="dt">You\u2019re booked in.</div>' +
          '<div class="dw">Friday 17 July \u00b7 11:30 AM<br>A calendar invite is on its way.</div>' +
          '<div class="fb-adv">' +
            '<span class="av">MT</span>' +
            '<span class="an">Marcus Tan<small>Your advisor</small></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="fn-foot">30 minutes \u00b7 No obligation</div>' +
    '</div></div>';
  })();

  async function runBook(root, alive) {
    var days  = root.querySelectorAll('.fb-day[data-d]');
    var slots = root.querySelector('.fb-slots');
    var slotEls = root.querySelectorAll('.fb-slot');
    var done  = root.querySelector('.fb-done');

    while (alive()) {
      days.forEach(function (d) { d.classList.remove('on'); });
      slotEls.forEach(function (s) { s.classList.remove('on'); });
      slots.classList.remove('on');
      done.classList.remove('on');
      await wait(900);
      if (!alive()) return;

      /* the date */
      for (var i = 0; i < days.length; i++) {
        if (+days[i].dataset.d === PICK_DAY) { days[i].classList.add('on'); break; }
      }
      await wait(520); if (!alive()) return;

      /* the times appear */
      slots.classList.add('on');
      await wait(900); if (!alive()) return;

      slotEls[PICK_SLOT].classList.add('on');
      await wait(750); if (!alive()) return;

      done.classList.add('on');
      await wait(3400);
    }
  }

  /* ═══ MOUNT ═══════════════════════════════════════════════════════════════ */

  var FUNNELS = {
    quiz: { markup: QUIZ_MARKUP, run: runQuiz },
    gap:  { markup: GAP_MARKUP,  run: runGap  },
    book: { markup: BOOK_MARKUP, run: runBook }
  };

  function mount(el) {
    if (el._leadlyFunnel) return;
    var key = el.dataset.leadlyFunnel;
    var F = FUNNELS[key];
    if (!F) return;
    el._leadlyFunnel = true;

    el.classList.add('funnel-phone');
    el.innerHTML = F.markup;

    var ph = el.querySelector('.phone');
    ph.insertAdjacentHTML('beforeend', '<div class="island"><i></i></div>');
    el.querySelector('.screen').insertAdjacentHTML('beforeend', '<div class="gloss"></div>');

    /* only run while on screen — three loops on a page is enough to matter */
    var visible = true;
    if ('IntersectionObserver' in window) {
      visible = false;
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; },
        { threshold: 0.12 }).observe(el);
    }
    var alive = function () { return visible && !document.hidden; };

    /* the runners await; if we go off-screen they idle rather than spin */
    (async function loop() {
      while (true) {
        if (alive()) { try { await F.run(el, alive); } catch (e) { /* keep the page up */ } }
        await new Promise(function (r) { setTimeout(r, 400); });
      }
    })();
  }

  function init() {
    var els = document.querySelectorAll('[data-leadly-funnel]');
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LeadlyFunnel = { mount: mount };
})();
