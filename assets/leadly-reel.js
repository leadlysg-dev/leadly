/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE REEL  ·  /assets/leadly-reel.js

   Mounts every <div data-leadly-reel> on the page and fans a set of ad cards
   along a slow-turning arc.

   ── HOW TO PUT YOUR REAL CREATIVES IN ─────────────────────────────────────
   Define window.LEADLY_REEL BEFORE this script loads:

     window.LEADLY_REEL = [
       { img:'/assets/ads/retirement-01.jpg',
         kicker:'Retirement',
         line:'Are you on track to retire — or just hoping?',
         cta:'Free 2-min check' },
       ...
     ];

   `img` is the ad creative (portrait, roughly 4:5 or 2:3 — it is cover-fit).
   If `img` is missing, `art` (any CSS background value) is drawn instead, so
   the layout is right before your images land.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var R     = 640;    /* radius of the arc the cards ride on */
  var SPAN  = 15.5;   /* degrees between neighbouring cards  */
  var EDGE  = 62;     /* beyond this angle a card is gone    */
  var SPEED = 2.6;    /* degrees per second                  */

  var PLACEHOLDER = [
    { art:'linear-gradient(150deg,#F4C99B,#C97B3E)', kicker:'Retirement',        line:'Are you on track to retire \u2014 or just hoping?',            cta:'Free 2-min check' },
    { art:'linear-gradient(150deg,#0E2A47,#0055E8)', kicker:'Income protection', line:'If you couldn\u2019t work tomorrow, how long would you last?',  cta:'Find out' },
    { art:'linear-gradient(150deg,#1F3D2B,#4E8A5E)', kicker:'Legacy',            line:'Your CPF doesn\u2019t go where you think it does.',             cta:'Check yours' },
    { art:'linear-gradient(150deg,#3A2A45,#7B61FF)', kicker:'Critical illness',  line:'The bill arrives long before the recovery does.',                cta:'See the numbers' },
    { art:'linear-gradient(150deg,#4A1F1F,#C0392B)', kicker:'Winback',           line:'Still thinking it over? Most people are.',                       cta:'Pick up where you left off' },
    { art:'linear-gradient(150deg,#1C2333,#43506B)', kicker:'Advisors',          line:'Stop calling strangers.',                                        cta:'Book a demo' },
    { art:'linear-gradient(150deg,#5B4A22,#D4A62A)', kicker:'Annuity',           line:'What does S$4,000 a month actually cost you today?',             cta:'Work it out' },
    { art:'linear-gradient(150deg,#123A3A,#1D9E75)', kicker:'Pulse',             line:'One dashboard. Meta and Google. Live.',                          cta:'Try it free' }
  ];

  var PAUSE_ICON = '<rect x="2" y="1" width="3.4" height="12" rx="1"/><rect x="8.6" y="1" width="3.4" height="12" rx="1"/>';
  var PLAY_ICON  = '<path d="M3 1.5v11l9-5.5z"/>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function mount(host) {
    if (host._leadlyReel) return;
    host._leadlyReel = true;

    var ADS = (window.LEADLY_REEL && window.LEADLY_REEL.length) ? window.LEADLY_REEL : PLACEHOLDER;

    host.classList.add('reel');
    host.innerHTML =
      '<div class="reel-pivot"></div>' +
      '<div class="reel-transport">' +
        '<button class="reel-pause" type="button" aria-label="Pause the reel">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">' + PAUSE_ICON + '</svg>' +
        '</button>' +
        '<div class="reel-track"><div class="reel-bar"></div></div>' +
      '</div>';

    var pivot = host.querySelector('.reel-pivot');
    var bar   = host.querySelector('.reel-bar');
    var pause = host.querySelector('.reel-pause');
    var icon  = pause.querySelector('svg');

    var cards = ADS.map(function (ad) {
      var c = document.createElement('div');
      c.className = 'reel-card';
      var art = ad.img ? "url('" + ad.img + "') center/cover no-repeat" : (ad.art || 'var(--panel-2)');
      c.innerHTML =
        '<div class="art" style="background:' + art + '"></div>' +
        '<div class="copy">' +
          '<div class="kicker">' + esc(ad.kicker || '') + '</div>' +
          '<div class="line">' + esc(ad.line || '') + '</div>' +
          (ad.cta ? '<div class="btn-mini">' + esc(ad.cta) + '</div>' : '') +
        '</div>';
      pivot.appendChild(c);
      return c;
    });

    var TOTAL   = cards.length * SPAN;
    var offset  = 0;
    var running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var last    = performance.now();

    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (running) offset = (offset + SPEED * dt) % TOTAL;

      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var a = (i * SPAN - offset) % TOTAL;
        if (a >  TOTAL / 2) a -= TOTAL;
        if (a < -TOTAL / 2) a += TOTAL;

        var k = Math.abs(a) / EDGE;
        if (k > 1) { c.style.opacity = '0'; continue; }

        var depth = 1 - Math.pow(k, 1.6) * 0.30;   /* the far side sits back  */
        var fade  = 1 - Math.pow(k, 3.2);          /* ...and dims             */

        c.style.opacity = fade.toFixed(3);
        c.style.zIndex  = String(100 - Math.round(Math.abs(a)));
        /* ride the arc, then counter-rotate 55% so the cards fan, not spin */
        c.style.transform =
          'rotate(' + a.toFixed(2) + 'deg) translateY(' + (-R) + 'px) ' +
          'rotate(' + (-a * 0.55).toFixed(2) + 'deg) scale(' + depth.toFixed(3) + ')';
      }

      bar.style.width = ((offset / TOTAL) * 100).toFixed(2) + '%';
      requestAnimationFrame(frame);
    }

    pause.addEventListener('click', function () {
      running = !running;
      pause.setAttribute('aria-label', running ? 'Pause the reel' : 'Play the reel');
      icon.innerHTML = running ? PAUSE_ICON : PLAY_ICON;
    });
    if (!running) icon.innerHTML = PLAY_ICON;

    requestAnimationFrame(frame);
  }

  function init() {
    var hosts = document.querySelectorAll('[data-leadly-reel]');
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LeadlyReel = { mount: mount };
})();
