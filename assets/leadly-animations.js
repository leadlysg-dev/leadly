/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — ANIMATION COMPONENTS  ·  /assets/leadly-animations.js
   Self-contained, reusable demo animations. Paired with leadly-animations.css.
   Canonical home: /animations. Any page drops a mount point and this script:

     <link rel="stylesheet" href="/assets/brand.css">
     <link rel="stylesheet" href="/assets/leadly-animations.css">
     <div data-leadly-anim="instant-ping"></div>
     <script src="/assets/leadly-animations.js"></script>

   Each component renders its own markup (no forking) and exposes a controller
   at el._leadly = { play, stop, name }. LeadlyAnim.replay(el) restarts it.

   ── FIDELITY ────────────────────────────────────────────────────────────────
   The runner SEQUENCES are the exact scripts from /for/insurance — same
   narrative, copy, timing and beats. The only edits are a restyle (off-brand
   blues → green tokens; confetti palette) and a harness hook so replay can
   stop a running loop (`while (true)` → `while (inst.alive)`, and the hero feed
   scopes to its mount and stores its timers). Nothing about what each animation
   says, shows or sequences changed.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var wait = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
var ease = function(t){ return 1 - Math.pow(1 - t, 3); };

function countTo(el, from, to, dur, fmt){
  fmt = fmt || function(v){ return Math.round(v); };
  return new Promise(function(res){
    var t0 = performance.now();
    (function step(now){
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(from + (to - from) * ease(p));
      p < 1 ? requestAnimationFrame(step) : res();
    })(t0);
  });
}

/* confetti burst — canvas, brand palette only (green · ink · white) */
function burst(canvas, originY){
  originY = originY == null ? .55 : originY;
  var c = canvas.getContext('2d');
  var W = canvas.width = canvas.offsetWidth, H = canvas.height = canvas.offsetHeight;
  var colors = ['#2FB985', '#147A54', '#0C111D', '#A0D9BF', '#FFFFFF'];
  var bits = [];
  for (var i = 0; i < 90; i++){
    var a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 7.5;
    bits.push({
      x: W / 2, y: H * originY,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
      w: 3 + Math.random() * 5, h: 5 + Math.random() * 7,
      rot: Math.random() * 6.28, vr: (Math.random() - .5) * .35,
      col: colors[(Math.random() * colors.length) | 0], life: 1
    });
  }
  var raf;
  (function frame(){
    c.clearRect(0, 0, W, H);
    var alive = false;
    bits.forEach(function(b){
      b.vy += .17; b.vx *= .992; b.x += b.vx; b.y += b.vy;
      b.rot += b.vr; b.life -= .0085;
      if (b.life > 0 && b.y < H + 30){
        alive = true;
        c.save();
        c.globalAlpha = Math.max(0, b.life);
        c.translate(b.x, b.y); c.rotate(b.rot);
        c.fillStyle = b.col;
        c.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        c.restore();
      }
    });
    if (alive) raf = requestAnimationFrame(frame);
    else c.clearRect(0, 0, W, H);
  })();
  return function(){ cancelAnimationFrame(raf); };
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATES — each component renders this markup into its mount element.
   Selectors match what the runners query. Device chrome + chat colours come
   from leadly-animations.css (scope + --chat-* tokens); only structure here.
   ═══════════════════════════════════════════════════════════════════════════ */
var T = {};

T['lead-feed'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="device-stage"><div class="device">' +
      '<div class="device-buttons"><i class="rail l la"></i><i class="rail l lb"></i><i class="rail l lc"></i><i class="rail r ra"></i></div>' +
      '<div class="device-frame"><div class="device-screen" style="background:var(--ui-bg)">' +
        '<div class="device-island"></div>' +
        '<div class="hf-head"><span class="hf-dot"></span> New qualified leads</div>' +
        '<div class="hf-clip"><div class="hf-list"></div></div>' +
        '<div class="hf-foot"><span class="hf-wa"></span> Auto-delivered to WhatsApp · ~8s</div>' +
      '</div></div>' +
    '</div></div>' +
  '</div>';

T['ad-reel'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="ad-reel"><div class="ad-pivot"></div></div>' +
  '</div>';

T['smart-qualifier'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="pair">' +
      '<div class="device-stage"><div class="device">' +
        '<div class="device-buttons"><i class="rail l la"></i><i class="rail l lb"></i><i class="rail l lc"></i><i class="rail r ra"></i></div>' +
        '<div class="device-frame"><div class="device-screen" style="background:var(--ui-bg)">' +
          '<div class="device-island"></div>' +
          '<div style="padding:40px 18px 12px;border-bottom:1px solid var(--ui-line);flex:none">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:13px">' +
              '<div style="width:18px;height:18px;border-radius:5px;background:var(--blue);flex:none"></div>' +
              '<span style="font-size:11.5px;font-weight:600;color:var(--ink);letter-spacing:-.01em">Retirement readiness check</span>' +
              '<span class="dq-step tick" style="margin-left:auto;font-size:10.5px;color:var(--mute)">1 / 6</span>' +
            '</div>' +
            '<div style="height:4px;border-radius:99px;background:var(--ui-line);overflow:hidden">' +
              '<div class="dq-bar" style="height:100%;width:17%;background:var(--blue);border-radius:99px;transition:width .55s cubic-bezier(.4,0,.2,1)"></div>' +
            '</div>' +
          '</div>' +
          '<div class="dq-body" style="flex:1;padding:20px 18px;position:relative;overflow:hidden">' +
            '<div class="dq-card" style="position:absolute;inset:20px 18px;transition:transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease">' +
              '<p class="dq-text" style="font-size:16.5px;font-weight:600;color:var(--ink);line-height:1.32;margin-bottom:6px;letter-spacing:-.01em"></p>' +
              '<p class="dq-hint" style="font-size:11.5px;color:var(--mute);line-height:1.4;margin-bottom:14px;min-height:0"></p>' +
              '<div class="dq-opts" style="display:flex;flex-direction:column;gap:8px"></div>' +
            '</div>' +
          '</div>' +
          '<div class="dq-foot" style="flex:none;padding:13px 18px 16px;border-top:1px solid var(--ui-line);text-align:center;font-size:10.5px;color:var(--mute)">Free 2-minute check · No obligation</div>' +
          '<canvas class="dq-fx" style="position:absolute;inset:0;pointer-events:none;z-index:15"></canvas>' +
        '</div></div>' +
      '</div></div>' +
      '<div class="readout" style="min-width:230px">' +
        '<p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink);font-weight:600">What your advisor<br>already knows</p>' +
        '<div class="dq-profile" style="display:flex;flex-direction:column;gap:9px"></div>' +
      '</div>' +
    '</div>' +
  '</div>';

T['instant-ping'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="pair">' +
      '<div class="device-stage"><div class="device">' +
        '<div class="device-buttons"><i class="rail l la"></i><i class="rail l lb"></i><i class="rail l lc"></i><i class="rail r ra"></i></div>' +
        '<div class="device-frame"><div class="device-screen" style="background:var(--chat-bg)">' +
          '<div class="device-island"></div>' +
          '<div class="chat-ui">' +
            '<div style="flex:none;background:var(--chat-head);padding:40px 14px 12px;display:flex;align-items:center;gap:10px">' +
              '<span style="color:#fff;font-size:18px;line-height:1;opacity:.7">&#8249;</span>' +
              '<div style="width:34px;height:34px;border-radius:50%;background:var(--chat-avatar);display:flex;align-items:center;justify-content:center;flex:none">' +
                '<span style="font-size:10px;font-weight:700;color:#fff">LDY</span></div>' +
              '<div style="min-width:0;flex:1">' +
                '<div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Leadly · New Leads</div>' +
                '<div style="font-size:10.5px;color:rgba(255,255,255,.66);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">You, Marcus, Priya, Wei Jie</div>' +
              '</div>' +
              '<span style="color:#fff;opacity:.6;font-size:15px">&#8942;</span>' +
            '</div>' +
            '<div class="p-thread" style="flex:1;min-height:0;padding:14px 12px;display:flex;flex-direction:column;gap:8px;justify-content:flex-end;overflow:hidden">' +
              '<div style="align-self:flex-start;max-width:78%;background:var(--chat-in);border-radius:12px 12px 12px 3px;padding:8px 10px;box-shadow:0 1px 2px rgba(16,24,40,.08)">' +
                '<div style="font-size:11px;font-weight:600;color:var(--chat-sender);margin-bottom:3px">Marcus</div>' +
                '<div style="font-size:12.5px;color:var(--chat-ink);line-height:1.35">Called the last one. Booked for Thursday 3pm 👍</div>' +
                '<div style="text-align:right;font-size:9.5px;color:var(--chat-meta);margin-top:3px">10:41</div>' +
              '</div>' +
              '<div style="align-self:flex-end;max-width:72%;background:var(--chat-out);border-radius:12px 12px 3px 12px;padding:8px 10px;box-shadow:0 1px 2px rgba(16,24,40,.08)">' +
                '<div style="font-size:12.5px;color:var(--chat-ink);line-height:1.35">Nice. Who\'s next up?</div>' +
                '<div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:3px">' +
                  '<span style="font-size:9.5px;color:var(--chat-meta)">10:42</span>' +
                  '<span style="font-size:10px;color:var(--chat-tick);line-height:1">✓✓</span></div>' +
              '</div>' +
              '<div class="p-card" style="align-self:flex-start;max-width:88%;background:var(--chat-in);border-radius:12px 12px 12px 3px;padding:0;overflow:hidden;box-shadow:0 2px 6px rgba(16,24,40,.10);opacity:0;transform:translateY(16px) scale(.94);transition:all .5s cubic-bezier(.34,1.5,.64,1)">' +
                '<div style="background:var(--accent);padding:7px 10px;display:flex;align-items:center;gap:6px">' +
                  '<div class="p-dot" style="width:6px;height:6px;border-radius:50%;background:#fff"></div>' +
                  '<span style="font-size:11px;font-weight:700;color:#fff;letter-spacing:.02em">NEW QUALIFIED LEAD</span></div>' +
                '<div style="padding:9px 10px 8px">' +
                  '<div style="font-size:11px;font-weight:600;color:var(--chat-name);margin-bottom:4px">Leadly Bot</div>' +
                  '<div style="font-size:12.5px;color:var(--chat-ink);line-height:1.45">' +
                    '<b>Jasmine T.</b> · 34<br>Wants: income protection<br>Budget: $100–300/mo<br>Start: this month<br>' +
                    '📞 <span style="color:var(--accent-ink);font-weight:600">+65 8••• ••••</span></div>' +
                  '<div style="text-align:right;font-size:9.5px;color:var(--chat-meta);margin-top:4px">10:42</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="flex:none;padding:8px 10px;display:flex;align-items:center;gap:8px">' +
              '<div style="flex:1;background:#fff;border:1px solid var(--ui-line);border-radius:99px;padding:8px 12px;font-size:12px;color:#9aa2ad">Message</div>' +
              '<div style="width:34px;height:34px;border-radius:50%;background:var(--chat-send);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">➤</div>' +
            '</div>' +
          '</div>' +
        '</div></div>' +
      '</div></div>' +
      '<div class="readout">' +
        '<div class="stat"><b class="tick p-timer">0.0s</b><span>Form → your group</span></div>' +
        '<div class="stat"><b>7&#215;</b><span>More likely to qualify</span></div>' +
        '<div style="font-size:12px;line-height:1.5;color:var(--w56);max-width:196px">Firms that make contact within the hour are nearly seven times as likely to qualify a lead as those that wait even an hour longer.<br><span style="opacity:.7">Harvard Business Review, 2011 &#183; audit of 2,241 companies</span></div>' +
      '</div>' +
    '</div>' +
  '</div>';

T['live-call-sheet'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="win shadow">' +
      '<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;background:#fff;border-bottom:1px solid #E0E0E0">' +
        '<div style="width:20px;height:24px;border-radius:3px;background:var(--gs-green);flex:none;display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px"><div style="width:11px;height:11px;border:1.5px solid #fff;border-radius:1px"></div></div>' +
        '<div><div style="font-size:12.5px;color:#202124;font-weight:500;line-height:1.2">Retirement Campaign — Call Sheet</div>' +
          '<div style="font-size:10px;color:#5F6368;margin-top:2px">File · Edit · View · Insert · Data</div></div>' +
        '<div style="margin-left:auto;display:flex;align-items:center;gap:7px">' +
          '<div class="s-pulse" style="width:7px;height:7px;border-radius:50%;background:var(--gs-green)"></div>' +
          '<span style="font-size:11px;color:var(--gs-green);font-weight:600">Live</span>' +
          '<div style="width:26px;height:26px;border-radius:50%;background:#D93025;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff">M</div>' +
          '<div style="width:26px;height:26px;border-radius:50%;background:#1A73E8;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff;margin-left:-12px">P</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;background:#F8F9FA;border-bottom:1px solid #E0E0E0;font-size:10px;color:#5F6368">' +
        '<div style="width:30px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0"></div>' +
        '<div style="width:112px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">A</div>' +
        '<div style="width:104px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">B</div>' +
        '<div style="flex:1;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">C</div>' +
        '<div style="width:96px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">D</div>' +
        '<div style="width:84px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">E</div>' +
        '<div style="width:88px;text-align:center;padding:3px 0">F</div>' +
      '</div>' +
      '<div style="display:flex;background:#E8F0FE;border-bottom:1px solid #C6DAFC;font-size:11px;font-weight:600;color:#1A3B6E">' +
        '<div style="width:30px;border-right:1px solid #E0E0E0;text-align:center;padding:7px 0;background:#F8F9FA;color:#5F6368;font-weight:400">1</div>' +
        '<div style="width:112px;border-right:1px solid #E0E0E0;padding:7px 8px">Name</div>' +
        '<div style="width:104px;border-right:1px solid #E0E0E0;padding:7px 8px">Phone</div>' +
        '<div style="flex:1;border-right:1px solid #E0E0E0;padding:7px 8px">Wants</div>' +
        '<div style="width:96px;border-right:1px solid #E0E0E0;padding:7px 8px">Budget</div>' +
        '<div style="width:84px;border-right:1px solid #E0E0E0;padding:7px 8px">Start</div>' +
        '<div style="width:88px;padding:7px 8px">Status</div>' +
      '</div>' +
      '<div class="s-rows" style="min-height:270px;background:#fff;position:relative"></div>' +
    '</div>' +
  '</div>';

T['winback-engine'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="device-stage"><div class="device">' +
      '<div class="device-buttons"><i class="rail l la"></i><i class="rail l lb"></i><i class="rail l lc"></i><i class="rail r ra"></i></div>' +
      '<div class="device-frame"><div class="device-screen" style="background:var(--chat-bg)">' +
        '<div class="device-island"></div>' +
        '<div class="chat-ui">' +
          '<div style="flex:none;background:var(--chat-head);padding:40px 14px 12px;display:flex;align-items:center;gap:10px">' +
            '<span style="color:#fff;font-size:18px;line-height:1;opacity:.7">&#8249;</span>' +
            '<div style="width:34px;height:34px;border-radius:50%;background:var(--chat-avatar);flex:none;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#fff">DL</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:13px;font-weight:600;color:#fff">Daniel L.</div>' +
              '<div class="w-presence" style="font-size:10.5px;color:rgba(255,255,255,.66)">last seen 2 months ago</div></div>' +
            '<span style="color:#fff;opacity:.6;font-size:15px">&#8942;</span>' +
          '</div>' +
          '<div class="w-thread" style="flex:1;min-height:0;padding:14px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden"></div>' +
          '<div style="flex:none;padding:8px 10px;display:flex;align-items:center;gap:8px">' +
            '<div style="flex:1;background:#fff;border:1px solid var(--ui-line);border-radius:99px;padding:8px 12px;font-size:12px;color:#9aa2ad">Message</div>' +
            '<div style="width:34px;height:34px;border-radius:50%;background:var(--chat-send);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">➤</div>' +
          '</div>' +
        '</div>' +
        '<canvas class="w-fx" style="position:absolute;inset:0;pointer-events:none;z-index:15"></canvas>' +
      '</div></div>' +
    '</div></div>' +
  '</div>';

T['leadly-pulse'] =
  '<div class="stage">' +
    '<div class="glow"></div>' +
    '<div class="win shadow">' +
      '<div style="display:flex;gap:6px;align-items:center;padding:11px 14px;background:var(--ui-soft);border-bottom:1px solid var(--ui-line)">' +
        '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
        '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
        '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
        '<div class="pu-url" style="margin-left:12px;font-size:10.5px;color:#98A2B3;background:#fff;border:1px solid var(--ui-line);border-radius:99px;padding:3px 12px">index.html</div>' +
      '</div>' +
      '<div class="pu-stage" style="position:relative;height:352px;overflow:hidden;background:var(--ui-bg)">' +
        '<div class="pu-s1" style="position:absolute;inset:0;display:flex;background:#0D1117;transition:opacity .7s ease">' +
          '<div style="flex:1;padding:16px 0 16px 0;overflow:hidden"><pre class="pu-code" style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.85;color:#8B949E"></pre></div>' +
          '<div style="width:238px;flex:none;border-left:1px solid #21262D;padding:14px 12px;display:flex;flex-direction:column;gap:7px">' +
            '<div style="font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#6E7681;margin-bottom:3px">Events received</div>' +
            '<div class="pu-events" style="display:flex;flex-direction:column;gap:6px"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pu-s2" style="position:absolute;inset:0;opacity:0;transition:opacity .7s ease">' +
          '<div class="pu-zoom" style="position:absolute;inset:0;display:flex;transform-origin:26% 66%;transform:scale(2.25);transition:transform 2.1s cubic-bezier(.55,.06,.24,1)">' +
            '<div style="width:120px;flex:none;background:var(--navy);padding:16px 11px;display:flex;flex-direction:column;gap:12px">' +
              '<div style="height:8px;width:62%;border-radius:99px;background:rgba(255,255,255,.22);margin-bottom:4px"></div>' +
              '<div style="display:flex;align-items:center;gap:7px;background:var(--blue);border-radius:6px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.9);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.65)"></div></div>' +
              '<div style="display:flex;align-items:center;gap:7px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.3);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.16)"></div></div>' +
              '<div style="display:flex;align-items:center;gap:7px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.3);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.16)"></div></div>' +
              '<div style="display:flex;align-items:center;gap:7px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.3);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.16)"></div></div>' +
            '</div>' +
            '<div style="flex:1;padding:14px 16px 16px;display:flex;flex-direction:column;gap:12px;min-width:0">' +
              '<div class="pu-tiles" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div>' +
              '<div style="border:1px solid var(--ui-line);border-radius:9px;padding:10px 12px">' +
                '<div style="font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-bottom:9px">Leads by ad</div>' +
                '<div class="pu-funnel" style="display:flex;flex-direction:column;gap:7px"></div>' +
              '</div>' +
              '<div style="border:1px solid var(--ui-line);border-radius:9px;padding:10px 12px;flex:1;min-height:0">' +
                '<div style="font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-bottom:6px">Leads over time</div>' +
                '<svg class="pu-chart" viewBox="0 0 460 84" style="width:100%;height:auto;display:block" aria-hidden="true">' +
                  '<defs><linearGradient id="la-pfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#147A54" stop-opacity=".22"/><stop offset="100%" stop-color="#147A54" stop-opacity="0"/></linearGradient></defs>' +
                  '<line x1="0" y1="21" x2="460" y2="21" stroke="#EFF1F4"/><line x1="0" y1="42" x2="460" y2="42" stroke="#EFF1F4"/>' +
                  '<line x1="0" y1="63" x2="460" y2="63" stroke="#EFF1F4"/><line x1="0" y1="83" x2="460" y2="83" stroke="#E4E7EC"/>' +
                  '<path class="pu-area" d="" fill="url(#la-pfill)" opacity="0"/>' +
                  '<path class="pu-line" d="" fill="none" stroke="#147A54" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
                  '<circle class="pu-head" r="4" fill="#147A54" opacity="0"/>' +
                '</svg>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

/* ═══════════════════════════════════════════════════════════════════════════
   RUNNERS — the exact sequences. `inst.alive` gates the loops for replay.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 0 · QUALIFIED-LEADS-ARRIVING FEED (hero) — upward conveyor ── */
function feed(root, inst){
  var list = root.querySelector('.hf-list');
  if(!list) return;
  var people = [
    { n:'Jasmine T.', a:34, w:'Income protection',  b:'S$100–300/mo', s:'This month' },
    { n:'Ridwan K.',  a:41, w:'Family cover',        b:'S$300+/mo',    s:'This month' },
    { n:'Chloe S.',   a:29, w:'Critical illness',    b:'S$100–300/mo', s:'Next month' },
    { n:'Wei Lin',    a:52, w:'Retirement income',   b:'S$300+/mo',    s:'This month' },
    { n:'Arjun P.',   a:38, w:'Disability cover',    b:'S$100–300/mo', s:'This month' },
    { n:'Nadia H.',   a:45, w:'Income protection',   b:'S$300+/mo',    s:'3 months' },
    { n:'Priya R.',   a:36, w:'Family cover',        b:'S$100–300/mo', s:'This month' },
    { n:'Marcus L.',  a:48, w:'Retirement income',   b:'S$300+/mo',    s:'Next month' }
  ];
  var i = 0;
  function card(p){
    var d = document.createElement('div');
    d.className = 'hf-card';
    d.innerHTML =
      '<div class="hf-top"><span class="hf-name">' + p.n + ' · ' + p.a + '</span><span class="hf-tag">Qualified</span></div>' +
      '<div class="hf-rows">' +
        '<div><span>Wants</span> ' + p.w + '</div>' +
        '<div><span>Budget</span> ' + p.b + '</div>' +
        '<div><span>Start</span> ' + p.s + '</div>' +
      '</div>';
    return d;
  }
  /* seed the visible stack */
  for (var s = 0; s < 4; s++){ list.appendChild(card(people[i++ % people.length])); }
  var slot = 0;
  function tick(){
    if (!inst.alive) return;
    if (!slot){ var f = list.children[0]; slot = (f ? f.getBoundingClientRect().height : 96) + 12; }
    list.appendChild(card(people[i++ % people.length]));           /* new lead enters at the bottom */
    requestAnimationFrame(function(){
      list.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
      list.style.transform = 'translateY(-' + slot + 'px)';        /* everything slides up one slot   */
    });
    var done = function(){
      list.removeEventListener('transitionend', done);
      list.style.transition = 'none';
      list.style.transform = 'none';
      if (list.firstChild) list.removeChild(list.firstChild);       /* the first is replaced           */
    };
    list.addEventListener('transitionend', done);
  }
  inst.timers.push(setInterval(tick, 2400));
}

/* ── 0b · AD-REEL — 3D fan of ad-creative cards (Advertising) ── */
function adreel(root, inst){
  var pivot = root.querySelector('.ad-pivot');
  if (!pivot) return;
  /* brand-appropriate gradient placeholders; swap `img` for real creatives in
     /assets/ads/. A card shows its gradient until its image actually loads. */
  var ADS = [
    { img:'/assets/ads/ad-01-retirement.webp', art:'linear-gradient(150deg,#1C3B30,#2FB985)', kicker:'Retirement',        line:'Are you on track to retire — or just hoping?',            cta:'Free 2-min check' },
    { img:'/assets/ads/ad-02-income.webp',     art:'linear-gradient(150deg,#12212E,#3C5A6B)', kicker:'Income protection', line:'If you couldn’t work tomorrow, how long would you last?', cta:'Find out' },
    { img:'/assets/ads/ad-03-legacy.webp',     art:'linear-gradient(150deg,#22302A,#4E8A5E)', kicker:'Legacy',            line:'Your CPF doesn’t go where you think it does.',           cta:'Check yours' },
    { img:'/assets/ads/ad-04-ci.webp',         art:'linear-gradient(150deg,#2E2A2A,#6B5150)', kicker:'Critical illness',  line:'The bill arrives long before the recovery does.',        cta:'See the numbers' },
    { img:'/assets/ads/ad-05-winback.webp',    art:'linear-gradient(150deg,#3A2622,#B4552F)', kicker:'Winback',           line:'Still thinking it over? Most people are.',               cta:'Pick up where you left off' },
    { img:'/assets/ads/ad-06-advisors.webp',   art:'linear-gradient(150deg,#1B2330,#3B4A63)', kicker:'Advisors',          line:'Stop calling strangers.',                                cta:'Book a demo' },
    { img:'/assets/ads/ad-07-annuity.webp',    art:'linear-gradient(150deg,#2E2A1C,#B08A2A)', kicker:'Annuity',           line:'What does S$4,000 a month actually cost you today?',      cta:'Work it out' },
    { img:'/assets/ads/ad-08-pulse.webp',      art:'linear-gradient(150deg,#123A3A,#1D9E75)', kicker:'Pulse',             line:'One dashboard. Meta and Google. Live.',                  cta:'Try it free' }
  ];
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var R = 600, SPAN = 15.5, EDGE = 62, SPEED = 2.6, TOTAL = ADS.length * SPAN;

  var cards = ADS.map(function(ad){
    var c = document.createElement('div');
    c.className = 'ad-card';
    c.innerHTML =
      '<div class="art" style="background:' + ad.art + '"></div>' +
      '<div class="copy"><div class="kicker">' + ad.kicker + '</div>' +
      '<div class="line">' + ad.line + '</div><div class="go">' + ad.cta + '</div></div>';
    if (ad.img){
      var probe = new Image();
      probe.onload = function(){ var a = c.querySelector('.art'); if (a) a.style.background = "url('" + ad.img + "') center/cover"; };
      probe.src = ad.img;
    }
    pivot.appendChild(c);
    return c;
  });

  var offset = 0, last = performance.now();
  function frame(now){
    if (!inst.alive) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduced) offset = (offset + SPEED * dt) % TOTAL;
    cards.forEach(function(c, i){
      var a = (i * SPAN - offset) % TOTAL;
      if (a > TOTAL / 2) a -= TOTAL;
      if (a < -TOTAL / 2) a += TOTAL;
      var k = Math.abs(a) / EDGE;
      if (k > 1){ c.style.opacity = '0'; return; }
      var depth = 1 - Math.pow(k, 1.6) * 0.30;
      var fade  = 1 - Math.pow(k, 3.2);
      var z = (Math.cos(a * Math.PI / 180) - 1) * 340;
      c.style.opacity = fade.toFixed(3);
      c.style.transform =
        'rotate(' + a.toFixed(2) + 'deg) translateY(' + (-R) + 'px) rotate(' + (-a * 0.55).toFixed(2) + 'deg) translateZ(' + z.toFixed(2) + 'px) scale(' + depth.toFixed(3) + ')';
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ── 1 · SMART QUALIFIER ── */
async function qualifier(root, inst){
  var glow = root.querySelector('.glow');
  var bar = root.querySelector('.dq-bar'), stepEl = root.querySelector('.dq-step');
  var card = root.querySelector('.dq-card'), qEl = root.querySelector('.dq-text');
  var hintEl = root.querySelector('.dq-hint'), optsEl = root.querySelector('.dq-opts');
  var foot = root.querySelector('.dq-foot'), fx = root.querySelector('.dq-fx');
  var profile = root.querySelector('.dq-profile');

  var Q = [
    { q: 'How old are you today?', hint: '',
      o: ['Under 40', '40 – 49', '50 – 59', '60 or above'], pick: 2,
      fact: ['Age', '50 – 59'] },
    { q: 'When would you like to retire?', hint: '',
      o: ['Before 55', '55 – 60', '61 – 65', 'After 65', 'Not sure yet'], pick: 2,
      fact: ['Target retirement', '61 – 65'] },
    { q: 'What monthly income would you want in retirement?', hint: 'In today’s dollars — your best guess is fine.',
      o: ['Under S$2,000', 'S$2,000 – 4,000', 'S$4,000 – 6,000', 'More than S$6,000'], pick: 2,
      fact: ['Income wanted', 'S$4,000 – 6,000 / mo'] },
    { q: 'How prepared do you feel so far?', hint: '',
      o: ['Just getting started', 'Some savings & CPF set aside', 'A fair amount put away', 'I feel well prepared'], pick: 1,
      fact: ['Preparedness', 'Some savings & CPF'] },
    { q: 'Do you already have a retirement or annuity plan?', hint: '',
      o: ['Yes, reviewed recently', 'Yes, but not reviewed in a while', 'No, not yet', 'I’m not sure'], pick: 1,
      fact: ['Existing plan', 'Unreviewed — gap'] },
    { q: 'Have you done or updated any of these?', hint: 'Tick what you’ve set up. Leave the rest — that’s what we help with.',
      o: ['Lasting Power of Attorney', 'CPF Nomination', 'Insurance Nomination', 'Will of assets'], pick: 1, multi: true,
      fact: ['Estate docs', 'CPF only — no LPA, no will'] }
  ];

  var row = function(k, v){
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-direction:column;gap:3px;padding:9px 12px;border:1px solid var(--tint-line);border-radius:9px;background:var(--tint);opacity:0;transform:translateX(10px);transition:all .45s cubic-bezier(.34,1.4,.64,1)';
    d.innerHTML = '<span style="font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink2)">' + k + '</span>' +
                  '<span style="font-size:13px;color:var(--ink0);font-weight:500;line-height:1.25">' + v + '</span>';
    profile.appendChild(d);
    requestAnimationFrame(function(){ d.style.opacity = 1; d.style.transform = 'translateX(0)'; });
  };

  var draw = function(s){
    optsEl.innerHTML = '';
    s.o.forEach(function(label){
      var r = document.createElement('div');
      r.style.cssText = 'display:flex;align-items:center;gap:10px;padding:11px 12px;border:1.5px solid var(--ui-line);border-radius:11px;background:#fff;transition:all .35s cubic-bezier(.4,0,.2,1)';
      var shape = s.multi ? 'border-radius:5px' : 'border-radius:50%';
      r.innerHTML = '<div class="rd" style="width:16px;height:16px;' + shape + ';border:1.5px solid #D0D5DD;flex:none;transition:all .3s ease"></div>' +
                    '<span class="lb" style="font-size:12.5px;color:#344054;line-height:1.3;transition:color .3s ease">' + label + '</span>';
      optsEl.appendChild(r);
    });
  };

  while (inst.alive) {
    profile.innerHTML = '';
    bar.style.background = 'var(--blue)';
    foot.textContent = 'Free 2-minute check · No obligation';
    foot.style.color = 'var(--mute)';

    for (var i = 0; i < Q.length; i++) {
      var s = Q[i];

      card.style.transform = 'translateX(30px)';
      card.style.opacity = 0;
      await wait(300);
      qEl.textContent = s.q;
      hintEl.textContent = s.hint;
      hintEl.style.marginBottom = s.hint ? '14px' : '8px';
      draw(s);
      card.style.transition = 'none';
      card.style.transform = 'translateX(-30px)';
      await wait(20);
      card.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease';
      card.style.transform = 'translateX(0)';
      card.style.opacity = 1;

      stepEl.textContent = (i + 1) + ' / 6';
      bar.style.width = ((i + 1) / 6 * 100) + '%';
      await wait(1100);

      var picked = optsEl.children[s.pick];
      picked.style.background = 'var(--blue)';
      picked.style.borderColor = 'var(--blue)';
      picked.style.transform = 'scale(.97)';
      picked.querySelector('.rd').style.cssText += ';background:#fff;border-color:#fff;box-shadow:inset 0 0 0 3px var(--blue)';
      picked.querySelector('.lb').style.color = '#fff';
      glow.style.opacity = .42;
      await wait(140);
      picked.style.transform = 'scale(1)';
      [].slice.call(optsEl.children).forEach(function(c, n){ if (n !== s.pick) { c.style.opacity = .3; c.style.transform = 'translateX(-5px)'; } });

      row(s.fact[0], s.fact[1]);
      await wait(620);
      glow.style.opacity = .2;
      await wait(240);
    }

    card.style.transform = 'translateX(30px)';
    card.style.opacity = 0;
    await wait(320);

    qEl.textContent = 'Where should we send your results?';
    hintEl.textContent = 'A licensed adviser will call with your assessment.';
    hintEl.style.marginBottom = '14px';
    optsEl.innerHTML =
      '<div style="border:1.5px solid var(--ui-line);border-radius:11px;padding:11px 12px;margin-bottom:8px"><div style="font-size:9.5px;color:var(--mute);margin-bottom:4px">Full name</div><div style="font-size:13px;color:var(--ink);font-weight:500">Daniel Lim</div></div>' +
      '<div style="border:1.5px solid var(--ui-line);border-radius:11px;padding:11px 12px;margin-bottom:10px"><div style="font-size:9.5px;color:var(--mute);margin-bottom:4px">Mobile number</div><div style="font-size:13px;color:var(--ink);font-weight:500">+65 9••• ••42</div></div>' +
      '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:12px"><div style="width:15px;height:15px;border-radius:4px;background:var(--blue);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;flex:none">✓</div><span style="font-size:10px;color:var(--mute);line-height:1.35">Agrees to be contacted · PDPA compliant</span></div>' +
      '<div class="dq-cta" style="background:var(--blue);color:#fff;text-align:center;font-size:13.5px;font-weight:600;padding:13px;border-radius:12px">Get my assessment</div>';
    stepEl.textContent = 'Last step';
    bar.style.width = '100%';
    card.style.transition = 'none';
    card.style.transform = 'translateX(-30px)';
    await wait(20);
    card.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease';
    card.style.transform = 'translateX(0)';
    card.style.opacity = 1;
    await wait(1500);

    var cta = optsEl.querySelector('.dq-cta');
    cta.style.transition = 'transform .16s ease';
    cta.style.transform = 'scale(.96)';
    await wait(160);
    cta.style.transform = 'scale(1)';
    await wait(280);

    card.style.transform = 'translateX(30px)';
    card.style.opacity = 0;
    await wait(340);

    qEl.textContent = 'You’re all set.';
    hintEl.textContent = '';
    hintEl.style.marginBottom = '10px';
    optsEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:9px;padding:11px 12px;border-radius:11px;background:#ECFDF3;border:1px solid #ABEFC6;margin-bottom:10px">' +
        '<div style="width:20px;height:20px;border-radius:50%;background:#12805C;color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none">✓</div>' +
        '<span style="font-size:12.5px;color:#085D3A;font-weight:600">Assessment complete</span></div>' +
      '<div style="font-size:12.5px;color:#667085;line-height:1.5">A licensed adviser will call you shortly to go through your results.</div>';
    foot.textContent = 'Sent to your advisors with all 6 answers';
    foot.style.color = 'var(--blue)';
    card.style.transition = 'none';
    card.style.transform = 'translateX(0)';
    await wait(20);
    card.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease';
    card.style.opacity = 1;

    glow.style.opacity = .72;
    burst(fx, .46);
    await wait(3800);
    glow.style.opacity = .2;
    await wait(900);
  }
}

/* ── 2 · INSTANT PING ── */
async function ping(root, inst){
  var glow = root.querySelector('.glow');
  var card = root.querySelector('.p-card');
  var timer = root.querySelector('.p-timer');
  var dot = root.querySelector('.p-dot');

  dot.animate([{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }], { duration: 1400, iterations: Infinity });

  while (inst.alive) {
    card.style.opacity = 0;
    card.style.transform = 'translateY(16px) scale(.94)';
    timer.textContent = '0.0s';
    await wait(1000);

    await countTo(timer, 0, 8.4, 2000, function(v){ return v.toFixed(1) + 's'; });

    card.style.opacity = 1;
    card.style.transform = 'translateY(0) scale(1)';
    glow.style.opacity = .6;
    await wait(300);
    glow.style.opacity = .3;

    await wait(3600);
    glow.style.opacity = .2;
    await wait(600);
  }
}

/* ── 3 · LIVE CALL SHEET ── */
async function sheet(root, inst){
  var glow = root.querySelector('.glow');
  var rows = root.querySelector('.s-rows');
  var pulse = root.querySelector('.s-pulse');

  pulse.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: .3, transform: 'scale(1.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1600, iterations: Infinity });

  var data = [
    ['Jasmine T.', '8••• ••42', 'Income protection', 'S$100–300', 'This month', 'New'],
    ['Ridwan K.',  '9••• ••07', 'Family cover',      'S$300+',    'This month', 'Called'],
    ['Chloe S.',   '8••• ••88', 'Income protection', 'S$100–300', '3 months',   'Booked'],
    ['Wei Lin',    '9••• ••31', 'Critical illness',  'S$300+',    'This month', 'Called'],
    ['Arjun P.',   '8••• ••15', 'Family cover',      'S$100–300', 'This month', 'Booked'],
    ['Nadia H.',   '9••• ••60', 'Income protection', 'S$300+',    '3 months',   'Called']
  ];

  var pill = function(t){
    var map = { New: ['#E8F0FE', '#1A73E8'], Called: ['#F1F3F4', '#5F6368'], Booked: ['#E6F4EA', '#188038'] };
    var arr = map[t], bg = arr[0], fg = arr[1];
    return '<span class="pl" style="font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:99px;background:' + bg + ';color:' + fg + ';transition:all .4s ease">' + t + '</span>';
  };

  var cell = function(v, w, extra){
    extra = extra || '';
    return '<div style="' + w + ';border-right:1px solid #E8EAED;padding:8px;font-size:11.5px;color:#202124;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' + extra + '">' + v + '</div>';
  };

  var makeRow = function(d, n){
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;align-items:center;border-bottom:1px solid #E8EAED;background:#E8F0FE;opacity:0;transform:translateY(-6px);transition:all .5s cubic-bezier(.4,0,.2,1)';
    r.innerHTML =
      '<div style="width:30px;border-right:1px solid #E0E0E0;text-align:center;padding:8px 0;font-size:10px;color:#5F6368;background:#F8F9FA;flex:none">' + n + '</div>' +
      cell('<b style="font-weight:600">' + d[0] + '</b>', 'width:112px;flex:none') +
      cell(d[1], 'width:104px;flex:none', 'color:#1A73E8') +
      cell(d[2], 'flex:1;min-width:0') +
      cell(d[3], 'width:96px;flex:none') +
      cell(d[4], 'width:84px;flex:none') +
      '<div style="width:88px;padding:8px;flex:none">' + pill(d[5]) + '</div>';
    return r;
  };

  while (inst.alive) {
    rows.innerHTML = '';
    for (var i = 0; i < data.length; i++) {
      var r = makeRow(data[i], i + 2);
      rows.prepend(r);
      [].slice.call(rows.children).forEach(function(c, n){
        c.querySelector('div').textContent = n + 2;
      });
      await wait(30);
      r.style.opacity = 1;
      r.style.transform = 'translateY(0)';
      glow.style.opacity = .4;
      await wait(380);
      glow.style.opacity = .2;
      (function(rr){ setTimeout(function(){ rr.style.background = '#fff'; }, 1300); })(r);
      await wait(600);
    }

    await wait(1000);
    var top = rows.children[0].querySelector('.pl');
    top.textContent = 'Booked';
    top.style.background = '#E6F4EA';
    top.style.color = '#188038';
    top.style.transform = 'scale(1.12)';
    glow.style.opacity = .5;
    await wait(400);
    top.style.transform = 'scale(1)';
    glow.style.opacity = .2;
    await wait(2800);
  }
}

/* ── 4 · WINBACK ENGINE ── */
async function winback(root, inst){
  var glow = root.querySelector('.glow');
  var thread = root.querySelector('.w-thread');
  var presence = root.querySelector('.w-presence');
  var fx = root.querySelector('.w-fx');

  var stamp = function(t){ return '<div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:3px"><span style="font-size:9.5px;color:var(--chat-meta)">' + t + '</span><span style="font-size:10px;color:var(--chat-tick);line-height:1">✓✓</span></div>'; };

  var out = function(html, t){
    var d = document.createElement('div');
    d.style.cssText = 'align-self:flex-end;max-width:80%;background:var(--chat-out);border-radius:12px 12px 3px 12px;padding:8px 10px;box-shadow:0 1px 2px rgba(16,24,40,.08);opacity:0;transform:translateY(10px);transition:all .4s cubic-bezier(.34,1.4,.64,1)';
    d.innerHTML = '<div style="font-size:12.5px;color:var(--chat-ink);line-height:1.4">' + html + '</div>' + stamp(t);
    thread.appendChild(d);
    requestAnimationFrame(function(){ d.style.opacity = 1; d.style.transform = 'translateY(0)'; });
    return d;
  };

  var inc = function(html, t){
    var d = document.createElement('div');
    d.style.cssText = 'align-self:flex-start;max-width:80%;background:var(--chat-in);border-radius:12px 12px 12px 3px;padding:8px 10px;box-shadow:0 1px 2px rgba(16,24,40,.08);opacity:0;transform:translateY(10px);transition:all .4s cubic-bezier(.34,1.4,.64,1)';
    d.innerHTML = '<div style="font-size:12.5px;color:var(--chat-ink);line-height:1.4">' + html + '</div><div style="text-align:right;font-size:9.5px;color:var(--chat-meta);margin-top:3px">' + t + '</div>';
    thread.appendChild(d);
    requestAnimationFrame(function(){ d.style.opacity = 1; d.style.transform = 'translateY(0)'; });
    return d;
  };

  var divider = function(txt){
    var d = document.createElement('div');
    d.style.cssText = 'align-self:center;background:rgba(255,255,255,.9);border-radius:6px;padding:3px 10px;font-size:10px;color:var(--chat-name);font-weight:600;letter-spacing:.02em;opacity:0;transition:opacity .4s ease';
    d.textContent = txt;
    thread.appendChild(d);
    requestAnimationFrame(function(){ d.style.opacity = 1; });
  };

  var typing = function(){
    var d = document.createElement('div');
    d.style.cssText = 'align-self:flex-start;background:var(--chat-in);border-radius:12px;padding:10px 12px;box-shadow:0 1px 2px rgba(16,24,40,.08);display:flex;gap:4px';
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#B0B7BE;display:block';
      s.animate([{ opacity: .3, transform: 'translateY(0)' }, { opacity: 1, transform: 'translateY(-3px)' }, { opacity: .3, transform: 'translateY(0)' }],
        { duration: 900, iterations: Infinity, delay: i * 150 });
      d.appendChild(s);
    }
    thread.appendChild(d);
    return d;
  };

  while (inst.alive) {
    thread.innerHTML = '';
    presence.textContent = 'last seen 2 months ago';
    glow.style.opacity = .12;
    await wait(900);

    divider('DAY 0');
    await wait(500);
    out('Hi Daniel — you asked about income protection. Free for a quick call today?', '11:02');
    await wait(2000);

    divider('DAY 30');
    await wait(500);
    out('Still thinking it over? Happy to send the numbers instead of calling.', '09:14');
    await wait(2200);

    divider('DAY 60');
    await wait(500);
    out('Last one from me, Daniel. If your situation changed, I’m here.', '10:30');
    await wait(1600);

    presence.textContent = 'online';
    var t = typing();
    glow.style.opacity = .35;
    await wait(1700);
    t.remove();

    inc('Actually yes — just had a kid. Can we talk this week?', '10:33');
    glow.style.opacity = .75;
    burst(fx, .5);
    await wait(700);

    presence.textContent = 'online';
    inc('<span style="color:var(--accent-ink);font-weight:600">Back in the funnel ↗</span>', '10:33');
    await wait(3600);
    glow.style.opacity = .2;
    await wait(900);
  }
}

/* ── 5 · LEADLY PULSE ── */
async function pulse(root, inst){
  var glow = root.querySelector('.glow');
  var url = root.querySelector('.pu-url');
  var s1 = root.querySelector('.pu-s1'), s2 = root.querySelector('.pu-s2');
  var zoom = root.querySelector('.pu-zoom');
  var codeEl = root.querySelector('.pu-code'), eventsEl = root.querySelector('.pu-events');
  var tiles = root.querySelector('.pu-tiles'), funnel = root.querySelector('.pu-funnel');
  var line = root.querySelector('.pu-line'), area = root.querySelector('.pu-area'), head = root.querySelector('.pu-head');

  var C = function(t, c){ return '<span style="color:' + c + '">' + t + '</span>'; };
  var CODE = [
    C('&lt;!--', '#6E7681') + C(' Leadly tracking ', '#6E7681') + C('--&gt;', '#6E7681'),
    C('fbq', '#D2A8FF') + '(' + C("'init'", '#A5D6FF') + ', ' + C("'PIXEL_ID'", '#A5D6FF') + ');',
    C('fbq', '#D2A8FF') + '(' + C("'track'", '#A5D6FF') + ', ' + C("'PageView'", '#A5D6FF') + ');',
    '',
    C('utm', '#79C0FF') + '.' + C('capture', '#D2A8FF') + '();  ' + C('// source, campaign, adset, ad', '#6E7681'),
    '',
    C('on', '#D2A8FF') + '(' + C("'view_offer'", '#A5D6FF') + ',&nbsp;&nbsp;&nbsp;&nbsp;() =&gt; ' + C('send', '#D2A8FF') + '(' + C("'ViewContent'", '#A5D6FF') + '));',
    C('on', '#D2A8FF') + '(' + C("'q_start'", '#A5D6FF') + ',&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;() =&gt; ' + C('send', '#D2A8FF') + '(' + C("'InitiateCheckout'", '#A5D6FF') + '));',
    C('on', '#D2A8FF') + '(' + C("'q_submit'", '#A5D6FF') + ',&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;() =&gt; ' + C('send', '#D2A8FF') + '(' + C("'Lead'", '#A5D6FF') + '));',
    '',
    C('// server-side, so ad blockers can’t eat it', '#6E7681'),
    C('capi', '#79C0FF') + '.' + C('mirror', '#D2A8FF') + '({ ' + C('deduplicate', '#79C0FF') + ': ' + C('true', '#79C0FF') + ' });'
  ];

  var EVENTS = [
    ['PageView', 'Pixel'],
    ['ViewContent', 'Pixel'],
    ['InitiateCheckout', 'Pixel + CAPI'],
    ['Lead', 'Pixel + CAPI']
  ];

  /* Leads by ad — relative counts only. No spend, no per-lead price, no drop-off. */
  var FUNNEL = [
    ['Retirement — Video A', 34, 100],
    ['Retirement — Carousel', 25, 74],
    ['Disability — Static', 17, 50],
    ['Income — Story', 11, 32]
  ];

  var METRICS = [
    { k: 'Leads', to: 87, fmt: function(v){ return Math.round(v); } },
    { k: 'Avg → WhatsApp', to: 8, fmt: function(v){ return Math.round(v) + 's'; } },
    { k: 'Called <2 min', to: 94, fmt: function(v){ return Math.round(v) + '%'; } }
  ];

  tiles.innerHTML = METRICS.map(function(m){
    return '<div style="background:var(--ui-soft);border-radius:8px;padding:9px 10px">' +
      '<div style="font-size:9px;letter-spacing:.07em;text-transform:uppercase;color:var(--mute);margin-bottom:5px">' + m.k + '</div>' +
      '<div class="pu-v tick" style="font-size:15px;font-weight:600;color:var(--ink)">—</div>' +
    '</div>';
  }).join('');
  var vals = [].slice.call(tiles.querySelectorAll('.pu-v'));

  funnel.innerHTML = FUNNEL.map(function(f){
    return '<div class="pu-fr" style="opacity:0;transform:translateX(-8px);transition:all .5s cubic-bezier(.34,1.4,.64,1)">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">' +
        '<span style="font-size:10.5px;color:#344054;font-weight:500">' + f[0] + '</span>' +
        '<span class="pu-fv tick" style="font-size:11px;color:var(--ink);font-weight:600">0</span>' +
      '</div>' +
      '<div style="height:6px;border-radius:99px;background:var(--ui-line);overflow:hidden">' +
        '<div class="pu-fb" style="height:100%;width:0;background:var(--blue);border-radius:99px;transition:width .9s cubic-bezier(.4,0,.2,1)"></div>' +
      '</div>' +
    '</div>';
  }).join('');
  var frows = [].slice.call(funnel.querySelectorAll('.pu-fr'));

  var pts = [8, 20, 15, 33, 27, 44, 39, 56, 50, 66, 61, 74, 79];
  var X = function(i){ return (i / (pts.length - 1)) * 456 + 2; };
  var Y = function(v){ return 83 - (v / 86) * 78; };
  var d = pts.map(function(v, i){ return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
  line.setAttribute('d', d);
  area.setAttribute('d', d + ' L458 83 L2 83 Z');
  var len = line.getTotalLength();
  line.style.strokeDasharray = len;

  while (inst.alive) {
    url.textContent = 'index.html';
    s1.style.opacity = 1; s1.style.pointerEvents = 'auto';
    s2.style.opacity = 0;
    zoom.style.transition = 'none';
    zoom.style.transform = 'scale(2.25)';
    codeEl.innerHTML = '';
    eventsEl.innerHTML = '';
    vals.forEach(function(v){ v.textContent = '—'; });
    frows.forEach(function(r){ r.style.opacity = 0; r.style.transform = 'translateX(-8px)'; r.querySelector('.pu-fb').style.width = '0'; r.querySelector('.pu-fv').textContent = '0'; });
    line.style.transition = 'none'; line.style.strokeDashoffset = len;
    area.style.opacity = 0; head.setAttribute('opacity', 0);
    glow.style.opacity = .16;
    await wait(800);

    for (var ci = 0; ci < CODE.length; ci++) {
      var ln = CODE[ci];
      codeEl.insertAdjacentHTML('beforeend', '<div style="padding:0 16px;opacity:0;transition:opacity .25s ease">' + (ln || '&nbsp;') + '</div>');
      var last = codeEl.lastElementChild;
      (function(el){ requestAnimationFrame(function(){ el.style.opacity = 1; }); })(last);
      await wait(115);
    }
    await wait(500);

    for (var ei = 0; ei < EVENTS.length; ei++) {
      var name = EVENTS[ei][0], via = EVENTS[ei][1];
      var e = document.createElement('div');
      e.style.cssText = 'display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid #2FB985;border-radius:7px;background:rgba(47,185,133,.12);opacity:0;transform:translateX(10px);transition:all .4s cubic-bezier(.34,1.4,.64,1)';
      e.innerHTML =
        '<div style="width:6px;height:6px;border-radius:50%;background:#3FB950;flex:none;box-shadow:0 0 0 3px rgba(63,185,80,.18)"></div>' +
        '<div style="min-width:0;flex:1"><div style="font-size:10.5px;color:#C9D1D9;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + '</div>' +
        '<div style="font-size:9px;color:#6E7681">' + via + '</div></div>' +
        '<span style="font-size:9.5px;color:#3FB950">200</span>';
      eventsEl.appendChild(e);
      (function(el){ requestAnimationFrame(function(){ el.style.opacity = 1; el.style.transform = 'translateX(0)'; }); })(e);
      glow.style.opacity = .42;
      await wait(180);
      glow.style.opacity = .22;
      await wait(560);
    }
    await wait(900);

    url.textContent = 'app.leadly.sg / performance';
    s1.style.opacity = 0; s1.style.pointerEvents = 'none';
    s2.style.opacity = 1;
    glow.style.opacity = .34;
    await wait(750);

    for (var fi = 0; fi < frows.length; fi++) {
      var fr = frows[fi];
      fr.style.opacity = 1;
      fr.style.transform = 'translateX(0)';
      fr.querySelector('.pu-fb').style.width = FUNNEL[fi][2] + '%';
      countTo(fr.querySelector('.pu-fv'), 0, FUNNEL[fi][1], 900, function(v){ return Math.round(v).toLocaleString(); });
      await wait(620);
    }
    await wait(1300);

    zoom.style.transition = 'transform 2.1s cubic-bezier(.55,.06,.24,1)';
    zoom.style.transform = 'scale(1)';
    glow.style.opacity = .5;
    await wait(900);

    METRICS.forEach(function(m, i){ countTo(vals[i], 0, m.to, 1700 + i * 160, m.fmt); });
    line.style.transition = 'stroke-dashoffset 2.1s cubic-bezier(.4,0,.2,1)';
    line.style.strokeDashoffset = 0;
    area.style.transition = 'opacity 1.3s ease .5s';
    area.style.opacity = 1;
    await wait(2100);

    head.setAttribute('cx', X(pts.length - 1));
    head.setAttribute('cy', Y(pts[pts.length - 1]));
    head.setAttribute('opacity', 1);
    head.animate([{ r: 4, opacity: 1 }, { r: 8.5, opacity: .25 }, { r: 4, opacity: 1 }], { duration: 1800, iterations: Infinity });
    glow.style.opacity = .3;

    await wait(4200);
    glow.style.opacity = .18;
    await wait(700);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REGISTRY + MOUNT
   ═══════════════════════════════════════════════════════════════════════════ */
var RUNNERS = {
  'lead-feed': feed,
  'ad-reel': adreel,
  'smart-qualifier': qualifier,
  'instant-ping': ping,
  'live-call-sheet': sheet,
  'winback-engine': winback,
  'leadly-pulse': pulse
};

var META = {
  'lead-feed':       { label: 'Qualified leads arriving', page: 'The hero on /for/insurance' },
  'ad-reel':         { label: 'Advertising creative reel', page: 'System demo · /for/insurance' },
  'smart-qualifier': { label: 'Smart Qualifier',          page: 'System demo · /for/insurance + deck' },
  'instant-ping':    { label: 'Instant Ping',             page: 'System demo · /for/insurance + deck' },
  'live-call-sheet': { label: 'Live Call Sheet',          page: 'System demo · /for/insurance + deck' },
  'winback-engine':  { label: 'Winback Engine',           page: 'System demo · /for/insurance + deck' },
  'leadly-pulse':    { label: 'Leadly Pulse',             page: 'System demo · /for/insurance + deck' }
};

function mount(el){
  var name = el.getAttribute('data-leadly-anim');
  var runner = RUNNERS[name];
  if (!runner) return null;
  el.classList.add('leadly-demo', 'leadly-demo--' + name);
  var inst = { alive: false, timers: [] };

  function stop(){
    inst.alive = false;
    inst.timers.forEach(function(t){ clearTimeout(t); clearInterval(t); });
    inst.timers = [];
  }
  function play(){
    stop();
    el.innerHTML = T[name];
    inst.alive = true;
    runner(el, inst);
  }

  el._leadly = { play: play, stop: stop, name: name };
  play();
  return el._leadly;
}

function mountAll(root){
  root = root || document;
  [].slice.call(root.querySelectorAll('[data-leadly-anim]')).forEach(function(el){
    if (el.hasAttribute('data-leadly-manual')) return; // opt out of auto-mount; page mounts on demand
    if (!el._leadly) mount(el);
  });
}

window.LeadlyAnim = {
  mount: mount,
  mountAll: mountAll,
  replay: function(el){ if (el && el._leadly) el._leadly.play(); },
  RUNNERS: RUNNERS,
  TEMPLATES: T,
  META: META
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ mountAll(); });
else mountAll();

})();
