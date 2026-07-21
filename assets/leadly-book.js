/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — BOOK A DEMO  ·  /assets/leadly-book.js

   Any element with data-book opens the modal. Three steps:
     1. pick a day     (real dates, weekdays only, from two days out)
     2. pick a time
     3. name, mobile, business name (OPTIONAL), PDPA consent

   ── WHY THE BUSINESS NAME IS OPTIONAL ────────────────────────────────────
   Because requiring it costs you bookings from exactly the people worth
   talking to — the principal poking around at 1am who hasn't decided to
   identify themselves yet. Ask for it. Don't gate on it.

   ── WHY THE FORM IS IN THE HTML ──────────────────────────────────────────
   Netlify registers form fields at BUILD time by parsing the static markup. A
   form assembled by JS at runtime is invisible to it and every booking is
   silently dropped. The <form> lives in the page; this file only fills it in.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SLOTS = ['9:30 AM', '11:00 AM', '2:00 PM', '4:30 PM'];
  var DOW   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MON   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var today = new Date(); today.setHours(0,0,0,0);
  var openFrom = new Date(today); openFrom.setDate(openFrom.getDate() + 2);
  var openTo   = new Date(today); openTo.setDate(openTo.getDate() + 28);

  /* KENNETH: wire this to the real diary before you run traffic. A slot that
     isn't actually free is worse than no calendar at all. */
  function isFree(d) {
    var wd = d.getDay();
    if (wd === 0 || wd === 6) return false;      /* weekdays only */
    return d >= openFrom && d <= openTo;
  }
  function fmtLong(d) { return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; }

  var scrim, modal, form, lastFocus;
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var picked = null, slot = null, step = 0;

  var CAL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';

  function build() {
    scrim = document.createElement('div');
    scrim.className = 'bk-scrim';
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.setAttribute('aria-label', 'Book a demo');
    scrim.innerHTML =
      '<div class="bk">' +
        '<div class="bk-top tex-dark">' +
          '<button class="bk-x" type="button" aria-label="Close">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
          '<div class="bk-eyebrow">Book a demo</div>' +
          '<h2>See the whole machine running.</h2>' +
          '<p>30 minutes, by call or video. We\u2019ll show you the qualifier, the WhatsApp ping and the dashboard on a real campaign.</p>' +
        '</div>' +

        '<div class="bk-body">' +
          '<div class="bk-step on" data-s="0">' +
            '<p class="bk-h">Pick a day.</p>' +
            '<p class="bk-sub">Weekdays. Move or cancel any time.</p>' +
            '<div class="bk-cal-head">' +
              '<div class="bk-month"></div>' +
              '<div class="bk-nav">' +
                '<button type="button" class="bk-prev" aria-label="Previous month">\u2039</button>' +
                '<button type="button" class="bk-next" aria-label="Next month">\u203a</button>' +
              '</div>' +
            '</div>' +
            '<div class="bk-dow"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>' +
            '<div class="bk-days"></div>' +
          '</div>' +

          '<div class="bk-step" data-s="1">' +
            '<div class="bk-when">' + CAL_ICON + '<span class="bk-when-t"></span></div>' +
            '<p class="bk-h">Pick a time.</p>' +
            '<p class="bk-sub">All times Singapore.</p>' +
            '<div class="bk-slots">' +
              SLOTS.map(function (s) { return '<button type="button" class="bk-slot">' + s + '</button>'; }).join('') +
            '</div>' +
          '</div>' +

          '<div class="bk-step" data-s="2">' +
            '<div class="bk-when">' + CAL_ICON + '<span class="bk-when-t2"></span></div>' +
            '<p class="bk-h">Who should we expect?</p>' +
            '<p class="bk-sub">The invite goes straight to you.</p>' +
            '<div class="bk-field" id="bk-f-name">' +
              '<label for="bk-name">Your name</label>' +
              '<input id="bk-name" type="text" autocomplete="name">' +
              '<div class="bk-err">Please enter your name.</div>' +
            '</div>' +
            '<div class="bk-field" id="bk-f-phone">' +
              '<label for="bk-phone">Mobile number</label>' +
              '<input id="bk-phone" type="tel" inputmode="tel" autocomplete="tel">' +
              '<div class="bk-err">Please enter a valid Singapore mobile number.</div>' +
            '</div>' +
            '<div class="bk-field">' +
              '<label for="bk-biz">Business name <i>\u2014 optional</i></label>' +
              '<input id="bk-biz" type="text" autocomplete="organization">' +
            '</div>' +
            '<label class="bk-consent" id="bk-f-consent">' +
              '<input id="bk-consent" type="checkbox">' +
              '<span>I agree to be contacted by Leadly by phone or WhatsApp about this demo. My details are handled in line with the PDPA and I can opt out any time.</span>' +
            '</label>' +
            '<p class="bk-legal">No sequence, no spam. One human, one call.</p>' +
          '</div>' +

          '<div class="bk-step" data-s="3">' +
            '<div class="bk-done">' +
              '<div class="bk-tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.4 4.4L19.5 7"/></svg></div>' +
              '<h3>You\u2019re booked in.</h3>' +
              '<p class="bk-done-t"></p>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="bk-foot">' +
          '<button type="button" class="bk-back" style="display:none">Back</button>' +
          '<button type="button" class="btn btn-primary bk-go"><span>Continue</span><i class="btn-ico" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(scrim);
    modal = scrim.querySelector('.bk');
    form  = document.getElementById('bk-form');

    scrim.querySelector('.bk-x').addEventListener('click', close);
    scrim.addEventListener('click', function (e) { if (e.target === scrim) close(); });
    scrim.querySelector('.bk-back').addEventListener('click', back);
    scrim.querySelector('.bk-go').addEventListener('click', next);
    scrim.querySelector('.bk-prev').addEventListener('click', function () { view.setMonth(view.getMonth() - 1); drawCal(); });
    scrim.querySelector('.bk-next').addEventListener('click', function () { view.setMonth(view.getMonth() + 1); drawCal(); });

    scrim.querySelector('.bk-days').addEventListener('click', function (e) {
      var b = e.target.closest('.bk-day[data-d]');
      if (!b) return;
      picked = new Date(view.getFullYear(), view.getMonth(), +b.dataset.d);
      drawCal();
      setTimeout(function () { show(1); }, 220);
    });
    scrim.querySelectorAll('.bk-slot').forEach(function (b) {
      b.addEventListener('click', function () {
        scrim.querySelectorAll('.bk-slot').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        slot = b.textContent;
        setTimeout(function () { show(2); }, 240);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!scrim.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && step === 2) { e.preventDefault(); next(); }
    });
    drawCal();
  }

  function drawCal() {
    var monthEl = scrim.querySelector('.bk-month');
    var daysEl  = scrim.querySelector('.bk-days');
    monthEl.textContent = MON[view.getMonth()] + ' ' + view.getFullYear();

    /* Monday-first grid. getDay() is Sunday-first, so shift it. Get this wrong
       and the dates land on the wrong weekday — which people do notice. */
    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var lead  = (first.getDay() + 6) % 7;
    var last  = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    var html = '';
    for (var b = 0; b < lead; b++) html += '<button type="button" class="bk-day" disabled></button>';
    for (var d = 1; d <= last; d++) {
      var dt = new Date(view.getFullYear(), view.getMonth(), d);
      var free = isFree(dt);
      var on = picked && dt.getTime() === picked.getTime();
      html += '<button type="button" class="bk-day' + (free ? ' free' : '') + (on ? ' on' : '') + '"' +
              (free ? ' data-d="' + d + '"' : ' disabled') + '>' + d + '</button>';
    }
    daysEl.innerHTML = html;
    scrim.querySelector('.bk-prev').disabled =
      view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth();
    scrim.querySelector('.bk-next').disabled = view > openTo;
  }

  function show(n) {
    step = n;
    scrim.querySelectorAll('.bk-step').forEach(function (s) { s.classList.toggle('on', +s.dataset.s === n); });
    var back = scrim.querySelector('.bk-back');
    var go   = scrim.querySelector('.bk-go');
    var foot = scrim.querySelector('.bk-foot');

    back.style.display = (n > 0 && n < 3) ? '' : 'none';
    foot.style.display = (n === 3) ? 'none' : 'flex';
    go.querySelector('span').textContent = (n === 2) ? 'Confirm my demo' : 'Continue';
    go.style.display = (n === 0 || n === 1) ? 'none' : '';   /* those steps advance on tap */

    if (picked) {
      var t = fmtLong(picked) + (slot ? ' \u00b7 ' + slot : '');
      var a = scrim.querySelector('.bk-when-t'), b2 = scrim.querySelector('.bk-when-t2');
      if (a) a.textContent = fmtLong(picked);
      if (b2) b2.textContent = t;
    }
    scrim.querySelector('.bk-body').scrollTop = 0;
  }

  function next() {
    if (step === 2) return submit();
    if (step < 2) show(step + 1);
  }
  function back() { if (step > 0) show(step - 1); }

  function submit() {
    var nf = scrim.querySelector('#bk-f-name'),  ni = scrim.querySelector('#bk-name');
    var pf = scrim.querySelector('#bk-f-phone'), pi = scrim.querySelector('#bk-phone');
    var bi = scrim.querySelector('#bk-biz');
    var cf = scrim.querySelector('#bk-f-consent'), ci = scrim.querySelector('#bk-consent');

    [nf, pf, cf].forEach(function (e) { e.classList.remove('bad'); });
    void scrim.offsetWidth;                            /* restart the shake */

    var ok = true;
    if (!ni.value.trim()) { nf.classList.add('bad'); ok = false; }
    /* SG mobiles: 8 digits, starting 8 or 9. Tolerate +65 and spacing. */
    var digits = pi.value.replace(/[^\d]/g, '').replace(/^65/, '');
    if (!/^[89]\d{7}$/.test(digits)) { pf.classList.add('bad'); ok = false; }
    if (!ci.checked) { cf.classList.add('bad'); ok = false; }
    if (!ok) return;

    var go = scrim.querySelector('.bk-go');
    go.classList.add('busy');
    go.querySelector('span').textContent = 'Booking\u2026';

    if (form) {
      form.querySelector('[name="name"]').value     = ni.value.trim();
      form.querySelector('[name="phone"]').value    = pi.value.trim();
      form.querySelector('[name="business"]').value = bi.value.trim();   /* may be empty — fine */
      form.querySelector('[name="date"]').value     = picked ? fmtLong(picked) : '';
      form.querySelector('[name="time"]').value     = slot || '';
      form.querySelector('[name="consent"]').value  = 'yes';
    }

    (window.dataLayer = window.dataLayer || []).push({
      event: 'book_demo', booking_date: picked ? fmtLong(picked) : '', booking_time: slot
    });

    var done = function () {
      scrim.querySelector('.bk-done-t').innerHTML =
        '<b>' + fmtLong(picked) + ' \u00b7 ' + slot + '</b><br>A confirmation and a calendar invite are on their way.';
      show(3);
      go.classList.remove('busy');
    };

    if (!form) return done();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(done).catch(done);        /* never strand the booking on an error screen */
  }

  function open() {
    if (!scrim) build();
    lastFocus = document.activeElement;
    picked = null; slot = null;
    view = new Date(today.getFullYear(), today.getMonth(), 1);
    scrim.querySelectorAll('.bk-slot').forEach(function (b) { b.classList.remove('on'); });
    scrim.querySelectorAll('.bk-field, .bk-consent').forEach(function (e) { e.classList.remove('bad'); });
    ['#bk-name', '#bk-phone', '#bk-biz'].forEach(function (s) { var e = scrim.querySelector(s); if (e) e.value = ''; });
    var c = scrim.querySelector('#bk-consent'); if (c) c.checked = false;
    drawCal();
    show(0);
    document.body.style.overflow = 'hidden';
    scrim.classList.add('on');
    setTimeout(function () { var f = scrim.querySelector('.bk-day.free'); if (f) f.focus(); }, 120);
  }

  function close() {
    scrim.classList.remove('on');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book]');
    if (!t) return;
    e.preventDefault();
    open();
  });

  window.LeadlyBook = { open: open, close: close };
})();
