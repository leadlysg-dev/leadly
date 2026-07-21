/* ═══════════════════════════════════════════════════════════════════════
   LEADLY — THE PROCESS  ·  /assets/leadly-process.js
   The six-step end-to-end process rail. Converted from the design-canvas
   export to plain DOM: click a step, get its deliverables in a modal.
   Markup lives in the page; this file owns the data and the interaction.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STEPS = [{"title": "Creative · Advertising", "deliverables": [{"t": "Ad concept and copywriting", "d": ""}, {"t": "Batch of 10 creatives per month", "d": ""}, {"t": "Landing offer definition", "d": ""}, {"t": "Weekly creative refresh cadence", "d": ""}, {"t": "Setup and configuration of ad accounts", "d": ""}, {"t": "Ad management", "d": ""}, {"t": "Pixel tracking", "d": ""}, {"t": "Creative A/B testing framework", "d": ""}]}, {"title": "Smart Qualifier · Landing page", "deliverables": [{"t": "Full landing page design", "d": ""}, {"t": "Brand-matched page design", "d": ""}, {"t": "Multi-step form engine", "d": ""}, {"t": "Scoring rules and logic", "d": ""}, {"t": "Mobile-first responsive build", "d": ""}, {"t": "Sub-2s page load / CDN hosting", "d": ""}]}, {"title": "Instant Ping · WhatsApp", "deliverables": [{"t": "WhatsApp Business API integration", "d": ""}, {"t": "Webhook-triggered instant push", "d": ""}, {"t": "Lead handoff SLA (contact within minutes)", "d": ""}, {"t": "Group routing upon approval of official business account (OBA) for WhatsApp", "d": ""}]}, {"title": "Live Database · Google Sheet", "deliverables": [{"t": "Shared call-sheet ownership & permissions", "d": "A shared sheet with access set up correctly for your whole team."}, {"t": "Data fields tailored to your process", "d": "Columns matched to how your team actually works a lead, not a generic template."}, {"t": "Daily lead audit trail", "d": "A running log of every lead and answer, so nothing gets lost or double-counted."}, {"t": "Google Sheets API sync", "d": "Leads sync automatically — no copy-pasting from another system."}, {"t": "Real-time row append on qualification", "d": "New rows appear the second a lead qualifies, ready to action."}, {"t": "Keeps adding new rows automatically", "d": "The sheet never runs out of room — every new lead appends the next row on its own."}, {"t": "Automated backups", "d": "Your lead data is backed up automatically so it’s never at risk."}]}, {"title": "Call & Book", "onClient": true, "clientNote": "This part is on your team — speed to call is what makes or breaks the lead. Call as fast as you possibly can: leads contacted within 5 minutes are up to 21x more likely to convert than those contacted after 30, and if you wait past an hour your odds drop by roughly 10x. Treat the WhatsApp ping as a starting gun, not a to-do for later.", "deliverables": []}, {"title": "Ad Performance · Leadly Pulse", "deliverables": [{"t": "Access to Leadly Pulse (live performance dashboard)", "d": ""}, {"t": "Attribution and UTM tracking", "d": ""}, {"t": "Exportable reporting", "d": ""}, {"t": "API access", "d": ""}]}];

  var root = document.getElementById('process');
  if (!root) return;

  /* ── modal ─────────────────────────────────────────────────────────── */
  var modal, card, lastFocus;
  function esc(s){ return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function build(){
    modal = document.createElement('div');
    modal.className = 'lp-modal';
    modal.hidden = true;
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML = '<div class="lp-card" role="document"></div>';
    card = modal.firstChild;
    modal.addEventListener('click', function(e){ if (e.target === modal) close(); });
    document.body.appendChild(modal);
  }

  function open(i){
    var s = STEPS[i]; if (!s) return;
    if (!modal) build();
    var html = '<div class="lp-head"><h3>' + esc(s.title) + '</h3>' +
               '<button type="button" class="lp-x" aria-label="Close">\u00d7</button></div>';
    if (s.onClient && s.clientNote){
      html += '<div class="lp-note"><div class="lp-note-l">On your team</div>' +
              '<div class="lp-note-b">' + esc(s.clientNote) + '</div></div>';
    }
    if (s.deliverables && s.deliverables.length){
      html += '<div class="lp-dl-h">Deliverables</div><ul class="lp-dl">';
      s.deliverables.forEach(function(it){
        html += '<li><span class="lp-tick">\u2713</span><div><div class="t">' + esc(it.t) + '</div>' +
                (it.d ? '<div class="d">' + esc(it.d) + '</div>' : '') + '</div></li>';
      });
      html += '</ul>';
    }
    card.innerHTML = html;
    card.querySelector('.lp-x').addEventListener('click', close);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    card.querySelector('.lp-x').focus();
  }

  function close(){
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modal && !modal.hidden) close();
  });

  /* ── wire the six cards ────────────────────────────────────────────── */
  root.querySelectorAll('.lp-step').forEach(function(el){
    var i = +el.getAttribute('data-step');
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('aria-label', (STEPS[i] && STEPS[i].title || 'Step') + ' \u2014 see deliverables');
    el.addEventListener('click', function(){ open(i); });
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(i); }
    });
  });

  /* ── the little confetti burst on the "Call & Book" screen ─────────── */
  (function(){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function burst(cv){
      if(!cv || !cv.offsetWidth) return;
      var c=cv.getContext('2d'), W=cv.width=cv.offsetWidth, H=cv.height=cv.offsetHeight;
      var colors=['#0055E8','#4D8CF0','#F5C451','#12805C','#E5688A','#FFFFFF'];
      var parts=[], cx=W/2, cy=H*0.4;
      for(var i=0;i<52;i++){ var a=(Math.PI*2*i)/52, sp=1.3+Math.random()*2.9; parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,col:colors[i%colors.length],life:1,sz:1.3+Math.random()*1.9}); }
      (function frame(){ c.clearRect(0,0,W,H); var alive=false; for(var i=0;i<parts.length;i++){ var p=parts[i]; p.vy+=0.05; p.vx*=0.98; p.vy*=0.98; p.x+=p.vx; p.y+=p.vy; p.life-=0.02; if(p.life>0){ alive=true; c.globalAlpha=Math.max(0,p.life); c.fillStyle=p.col; c.beginPath(); c.arc(p.x,p.y,p.sz,0,6.28); c.fill(); } } c.globalAlpha=1; if(alive) requestAnimationFrame(frame); else c.clearRect(0,0,W,H); })();
    }
    function init(){ var cv=document.querySelector('.j-fw'); if(!cv){ setTimeout(init,300); return; } burst(cv); setInterval(function(){ burst(cv); },5000); }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  })();
})();
