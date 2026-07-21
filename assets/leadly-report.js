/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE ADVISER  ·  /assets/leadly-report.js
   The chat on the report page. It is primed with THIS prospect's analysis.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var R = window.__REPORT__;
  if (!R) return;

  var log = document.getElementById('log');
  var chips = document.getElementById('chips');
  var form = document.getElementById('askf');
  var input = document.getElementById('askq');
  var history = [];
  var busy = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function add(cls, html) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.innerHTML = html;
    log.appendChild(d);
    d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return d;
  }

  async function ask(q) {
    if (busy || !q.trim()) return;
    busy = true;
    chips.innerHTML = '';                      /* the suggestions have done their job */
    add('you', esc(q));
    input.value = '';
    var think = add('think', '<i></i><i></i><i></i> Reading your analysis\u2026');

    var out;
    try {
      var res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q, facts: R.facts, analysis: R.analysis,
          contact: R.contact, history: history, created: R.created
        })
      });
      out = await res.json();
    } catch (e) {
      out = { reply: "I couldn't reach the model. Book a call \u2014 a human will answer this better.", book: true };
    }

    think.remove();
    var m = add('ai', esc(out.reply));
    if (out.book) {
      m.insertAdjacentHTML('beforeend',
        '<div class="ask-book"><a class="btn btn-primary" href="https://www.leadly.sg/for/insurance"><span>Book a demo</span></a></div>');
    }
    history.push({ role: 'user', content: q });
    history.push({ role: 'assistant', content: out.reply });
    busy = false;
    input.focus();
  }

  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-q]');
    if (b) ask(b.dataset.q);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
})();
