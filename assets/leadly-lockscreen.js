/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE LOCK SCREEN  ·  /assets/leadly-lockscreen.js

   Mounts every <div data-leadly-lock>. Qualified leads arrive in the team's
   WhatsApp group and land on the lock screen, newest first. The handset buzzes
   as each one drops.

   Needs leadly-components.css (.phone / .screen / .gloss / .island) and
   leadly-lockscreen.css.

   ── EDIT THE LEADS ────────────────────────────────────────────────────────
   Define window.LEADLY_LOCK_LEADS before this script loads:

     window.LEADLY_LOCK_LEADS = [
       { name:'Jasmine T.', line:'Income protection · S$100–300/mo · this month' },
       ...
     ];

   Illustrative examples of what a delivered lead looks like. Not real people.
   Keep it that way.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var INTERVAL = 2600;   /* ms between arrivals */
  var MAX      = 4;      /* notifications held on screen */
  var GROUP    = 'Leadly \u00b7 New Leads';   /* the WhatsApp group they land in */

  /* Each lead is three fields, so the notification can lay them out in three
     tidy rows instead of one long sentence that truncates:
       name   — WHO. the thing an advisor scans for
       want   — WHAT they asked about
       detail — the qualifying answer (budget, timing, situation)
     Illustrative examples, not real people. Keep them that way. */
  var DEFAULT_LEADS = [
    { name: 'Jasmine T.', want: 'Income protection', detail: 'S$100\u2013300/mo \u00b7 starting this month' },
    { name: 'Daniel L.',  want: 'Retirement',        detail: 'S$4\u20136k/mo wanted \u00b7 ready now' },
    { name: 'Ridwan K.',  want: 'Family cover',      detail: 'S$300+/mo \u00b7 starting this month' },
    { name: 'Chloe S.',   want: 'Critical illness',  detail: 'Has basic cover \u00b7 reviewing' },
    { name: 'Wei Lin',    want: 'Legacy / CPF',      detail: 'Nomination unclear \u00b7 ready in 60 days' },
    { name: 'Arjun P.',   want: 'Income protection', detail: 'Sole earner \u00b7 ready now' },
    { name: 'Nadia H.',   want: 'Annuity',           detail: 'S$500/mo \u00b7 starting this month' },
    { name: 'Marcus C.',  want: 'Retirement',        detail: 'No plan in place \u00b7 ready now' }
  ];

  /* WhatsApp's mark, drawn as a path. It appears because the product genuinely
     delivers into WhatsApp — this depicts the integration, nothing more. */
  var WA_GLYPH =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="#fff" d="M12.04 2A9.9 9.9 0 0 0 2.13 11.9c0 1.75.46 3.46 1.34 4.97L2 22.4l5.66-1.45a9.86 9.86 0 0 0 4.38 1.03h.01a9.9 9.9 0 0 0 9.9-9.9A9.9 9.9 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.36.86.9-3.27-.2-.32a8.2 8.2 0 1 1 7.15 4.06Zm4.5-6.14c-.24-.13-1.45-.72-1.68-.8-.23-.08-.4-.13-.56.12s-.64.8-.79.97c-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-1.98-1.22 7.42 7.42 0 0 1-1.37-1.7c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.24-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.62 4.15 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.45-.6 1.65-1.17.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.46-.29Z"/>' +
    '</svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  /* the real local time, so it never looks like a static mock-up */
  function clockNow() {
    var d = new Date();
    return (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function dateNow() {
    return new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function mount(host) {
    if (host._leadlyLock) return;
    host._leadlyLock = true;

    var LEADS = (window.LEADLY_LOCK_LEADS && window.LEADLY_LOCK_LEADS.length)
      ? window.LEADLY_LOCK_LEADS : DEFAULT_LEADS;

    host.classList.add('lockscreen');
    host.innerHTML =
      '<div class="phone">' +
        '<div class="screen">' +
          '<div class="ls-time">' +
            '<span class="ls-date">' + esc(dateNow()) + '</span>' +
            '<span class="ls-clock">' + esc(clockNow()) + '</span>' +
          '</div>' +
          '<div class="ls-notes" role="log" aria-live="polite" aria-label="Incoming qualified leads"></div>' +
          '<div class="ls-foot"><div class="ls-bar"></div></div>' +
          '<div class="gloss"></div>' +
        '</div>' +
        '<div class="island"><i></i></div>' +
        '<div class="btn-vol"></div><div class="btn-vol b2"></div><div class="btn-pow"></div>' +
      '</div>';

    var notes = host.querySelector('.ls-notes');
    var phone = host.querySelector('.phone');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var i = 0;

    /* Back-compat: an old-style { name, line } lead still works — we split the
       first "·" off to fill want/detail. */
    function normalise(lead) {
      if (lead.want || lead.detail) return lead;
      var bits = String(lead.line || '').split('\u00b7');
      return {
        name: lead.name,
        want: (bits.shift() || '').trim(),
        detail: bits.join('\u00b7').trim()
      };
    }

    function noteEl(raw, isNew) {
      var lead = normalise(raw);
      var el = document.createElement('div');
      el.className = 'ls-note' + (isNew ? ' is-new' : '');
      el.innerHTML =
        '<span class="ls-app">' + WA_GLYPH + '</span>' +
        '<span class="ls-body">' +
          '<span class="ls-row">' +
            '<span class="ls-name">' + esc(GROUP) + '</span>' +
            '<span class="ls-ago">now</span>' +
          '</span>' +
          '<span class="ls-title">' +
            '<b>' + esc(lead.name) + '</b>' +
            (lead.want ? '<span class="sep">\u00b7</span><span class="want">' + esc(lead.want) + '</span>' : '') +
          '</span>' +
          '<span class="ls-text">' + esc(lead.detail || '') + '</span>' +
        '</span>';
      return el;
    }

    function age() {
      var all = notes.querySelectorAll('.ls-note .ls-ago');
      for (var n = 1; n < all.length; n++) all[n].textContent = n + 'm ago';
    }

    function push() {
      notes.insertBefore(noteEl(LEADS[i % LEADS.length], !reduced), notes.firstChild);
      i++;
      age();

      if (!reduced && phone) {
        phone.classList.remove('is-buzz');
        void phone.offsetWidth;            /* restart the keyframes */
        phone.classList.add('is-buzz');
      }

      var all = notes.querySelectorAll('.ls-note');
      if (all.length > MAX) {
        var last = all[all.length - 1];
        if (reduced) last.remove();
        else {
          last.classList.add('is-out');
          setTimeout(function () { last.remove(); }, 380);
        }
      }
    }

    if (reduced) {
      for (var k = 0; k < MAX; k++) push();
      return;
    }

    push();
    var timer = null;
    function start() { if (!timer) timer = setInterval(push, INTERVAL); }
    function stop()  { clearInterval(timer); timer = null; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0.15 }).observe(host);
    } else start();

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  function init() {
    var hosts = document.querySelectorAll('[data-leadly-lock]');
    for (var n = 0; n < hosts.length; n++) mount(hosts[n]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LeadlyLock = { mount: mount };
})();
