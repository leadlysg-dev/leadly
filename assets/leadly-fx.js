/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE MOTION  ·  /assets/leadly-fx.js

   The page's small behaviours. Every one of them is off under
   prefers-reduced-motion, and every one degrades to "the thing is just there"
   if the script never runs — nothing here is load-bearing for content.

   1. SECTIONS RISE as they enter. Once. They do not re-animate on the way back
      up, because a page that keeps performing at you is exhausting.
   2. THE STAT FIGURES COUNT when they arrive. A number that appears is text; a
      number that climbs is an event.
   3. THE NAV CONDENSES on scroll and grows a shadow, so it detaches from the
      page rather than sitting on it.
   4. TILT on the dark cards — a couple of degrees, tracking the cursor. Enough
      to feel like glass. Not enough to notice.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED) return;                       /* everything below is decoration */

  /* ── 1 · reveal on entry ────────────────────────────────────────────────*/
  var RISE = [
    '.marquee', '.thesis', '#system .eyebrow', '#system .section-title', '#system .lead',
    '.sys-tabs', '.sys-body', '#qualifiers .eyebrow', '#qualifiers .section-title',
    '#qualifiers .lead', '.funnel-card', '#pricing .eyebrow', '#pricing .section-title',
    '#pricing .lead', '.price-line', '.cmp', '.ao', '#calculator .eyebrow',
    '#calculator .section-title', '#calculator .lead', '.q',
    '.promise .eyebrow', '.promise .statement', '.sci-card', '.sci-foot'
  ];
  var els = [];
  RISE.forEach(function (sel) {
    [].forEach.call(document.querySelectorAll(sel), function (e) { els.push(e); });
  });
  els.forEach(function (e) { e.classList.add('fx-rise'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        /* a stagger, but only within a group — siblings cascade, sections don't */
        var sibs = en.target.parentNode ? [].slice.call(en.target.parentNode.children) : [];
        var i = sibs.indexOf(en.target);
        var d = (en.target.classList.contains('sci-card') || en.target.classList.contains('funnel-card'))
          ? Math.max(0, i) * 70 : 0;
        setTimeout(function () { en.target.classList.add('fx-in'); }, d);
        io.unobserve(en.target);             /* once. never again. */
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  } else {
    els.forEach(function (e) { e.classList.add('fx-in'); });
  }

  /* IntersectionObserver only fires when an element CROSSES the threshold. Jump
     straight to #pricing — or scroll fast — and everything you flew past never
     intersects, so it stays at opacity 0 FOREVER. That is not a nice-to-have
     bug; an anchor link in the nav triggers it.
     So: on every scroll, anything already above the fold gets revealed. */
  function sweep() {
    var vh = window.innerHeight;
    for (var i = els.length - 1; i >= 0; i--) {
      var e = els[i];
      if (e.classList.contains('fx-in')) { els.splice(i, 1); continue; }
      if (e.getBoundingClientRect().top < vh * 0.94) e.classList.add('fx-in');
    }
  }
  var sweeping = false;
  window.addEventListener('scroll', function () {
    if (sweeping) return;
    sweeping = true;
    requestAnimationFrame(function () { sweep(); sweeping = false; });
  }, { passive: true });
  window.addEventListener('load', sweep);
  setTimeout(sweep, 400);

  /* ── 2 · the figures climb ──────────────────────────────────────────────*/
  function climb(el) {
    /* Read the TEXT NODE, not textContent. The "42hrs" card has its unit in a
       child <span class="u">, so textContent picks it up, and writing the tail
       back into the text node rendered "42hrshrs". Only the first text node is
       ours to animate. */
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    var raw = node.nodeValue.trim();
    var m = raw.match(/^([\d.,]+)(.*)$/);
    if (!m) return;
    var to = parseFloat(m[1].replace(/,/g, ''));
    if (!isFinite(to)) return;
    var tail = m[2];                          /* "×" or "%" — NOT the <span> */
    var dp = (m[1].split('.')[1] || '').length;
    var t0 = performance.now(), dur = 1100;
    var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var v = to * ease(p);
      node.nodeValue = (dp ? v.toFixed(dp) : Math.round(v)).toLocaleString('en-SG') + tail;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  var figs = [].slice.call(document.querySelectorAll('.sci-fig'));
  if (figs.length && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        climb(en.target);
        io2.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    figs.forEach(function (f) { io2.observe(f); });
  }

  /* ── 3 · the nav condenses ──────────────────────────────────────────────*/
  var nav = document.querySelector('.nav');
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('is-stuck', window.scrollY > 24);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 4 · the dark cards tilt ────────────────────────────────────────────*/
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    [].forEach.call(document.querySelectorAll('.funnel-card, .sci-card'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        card.style.transform =
          'perspective(900px) rotateY(' + (x * 3.2).toFixed(2) + 'deg) rotateX(' +
          (-y * 3.2).toFixed(2) + 'deg) translateY(-3px)';
        card.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }
})();
