/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — PRODUCT DEMOS  ·  /assets/leadly-components.js

   Five demos, each one a thing the product actually does, running live:

     qualifier · ping · sheet · winback · pulse

   Markup:  <div data-leadly-demo="ping"></div>
            <div data-leadly-demo="ping" data-manual></div>   ← don't auto-mount

   Auto-mounts on scroll unless data-manual is set. For tabbed UIs, mount by
   hand on first activation:  window.LeadlyDemo.mount(el)

   Needs leadly-components.css (the stage, the phone, the window).

   NOTE: the .readout stat columns that used to sit BESIDE each device have been
   removed. The demos focus on the device alone. The runners below still
   null-check for them, so re-adding a .readout to any template just works.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countTo(el, from, to, dur, fmt) {
    fmt = fmt || function (v) { return Math.round(v); };
    if (REDUCED) { el.textContent = fmt(to); return Promise.resolve(); }
    return new Promise(function (res) {
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(from + (to - from) * ease(p));
        p < 1 ? requestAnimationFrame(step) : res();
      })(t0);
    });
  }

  /* confetti — canvas, brand palette only */
  function burst(canvas, originY) {
    if (REDUCED || !canvas) return;
    originY = originY || .55;
    var c = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth, H = canvas.height = canvas.offsetHeight;
    var colors = ['#0055E8', '#4D8CF0', '#FFFFFF', '#B9D0FA', '#25D366'];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      var a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 7.5;
      bits.push({
        x: W / 2, y: H * originY,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
        w: 3 + Math.random() * 5, h: 5 + Math.random() * 7,
        rot: Math.random() * 6.28, vr: (Math.random() - .5) * .35,
        col: colors[(Math.random() * colors.length) | 0], life: 1
      });
    }
    (function frame() {
      c.clearRect(0, 0, W, H);
      var alive = false;
      bits.forEach(function (b) {
        b.vy += .17; b.vx *= .992; b.x += b.vx; b.y += b.vy;
        b.rot += b.vr; b.life -= .0085;
        if (b.life > 0 && b.y < H + 30) {
          alive = true;
          c.save();
          c.globalAlpha = Math.max(0, b.life);
          c.translate(b.x, b.y); c.rotate(b.rot);
          c.fillStyle = b.col;
          c.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          c.restore();
        }
      });
      if (alive) requestAnimationFrame(frame); else c.clearRect(0, 0, W, H);
    })();
  }

  /* ═══ MARKUP ══════════════════════════════════════════════════════════════ */

  /* ═══ PER-VERTICAL CONTENT PACKS ══════════════════════════════════════════
     The demos default to INSURANCE (unchanged). A page sets
     window.LEADLY_VERTICAL = 'immigration' | 'clinic' before this script loads
     to theme the qualifier, the WhatsApp ping, the call/booking sheet and the
     winback thread. Anything a pack omits falls back to insurance. */
  var PACKS = {
    insurance: {
      qz: {
        title: 'Retirement readiness check',
        questions: [
          { q:'How old are you today?', hint:'', o:['Under 40','40 \u2013 49','50 \u2013 59','60 or above'], pick:2, fact:['Age','50 \u2013 59'] },
          { q:'When would you like to retire?', hint:'', o:['Before 55','55 \u2013 60','61 \u2013 65','After 65','Not sure yet'], pick:2, fact:['Target retirement','61 \u2013 65'] },
          { q:'What monthly income would you want in retirement?', hint:'In today\u2019s dollars \u2014 your best guess is fine.', o:['Under S$2,000','S$2,000 \u2013 4,000','S$4,000 \u2013 6,000','More than S$6,000'], pick:2, fact:['Income wanted','S$4,000 \u2013 6,000 / mo'] },
          { q:'How prepared do you feel so far?', hint:'', o:['Just getting started','Some savings & CPF set aside','A fair amount put away','I feel well prepared'], pick:1, fact:['Preparedness','Some savings & CPF'] },
          { q:'Do you already have a retirement or annuity plan?', hint:'', o:['Yes, reviewed recently','Yes, but not reviewed in a while','No, not yet','I\u2019m not sure'], pick:1, fact:['Existing plan','Unreviewed \u2014 gap'] },
          { q:'Have you done or updated any of these?', hint:'Tick what you\u2019ve set up. Leave the rest \u2014 that\u2019s what we help with.', o:['Lasting Power of Attorney','CPF Nomination','Insurance Nomination','Will of assets'], pick:1, multi:true, fact:['Estate docs','CPF only \u2014 no LPA, no will'] }
        ],
        sendQ:'Where should we send your results?', sendHint:'A licensed adviser will call with your assessment.',
        cta:'Get my assessment', doneHint:'A licensed adviser will call you shortly to go through your results.',
        foot:'Sent to your advisors with all 6 answers'
      },
      ping: {
        header:'Leadly &middot; New Leads', agents:'You, Marcus, Priya, Wei Jie',
        agentMsg:'Called the last one. Booked for Thursday 3pm \uD83D\uDC4D', tag:'NEW QUALIFIED LEAD',
        lead:'<b>Jasmine T.</b> &middot; 34<br>Wants: income protection<br>Budget: $100&ndash;300/mo<br>Start: this month'
      },
      sheet: {
        title:'Retirement Campaign — Call Sheet', cols:['Wants','Budget','Start'],
        rows:[
          ['Jasmine T.','8\u2022\u2022\u2022 \u2022\u202242','Income protection','S$100\u2013300','This month','New'],
          ['Ridwan K.', '9\u2022\u2022\u2022 \u2022\u202207','Family cover',     'S$300+',      'This month','Called'],
          ['Chloe S.',  '8\u2022\u2022\u2022 \u2022\u202288','Income protection','S$100\u2013300','3 months', 'Booked'],
          ['Wei Lin',   '9\u2022\u2022\u2022 \u2022\u202231','Critical illness', 'S$300+',      'This month','Called'],
          ['Arjun P.',  '8\u2022\u2022\u2022 \u2022\u202215','Family cover',     'S$100\u2013300','This month','Booked'],
          ['Nadia H.',  '9\u2022\u2022\u2022 \u2022\u202260','Income protection','S$300+',      '3 months',  'Called']
        ]
      },
      wb: {
        name:'Daniel L.', sub:'last seen 2 months ago',
        d0:'Hi Daniel — you asked about income protection. Free for a quick call today?',
        d30:'Still thinking it over? Happy to send the numbers instead of calling.',
        d60:'Last one from me, Daniel. If your situation changed, I\u2019m here.',
        reply:'Actually yes — just had a kid. Can we talk this week?'
      }
    },

    immigration: {
      qz: {
        title: 'PR eligibility check',
        questions: [
          { q:'What pass are you on now?', hint:'', o:['Employment Pass','S Pass','Dependant Pass','No pass yet'], pick:0, fact:['Current pass','Employment Pass'] },
          { q:'How long have you held it?', hint:'', o:['Under 6 months','6 \u2013 12 months','1 \u2013 3 years','More than 3 years'], pick:2, fact:['Time on pass','1 \u2013 3 years'] },
          { q:'What\u2019s your monthly salary?', hint:'', o:['Under S$5,000','S$5,000 \u2013 8,000','S$8,000 \u2013 12,000','More than S$12,000'], pick:1, fact:['Monthly salary','S$5,000 \u2013 8,000'] },
          { q:'What are you applying for?', hint:'', o:['Permanent Residence','Citizenship','A work pass','Not sure yet'], pick:0, fact:['Applying for','Permanent Residence'] },
          { q:'Who\u2019s applying with you?', hint:'', o:['Just me','Me and my spouse','My whole family','Not decided'], pick:1, fact:['Applicants','Applicant + spouse'] },
          { q:'Have you applied before?', hint:'If you were rejected, the reason shapes the strategy.', o:['First time','Applied, was rejected','Currently pending','Not sure'], pick:0, fact:['History','First-time applicant'] }
        ],
        sendQ:'Where should we send your assessment?', sendHint:'A specialist will call to walk you through your chances.',
        cta:'Get my assessment', doneHint:'A specialist will call you shortly to go through your PR chances.',
        foot:'Sent to your consultants with all 6 answers'
      },
      ping: {
        header:'Leadly &middot; New Enquiries', agents:'You, Michelle, Joyce, Kevin',
        agentMsg:'Called the last one. Consult booked for Thursday \uD83D\uDC4D', tag:'NEW QUALIFIED ENQUIRY',
        lead:'<b>Arjun M.</b> &middot; EP holder<br>Wants: PR assessment<br>Salary: S$8&ndash;12k/mo<br>In SG: 3+ years'
      },
      sheet: {
        title:'PR Campaign — Enquiry Sheet', cols:['Wants','Salary','On pass'],
        rows:[
          ['Arjun M.', '9\u2022\u2022\u2022 \u2022\u202242','PR assessment','S$8\u201312k','3+ yrs','New'],
          ['Mei Chen', '8\u2022\u2022\u2022 \u2022\u202207','Citizenship',  'S$12k+',    '5+ yrs','Called'],
          ['Ravi S.',  '9\u2022\u2022\u2022 \u2022\u202288','PR assessment','S$5\u20138k', '2 yrs', 'Booked'],
          ['Ana G.',   '8\u2022\u2022\u2022 \u2022\u202231','EP renewal',   'S$8\u201312k','1 yr',  'Called'],
          ['Yusuf A.', '9\u2022\u2022\u2022 \u2022\u202215','PR \u2014 family','S$12k+',  '4 yrs', 'Booked'],
          ['Ling W.',  '8\u2022\u2022\u2022 \u2022\u202260','PR assessment','S$5\u20138k', '6 mo',  'Called']
        ]
      },
      wb: {
        name:'Ravi S.', sub:'last seen 2 months ago',
        d0:'Hi Ravi — you asked about your PR chances. Free for a quick call today?',
        d30:'Still weighing it up? The criteria shift each quarter — happy to send an updated read.',
        d60:'Last one from me, Ravi. If your salary or role changed, your case may be stronger now.',
        reply:'Actually yes — just got promoted. Can we talk this week?'
      }
    },

    clinic: {
      qz: {
        title: 'Treatment match check',
        questions: [
          { q:'What are you looking to treat?', hint:'', o:['Skin & complexion','Fine lines & wrinkles','Fat & body contouring','Hair loss'], pick:1, fact:['Interest','Fine lines & wrinkles'] },
          { q:'How long has it been on your mind?', hint:'', o:['Just started looking','A few months','Over a year','Ready to book now'], pick:1, fact:['Intent','Actively considering'] },
          { q:'Have you had a treatment before?', hint:'', o:['First time','Tried it elsewhere','I\u2019m a regular','Not sure what I need'], pick:0, fact:['Experience','First-timer'] },
          { q:'What\u2019s your budget for this?', hint:'', o:['Under S$300','S$300 \u2013 800','S$800 \u2013 2,000','Whatever it takes'], pick:1, fact:['Budget','S$300 \u2013 800'] },
          { q:'When would you want to come in?', hint:'', o:['This week','This month','Just exploring','I\u2019m flexible'], pick:0, fact:['Timing','This week'] },
          { q:'Which slot suits you best?', hint:'Pick what works \u2014 we\u2019ll fit you in.', o:['Weekday daytime','Weekday evening','Weekend','Any time'], pick:2, fact:['Availability','Weekend'] }
        ],
        sendQ:'Where should we send your match?', sendHint:'Our coordinator will message to book your consult.',
        cta:'Get my match', doneHint:'Our coordinator will message you shortly to book your consultation.',
        foot:'Sent to your front desk with all 6 answers'
      },
      ping: {
        header:'Leadly &middot; New Bookings', agents:'You, Front desk, Dr Tan',
        agentMsg:'Messaged the last one. Consult booked for Sat 2pm \uD83D\uDC4D', tag:'NEW CONSULT REQUEST',
        lead:'<b>Rachel T.</b> &middot; 31<br>Wants: fine lines / Botox<br>Budget: $300&ndash;800<br>When: this week'
      },
      sheet: {
        title:'Skin Campaign — Booking Sheet', cols:['Wants','Budget','When'],
        rows:[
          ['Rachel T.','9\u2022\u2022\u2022 \u2022\u202242','Fine lines / Botox','S$300\u2013800','This week', 'New'],
          ['Sophia L.','8\u2022\u2022\u2022 \u2022\u202207','Pigmentation',      'S$800\u20132k', 'This month','Booked'],
          ['Nur A.',   '9\u2022\u2022\u2022 \u2022\u202288','Fat freeze',        'S$800\u20132k', 'This week', 'Called'],
          ['Grace H.', '8\u2022\u2022\u2022 \u2022\u202231','Filler',            'S$300\u2013800','This week', 'Booked'],
          ['Divya R.', '9\u2022\u2022\u2022 \u2022\u202215','Acne / skin',       'Under S$300',  'Exploring','Called'],
          ['Bee Kim',  '8\u2022\u2022\u2022 \u2022\u202260','Hair loss',         'S$800\u20132k', 'This month','Called']
        ]
      },
      wb: {
        name:'Nur A.', sub:'last seen 3 weeks ago',
        d0:'Hi Nur — you asked about fat freeze. Want me to hold a consult slot this week?',
        d30:'Still thinking about it? Happy to send before/afters and pricing instead.',
        d60:'Last one from me, Nur. If you\u2019re ready, I can fit you in this week.',
        reply:'Actually yes — can I come by this Saturday?'
      }
    }
  };
  var PK = PACKS[(typeof window !== 'undefined' && window.LEADLY_VERTICAL) || 'insurance'] || PACKS.insurance;

  var WA_HEAD = function (title, sub, avatar) {
    return '<div style="flex:none;background:var(--wa-head);padding:14px 14px 12px;display:flex;align-items:center;gap:10px">' +
      '<span style="color:#fff;font-size:18px;line-height:1;opacity:.9">&#8249;</span>' + avatar +
      '<div style="min-width:0;flex:1">' +
        '<div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + title + '</div>' +
        '<div class="wa-sub" style="font-size:10.5px;color:rgba(255,255,255,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + sub + '</div>' +
      '</div><span style="color:#fff;opacity:.85;font-size:15px">&#8942;</span></div>';
  };
  var WA_INPUT =
    '<div style="flex:none;padding:8px 10px;display:flex;align-items:center;gap:8px">' +
      '<div style="flex:1;background:#fff;border-radius:99px;padding:8px 12px;font-size:12px;color:#B0B7BE;box-shadow:0 1px 1px rgba(0,0,0,.07)">Message</div>' +
      '<div style="width:34px;height:34px;border-radius:50%;background:var(--wa-send);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">&#10148;</div>' +
    '</div>';

  var MARKUP = {

    qualifier:
      '<div class="glow"></div><div class="pair">' +
        '<div class="phone shadow"><div class="screen">' +
          '<div style="padding:38px 18px 12px;border-bottom:1px solid var(--ui-line);flex:none">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:13px">' +
              '<div style="width:18px;height:18px;border-radius:5px;background:var(--accent);flex:none"></div>' +
              '<span style="font-size:11.5px;font-weight:600;color:var(--ui-ink);letter-spacing:-.01em">' + PK.qz.title + '</span>' +
              '<span class="q-step tick" style="margin-left:auto;font-size:10.5px;color:var(--ui-mute)">1 / 6</span>' +
            '</div>' +
            '<div style="height:4px;border-radius:99px;background:var(--ui-line);overflow:hidden">' +
              '<div class="q-bar" style="height:100%;width:17%;background:var(--accent);border-radius:99px;transition:width .55s cubic-bezier(.4,0,.2,1)"></div>' +
            '</div></div>' +
          '<div class="q-body" style="flex:1;padding:20px 18px;position:relative;overflow:hidden">' +
            '<div class="q-card" style="position:absolute;inset:20px 18px;transition:transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease">' +
              '<p class="q-text" style="font-size:16.5px;font-weight:600;color:var(--ui-ink);line-height:1.32;margin:0 0 6px;letter-spacing:-.01em"></p>' +
              '<p class="q-hint" style="font-size:11.5px;color:var(--ui-mute);line-height:1.4;margin:0 0 14px"></p>' +
              '<div class="q-opts" style="display:flex;flex-direction:column;gap:8px"></div>' +
            '</div></div>' +
          '<div class="q-foot" style="flex:none;padding:13px 18px 16px;border-top:1px solid var(--ui-line);text-align:center;font-size:10.5px;color:var(--ui-mute)">Free 2-minute check &middot; No obligation</div>' +
        '</div><canvas class="q-fx" style="position:absolute;inset:0;pointer-events:none;z-index:5"></canvas></div>' +
      '</div>',

    ping:
      '<div class="glow"></div><div class="pair">' +
        '<div class="phone shadow"><div class="screen" style="background:var(--wa-bg)">' +
          WA_HEAD(PK.ping.header, PK.ping.agents,
            '<div style="width:34px;height:34px;border-radius:50%;background:var(--wa-green);display:flex;align-items:center;justify-content:center;flex:none">' +
            '<span style="font-size:10px;font-weight:700;color:var(--wa-head)">LDY</span></div>') +
          '<div class="p-thread" style="flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:8px;justify-content:flex-end;overflow:hidden">' +
            '<div style="align-self:flex-start;max-width:78%;background:#fff;border-radius:10px 10px 10px 2px;padding:8px 10px;box-shadow:0 1px 1px rgba(0,0,0,.09)">' +
              '<div style="font-size:11px;font-weight:600;color:#E5688A;margin-bottom:3px">Marcus</div>' +
              '<div style="font-size:12.5px;color:#1F2C34;line-height:1.35">' + PK.ping.agentMsg + '</div>' +
              '<div style="text-align:right;font-size:9.5px;color:#98A2B3;margin-top:3px">10:41</div></div>' +
            '<div style="align-self:flex-end;max-width:70%;background:var(--wa-out);border-radius:10px 10px 2px 10px;padding:8px 10px;box-shadow:0 1px 1px rgba(0,0,0,.09)">' +
              '<div style="font-size:12.5px;color:#1F2C34;line-height:1.35">Nice. Who\u2019s next up?</div>' +
              '<div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:3px">' +
                '<span style="font-size:9.5px;color:#98A2B3">10:42</span>' +
                '<span style="font-size:10px;color:var(--wa-tick);line-height:1">&#10003;&#10003;</span></div></div>' +
            '<div class="p-card" style="align-self:flex-start;max-width:88%;background:#fff;border-radius:10px 10px 10px 2px;overflow:hidden;box-shadow:0 1px 1px rgba(0,0,0,.09);opacity:0;transform:translateY(16px) scale(.94);transition:all .5s cubic-bezier(.34,1.5,.64,1)">' +
              '<div style="background:var(--accent);padding:7px 10px;display:flex;align-items:center;gap:6px">' +
                '<div class="p-dot" style="width:6px;height:6px;border-radius:50%;background:#fff"></div>' +
                '<span style="font-size:11px;font-weight:700;color:#fff;letter-spacing:.02em">' + PK.ping.tag + '</span></div>' +
              '<div style="padding:9px 10px 8px">' +
                '<div style="font-size:11px;font-weight:600;color:#E5688A;margin-bottom:4px">Leadly Bot</div>' +
                '<div style="font-size:12.5px;color:#1F2C34;line-height:1.45">' + PK.ping.lead + '<br>&#128222; <span style="color:var(--accent);font-weight:600">+65 8&bull;&bull;&bull; &bull;&bull;&bull;&bull;</span></div>' +
                '<div style="text-align:right;font-size:9.5px;color:#98A2B3;margin-top:4px">10:42</div></div></div>' +
          '</div>' + WA_INPUT +
        '</div></div>' +
      '</div>',

    sheet:
      '<div class="glow"></div><div class="win shadow">' +
        '<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;background:#fff;border-bottom:1px solid #E0E0E0">' +
          '<div style="width:20px;height:24px;border-radius:3px;background:var(--gs-green);flex:none;display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px"><div style="width:11px;height:11px;border:1.5px solid #fff;border-radius:1px"></div></div>' +
          '<div><div style="font-size:12.5px;color:#202124;font-weight:500;line-height:1.2">' + PK.sheet.title + '</div>' +
          '<div style="font-size:10px;color:#5F6368;margin-top:2px">File &middot; Edit &middot; View &middot; Insert &middot; Data</div></div>' +
          '<div style="margin-left:auto;display:flex;align-items:center;gap:7px">' +
            '<div class="s-pulse" style="width:7px;height:7px;border-radius:50%;background:var(--gs-green)"></div>' +
            '<span style="font-size:11px;color:var(--gs-green);font-weight:600">Live</span>' +
            '<div style="width:26px;height:26px;border-radius:50%;background:#D93025;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff">M</div>' +
            '<div style="width:26px;height:26px;border-radius:50%;background:#1A73E8;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff;margin-left:-12px">P</div>' +
          '</div></div>' +
        '<div style="display:flex;background:#F8F9FA;border-bottom:1px solid #E0E0E0;font-size:10px;color:#5F6368">' +
          '<div style="width:30px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0"></div>' +
          '<div style="width:112px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">A</div>' +
          '<div style="width:104px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">B</div>' +
          '<div style="flex:1;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">C</div>' +
          '<div style="width:96px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">D</div>' +
          '<div style="width:84px;border-right:1px solid #E0E0E0;text-align:center;padding:3px 0">E</div>' +
          '<div style="width:88px;text-align:center;padding:3px 0">F</div></div>' +
        '<div style="display:flex;background:#E8F0FE;border-bottom:1px solid #C6DAFC;font-size:11px;font-weight:600;color:#1A3B6E">' +
          '<div style="width:30px;border-right:1px solid #E0E0E0;text-align:center;padding:7px 0;background:#F8F9FA;color:#5F6368;font-weight:400">1</div>' +
          '<div style="width:112px;border-right:1px solid #E0E0E0;padding:7px 8px">Name</div>' +
          '<div style="width:104px;border-right:1px solid #E0E0E0;padding:7px 8px">Phone</div>' +
          '<div style="flex:1;border-right:1px solid #E0E0E0;padding:7px 8px">' + PK.sheet.cols[0] + '</div>' +
          '<div style="width:96px;border-right:1px solid #E0E0E0;padding:7px 8px">' + PK.sheet.cols[1] + '</div>' +
          '<div style="width:84px;border-right:1px solid #E0E0E0;padding:7px 8px">' + PK.sheet.cols[2] + '</div>' +
          '<div style="width:88px;padding:7px 8px">Status</div></div>' +
        '<div class="s-rows" style="min-height:270px;background:#fff;position:relative"></div>' +
      '</div>',

    winback:
      '<div class="glow"></div>' +
      '<div class="phone shadow"><div class="screen" style="background:var(--wa-bg)">' +
        WA_HEAD(PK.wb.name, PK.wb.sub,
          '<div style="width:34px;height:34px;border-radius:50%;background:#B8C4CC;flex:none;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#5F6E78">DL</div>') +
        '<div class="w-thread" style="flex:1;min-height:0;padding:14px 12px;display:flex;flex-direction:column;justify-content:flex-end;gap:9px;overflow:hidden;-webkit-mask:linear-gradient(180deg,transparent 0,#000 9%,#000 100%);mask:linear-gradient(180deg,transparent 0,#000 9%,#000 100%)"></div>' +
        WA_INPUT +
      '</div><canvas class="w-fx" style="position:absolute;inset:0;pointer-events:none;z-index:5"></canvas></div>',

    pulse:
      '<div class="glow"></div><div class="win shadow">' +
        '<div style="display:flex;gap:6px;align-items:center;padding:11px 14px;background:var(--ui-soft);border-bottom:1px solid var(--ui-line)">' +
          '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
          '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
          '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
          '<div class="pu-url" style="margin-left:12px;font-size:10.5px;color:#98A2B3;background:#fff;border:1px solid var(--ui-line);border-radius:99px;padding:3px 12px">index.html</div></div>' +
        '<div class="pu-stage" style="position:relative;height:352px;overflow:hidden;background:var(--ui-bg)">' +
          '<div class="pu-s1" style="position:absolute;inset:0;display:flex;background:#0D1117;transition:opacity .7s ease">' +
            '<div style="flex:1;padding:16px 0;overflow:hidden"><pre class="pu-code" style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.85;color:#8B949E"></pre></div>' +
            '<div style="width:238px;flex:none;border-left:1px solid #21262D;padding:14px 12px;display:flex;flex-direction:column;gap:7px">' +
              '<div style="font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#6E7681;margin-bottom:3px">Events received</div>' +
              '<div class="pu-events" style="display:flex;flex-direction:column;gap:6px"></div></div></div>' +
          '<div class="pu-s2" style="position:absolute;inset:0;opacity:0;transition:opacity .7s ease">' +
            '<div class="pu-zoom" style="position:absolute;inset:0;display:flex;transform-origin:26% 66%;transform:scale(2.25);transition:transform 2.1s cubic-bezier(.55,.06,.24,1)">' +
              '<div style="width:120px;flex:none;background:var(--navy);padding:16px 11px;display:flex;flex-direction:column;gap:12px">' +
                '<div style="height:8px;width:62%;border-radius:99px;background:rgba(255,255,255,.22);margin-bottom:4px"></div>' +
                '<div style="display:flex;align-items:center;gap:7px;background:var(--accent);border-radius:6px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.9);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.65)"></div></div>' +
                '<div style="display:flex;align-items:center;gap:7px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.3);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.16)"></div></div>' +
                '<div style="display:flex;align-items:center;gap:7px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.3);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.16)"></div></div>' +
                '<div style="display:flex;align-items:center;gap:7px;padding:7px 8px"><div style="width:10px;height:10px;border-radius:3px;background:rgba(255,255,255,.3);flex:none"></div><div style="height:5px;flex:1;border-radius:99px;background:rgba(255,255,255,.16)"></div></div></div>' +
              '<div style="flex:1;padding:14px 16px 16px;display:flex;flex-direction:column;gap:12px;min-width:0">' +
                '<div class="pu-tiles" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div>' +
                '<div style="border:1px solid var(--ui-line);border-radius:9px;padding:10px 12px">' +
                  '<div style="font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ui-mute);margin-bottom:9px">Funnel — tracked events</div>' +
                  '<div class="pu-funnel" style="display:flex;flex-direction:column;gap:7px"></div></div>' +
                '<div style="border:1px solid var(--ui-line);border-radius:9px;padding:10px 12px;flex:1;min-height:0">' +
                  '<div style="font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ui-mute);margin-bottom:6px">Leads over time</div>' +
                  '<svg class="pu-chart" viewBox="0 0 460 84" style="width:100%;height:auto;display:block" aria-hidden="true">' +
                    '<defs><linearGradient class="pu-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0055E8" stop-opacity=".22"/><stop offset="100%" stop-color="#0055E8" stop-opacity="0"/></linearGradient></defs>' +
                    '<line x1="0" y1="21" x2="460" y2="21" stroke="#EFF1F4"/><line x1="0" y1="42" x2="460" y2="42" stroke="#EFF1F4"/>' +
                    '<line x1="0" y1="63" x2="460" y2="63" stroke="#EFF1F4"/><line x1="0" y1="83" x2="460" y2="83" stroke="#E4E7EC"/>' +
                    '<path class="pu-area" d="" opacity="0"/>' +
                    '<path class="pu-line" d="" fill="none" stroke="#0055E8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '<circle class="pu-head" r="4" fill="#0055E8" opacity="0"/></svg></div>' +
              '</div></div></div>' +
        '</div></div>',

    pulseboard:
      '<div class="glow"></div><div class="win shadow">' +
        '<div style="display:flex;gap:6px;align-items:center;padding:11px 14px;background:var(--ui-soft);border-bottom:1px solid var(--ui-line)">' +
          '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
          '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
          '<div style="width:9px;height:9px;border-radius:50%;background:#D8DCE2"></div>' +
          '<div class="pu-url" style="margin-left:12px;font-size:10.5px;color:#98A2B3;background:#fff;border:1px solid var(--ui-line);border-radius:99px;padding:3px 12px">app.leadly.sg</div></div>' +
        '<div class="pu-stage" style="position:relative;height:352px;overflow:hidden;background:var(--ui-bg)">' +
          '<div class="pb-zoom" style="position:absolute;inset:0;display:flex;transform-origin:50% 50%;transition:transform 1.15s cubic-bezier(.5,0,.2,1);will-change:transform">' +

          /* ── sidebar, as in the real app ── */
          '<div style="width:104px;flex:none;background:#0E0F11;padding:13px 10px;display:flex;flex-direction:column;gap:3px">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">' +
              '<span style="width:14px;height:14px;border-radius:4px;background:var(--accent);flex:none"></span>' +
              '<span style="font-size:9.5px;font-weight:700;color:#fff;letter-spacing:-.01em">Leadly Pulse</span></div>' +
            '<div style="font-size:7px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.34);margin-bottom:4px">Workspace</div>' +
            '<div class="pu-nav" style="display:flex;flex-direction:column;gap:2px"></div>' +
            '<div style="margin-top:auto;display:flex;align-items:center;gap:6px;padding-top:10px;border-top:1px solid rgba(255,255,255,.09)">' +
              '<span style="width:16px;height:16px;border-radius:50%;background:#2A6BF0;color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none">L</span>' +
              '<span style="font-size:8px;color:rgba(255,255,255,.62);line-height:1.2">Leadly<br><span style="color:rgba(255,255,255,.34)">Insurance</span></span></div>' +
          '</div>' +

          /* ── main pane ── */
          '<div style="flex:1;min-width:0;display:flex;flex-direction:column">' +
            '<div style="flex:none;padding:11px 14px 9px;border-bottom:1px solid var(--ui-line);display:flex;align-items:center;gap:7px">' +
              '<span style="font-size:12px;font-weight:700;color:var(--ui-ink)">Pulse</span>' +
              '<span class="pu-range" style="display:flex;gap:4px;margin-left:auto"></span></div>' +
            '<div style="flex:1;min-height:0;padding:11px 14px;display:flex;flex-direction:column;gap:9px;overflow:hidden">' +
              '<div class="pu-period" style="font-size:8.5px;color:var(--ui-mute);opacity:0;transition:opacity .5s ease">11 Jul \u2013 17 Jul \u00b7 vs previous period</div>' +
              '<div class="pu-tiles" style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px"></div>' +
              '<div style="flex:1;min-height:0;display:flex;gap:9px">' +
                '<div style="flex:1.15;min-width:0;border:1px solid var(--ui-line);border-radius:9px;padding:9px 10px;background:#fff;display:flex;flex-direction:column">' +
                  '<div style="font-size:8px;letter-spacing:.07em;text-transform:uppercase;color:var(--ui-mute);margin-bottom:6px">Enquiries \u00b7 last 7 days</div>' +
                  '<div style="flex:1;min-height:0"><svg class="pu-chart" viewBox="0 0 240 76" preserveAspectRatio="none" style="width:100%;height:100%;display:block">' +
                    '<defs><linearGradient class="pu-grad" x1="0" y1="0" x2="0" y2="1">' +
                      '<stop offset="0%" stop-color="#0055E8" stop-opacity=".26"/>' +
                      '<stop offset="100%" stop-color="#0055E8" stop-opacity="0"/></linearGradient></defs>' +
                    '<path class="pu-area" d="" fill="" opacity="0" style="transition:opacity .7s ease"/>' +
                    '<path class="pu-line" d="" fill="none" stroke="#0055E8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '<circle class="pu-head" r="3.6" fill="#0055E8" opacity="0"/></svg></div></div>' +
                '<div style="flex:1;min-width:0;border:1px solid var(--ui-line);border-radius:9px;background:#fff;overflow:hidden;display:flex;flex-direction:column">' +
                  '<div style="flex:none;display:flex;padding:7px 9px;background:var(--ui-soft);border-bottom:1px solid var(--ui-line);font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ui-mute)">' +
                    '<span style="flex:1">Campaign</span><span style="width:42px;text-align:right">Spend</span><span style="width:34px;text-align:right">Enq.</span></div>' +
                  '<div class="pu-rows" style="flex:1;min-height:0"></div></div>' +
              '</div>' +
              '<div class="pu-ask" style="flex:none;display:flex;align-items:flex-start;gap:7px;background:var(--tint);border:1px solid var(--tint-line);border-radius:9px;padding:8px 10px;opacity:0;transform:translateY(6px);transition:all .6s cubic-bezier(.16,1,.3,1)">' +
                '<span style="width:15px;height:15px;border-radius:4px;background:var(--accent);color:#fff;font-size:9px;display:flex;align-items:center;justify-content:center;flex:none">\u2726</span>' +
                '<span class="pu-asktxt" style="font-size:9.5px;line-height:1.45;color:#0C111D"></span></div>' +
            '</div></div>' +
          '</div>' +
          '<div class="pb-cap" style="position:absolute;left:12px;bottom:12px;z-index:4;display:flex;align-items:center;gap:7px;background:rgba(14,15,17,.92);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-radius:99px;padding:6px 13px 6px 9px;opacity:0;transform:translateY(6px);transition:all .5s cubic-bezier(.16,1,.3,1);pointer-events:none">' +
            '<span class="pb-dot" style="width:14px;height:14px;border-radius:50%;background:var(--accent);color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none">1</span>' +
            '<span class="pb-captxt" style="font-size:10px;font-weight:600;color:#fff;letter-spacing:-.01em;white-space:nowrap"></span></div>' +
        '</div></div>'
  };

  /* ═══ RUNNERS ═════════════════════════════════════════════════════════════ */

  async function qualifier(root) {
    var glow = root.querySelector('.glow'), bar = root.querySelector('.q-bar');
    var stepEl = root.querySelector('.q-step'), card = root.querySelector('.q-card');
    var qEl = root.querySelector('.q-text'), hintEl = root.querySelector('.q-hint');
    var optsEl = root.querySelector('.q-opts'), foot = root.querySelector('.q-foot');
    var fx = root.querySelector('.q-fx'), profile = root.querySelector('.q-profile');

    var Q = PK.qz.questions;

    var row = function (k, v) {
      var d = document.createElement('div');
      d.style.cssText = 'display:flex;flex-direction:column;gap:3px;padding:9px 12px;border:1px solid var(--grid-line);border-radius:9px;background:rgba(0,85,232,.05);opacity:0;transform:translateX(10px);transition:all .45s cubic-bezier(.34,1.4,.64,1)';
      d.innerHTML = '<span style="font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.56)">' + k + '</span>' +
                    '<span style="font-size:13px;color:#fff;font-weight:500;line-height:1.25">' + v + '</span>';
      if (!profile) return;              /* the readout was removed — focus is the device */
      profile.appendChild(d);
      requestAnimationFrame(function () { d.style.opacity = 1; d.style.transform = 'translateX(0)'; });
    };

    var draw = function (s) {
      optsEl.innerHTML = '';
      s.o.forEach(function (label) {
        var r = document.createElement('div');
        r.style.cssText = 'display:flex;align-items:center;gap:10px;padding:11px 12px;border:1.5px solid var(--ui-line);border-radius:11px;background:#fff;transition:all .35s cubic-bezier(.4,0,.2,1)';
        var shape = s.multi ? 'border-radius:5px' : 'border-radius:50%';
        r.innerHTML = '<div class="rd" style="width:16px;height:16px;' + shape + ';border:1.5px solid #D0D5DD;flex:none;transition:all .3s ease"></div>' +
                      '<span class="lb" style="font-size:12.5px;color:#344054;line-height:1.3;transition:color .3s ease">' + label + '</span>';
        optsEl.appendChild(r);
      });
    };

    while (true) {
      if (profile) profile.innerHTML = '';
      foot.textContent = 'Free 2-minute check \u00b7 No obligation';
      foot.style.color = 'var(--ui-mute)';

      for (var i = 0; i < Q.length; i++) {
        var s = Q[i];
        card.style.transform = 'translateX(30px)'; card.style.opacity = 0;
        await wait(216);
        qEl.textContent = s.q;
        hintEl.textContent = s.hint;
        hintEl.style.marginBottom = s.hint ? '14px' : '8px';
        draw(s);
        card.style.transition = 'none'; card.style.transform = 'translateX(-30px)';
        await wait(20);
        card.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease';
        card.style.transform = 'translateX(0)'; card.style.opacity = 1;
        stepEl.textContent = (i + 1) + ' / 6';
        bar.style.width = ((i + 1) / 6 * 100) + '%';
        await wait(792);

        var picked = optsEl.children[s.pick];
        picked.style.background = 'var(--accent)';
        picked.style.borderColor = 'var(--accent)';
        picked.style.transform = 'scale(.97)';
        picked.querySelector('.rd').style.cssText += ';background:#fff;border-color:#fff;box-shadow:inset 0 0 0 3px var(--accent)';
        picked.querySelector('.lb').style.color = '#fff';
        glow.style.opacity = .42;
        await wait(140);
        picked.style.transform = 'scale(1)';
        Array.prototype.forEach.call(optsEl.children, function (c, n) {
          if (n !== s.pick) { c.style.opacity = .3; c.style.transform = 'translateX(-5px)'; }
        });
        row(s.fact[0], s.fact[1]);
        await wait(446);
        glow.style.opacity = .2;
        await wait(200);
      }

      card.style.transform = 'translateX(30px)'; card.style.opacity = 0;
      await wait(230);
      qEl.textContent = PK.qz.sendQ;
      hintEl.textContent = PK.qz.sendHint;
      hintEl.style.marginBottom = '14px';
      optsEl.innerHTML =
        '<div style="border:1.5px solid var(--ui-line);border-radius:11px;padding:11px 12px;margin-bottom:8px"><div style="font-size:9.5px;color:var(--ui-mute);margin-bottom:4px">Full name</div><div style="font-size:13px;color:var(--ui-ink);font-weight:500">Daniel Lim</div></div>' +
        '<div style="border:1.5px solid var(--ui-line);border-radius:11px;padding:11px 12px;margin-bottom:10px"><div style="font-size:9.5px;color:var(--ui-mute);margin-bottom:4px">Mobile number</div><div style="font-size:13px;color:var(--ui-ink);font-weight:500">+65 9\u2022\u2022\u2022 \u2022\u202242</div></div>' +
        '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:12px"><div style="width:15px;height:15px;border-radius:4px;background:var(--accent);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;flex:none">\u2713</div><span style="font-size:10px;color:var(--ui-mute);line-height:1.35">Agrees to be contacted \u00b7 PDPA compliant</span></div>' +
        '<div class="q-cta" style="background:var(--accent);color:#fff;text-align:center;font-size:13.5px;font-weight:600;padding:13px;border-radius:12px">' + PK.qz.cta + '</div>';
      stepEl.textContent = 'Last step';
      bar.style.width = '100%';
      card.style.transition = 'none'; card.style.transform = 'translateX(-30px)';
      await wait(20);
      card.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease';
      card.style.transform = 'translateX(0)'; card.style.opacity = 1;
      await wait(1080);

      var cta = optsEl.querySelector('.q-cta');
      cta.style.transition = 'transform .16s ease';
      cta.style.transform = 'scale(.96)';
      await wait(160);
      cta.style.transform = 'scale(1)';
      await wait(201);

      card.style.transform = 'translateX(30px)'; card.style.opacity = 0;
      await wait(244);
      qEl.textContent = 'You\u2019re all set.';
      hintEl.textContent = ''; hintEl.style.marginBottom = '10px';
      optsEl.innerHTML =
        '<div style="display:flex;align-items:center;gap:9px;padding:11px 12px;border-radius:11px;background:#ECFDF3;border:1px solid #ABEFC6;margin-bottom:10px">' +
          '<div style="width:20px;height:20px;border-radius:50%;background:#12805C;color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none">\u2713</div>' +
          '<span style="font-size:12.5px;color:#085D3A;font-weight:600">Assessment complete</span></div>' +
        '<div style="font-size:12.5px;color:#667085;line-height:1.5">' + PK.qz.doneHint + '</div>';
      foot.textContent = PK.qz.foot;
      foot.style.color = 'var(--accent)';
      card.style.transition = 'none'; card.style.transform = 'translateX(0)';
      await wait(20);
      card.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1),opacity .32s ease';
      card.style.opacity = 1;

      glow.style.opacity = .72;
      burst(fx, .46);
      await wait(2736);
      glow.style.opacity = .2;
      await wait(648);
    }
  }

  async function ping(root) {
    var glow = root.querySelector('.glow'), card = root.querySelector('.p-card');
    var timer = root.querySelector('.p-timer'), dot = root.querySelector('.p-dot');
    var phone = root.querySelector('.phone');
    if (!REDUCED) dot.animate([{opacity:1},{opacity:.25},{opacity:1}], { duration:1400, iterations:Infinity });

    while (true) {
      card.style.opacity = 0;
      card.style.transform = 'translateY(16px) scale(.94)';
      if (timer) timer.textContent = '0.0s';
      await wait(720);
      /* the readout carried this counter; without it, just hold the beat */
      if (timer) await countTo(timer, 0, 8.4, 1440, function (v) { return v.toFixed(1) + 's'; });
      else await wait(1440);

      card.style.opacity = 1;
      card.style.transform = 'translateY(0) scale(1)';
      glow.style.opacity = .6;
      /* the handset buzzes as the lead lands */
      if (!REDUCED && phone) {
        phone.classList.remove('is-buzz'); void phone.offsetWidth; phone.classList.add('is-buzz');
      }
      await wait(216);
      glow.style.opacity = .3;
      await wait(2592);
      glow.style.opacity = .2;
      await wait(432);
    }
  }

  async function sheet(root) {
    var glow = root.querySelector('.glow'), rows = root.querySelector('.s-rows');
    var pulseDot = root.querySelector('.s-pulse');
    if (!REDUCED) pulseDot.animate(
      [{opacity:1,transform:'scale(1)'},{opacity:.3,transform:'scale(1.6)'},{opacity:1,transform:'scale(1)'}],
      { duration:1600, iterations:Infinity });

    var data = PK.sheet.rows;
    var pill = function (t) {
      var map = { New:['#E8F0FE','#1A73E8'], Called:['#F1F3F4','#5F6368'], Booked:['#E6F4EA','#188038'] };
      return '<span class="pl" style="font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:99px;background:' + map[t][0] + ';color:' + map[t][1] + ';transition:all .4s ease">' + t + '</span>';
    };
    var cell = function (v, w, extra) {
      return '<div style="' + w + ';border-right:1px solid #E8EAED;padding:8px;font-size:11.5px;color:#202124;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' + (extra || '') + '">' + v + '</div>';
    };
    var makeRow = function (d, n) {
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

    while (true) {
      rows.innerHTML = '';
      for (var i = 0; i < data.length; i++) {
        var r = makeRow(data[i], i + 2);
        rows.prepend(r);
        Array.prototype.forEach.call(rows.children, function (c, n) {
          c.querySelector('div').textContent = n + 2;
        });
        await wait(30);
        r.style.opacity = 1;
        r.style.transform = 'translateY(0)';
        glow.style.opacity = .4;
        await wait(273);
        glow.style.opacity = .2;
        (function (rr) { setTimeout(function () { rr.style.background = '#fff'; }, 1300); })(r);
        await wait(432);
      }
      await wait(720);
      var top = rows.children[0].querySelector('.pl');
      top.textContent = 'Booked';
      top.style.background = '#E6F4EA';
      top.style.color = '#188038';
      top.style.transform = 'scale(1.12)';
      glow.style.opacity = .5;
      await wait(288);
      top.style.transform = 'scale(1)';
      glow.style.opacity = .2;
      await wait(2016);
    }
  }

  async function winback(root) {
    var glow = root.querySelector('.glow'), thread = root.querySelector('.w-thread');
    var presence = root.querySelector('.wa-sub'), fx = root.querySelector('.w-fx');

    var stamp = function (t) {
      return '<div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:3px">' +
        '<span style="font-size:9.5px;color:#98A2B3">' + t + '</span>' +
        '<span style="font-size:10px;color:var(--wa-tick);line-height:1">\u2713\u2713</span></div>';
    };
    var bubble = function (html, t, mine) {
      var d = document.createElement('div');
      d.style.cssText = mine
        ? 'align-self:flex-end;max-width:80%;background:var(--wa-out);border-radius:10px 10px 2px 10px;padding:8px 10px;box-shadow:0 1px 1px rgba(0,0,0,.09);opacity:0;transform:translateY(10px);transition:all .4s cubic-bezier(.34,1.4,.64,1)'
        : 'align-self:flex-start;max-width:80%;background:#fff;border-radius:10px 10px 10px 2px;padding:8px 10px;box-shadow:0 1px 1px rgba(0,0,0,.09);opacity:0;transform:translateY(10px);transition:all .4s cubic-bezier(.34,1.4,.64,1)';
      d.innerHTML = '<div style="font-size:12.5px;color:#1F2C34;line-height:1.4">' + html + '</div>' +
        (mine ? stamp(t) : '<div style="text-align:right;font-size:9.5px;color:#98A2B3;margin-top:3px">' + t + '</div>');
      thread.appendChild(d);
      requestAnimationFrame(function () { d.style.opacity = 1; d.style.transform = 'translateY(0)'; });
      return d;
    };
    var divider = function (txt) {
      var d = document.createElement('div');
      d.style.cssText = 'align-self:center;background:rgba(255,255,255,.75);border-radius:6px;padding:3px 10px;font-size:10px;color:#5F6E78;font-weight:600;letter-spacing:.02em;opacity:0;transition:opacity .4s ease';
      d.textContent = txt;
      thread.appendChild(d);
      requestAnimationFrame(function () { d.style.opacity = 1; });
    };
    var typing = function () {
      var d = document.createElement('div');
      d.style.cssText = 'align-self:flex-start;background:#fff;border-radius:10px;padding:10px 12px;box-shadow:0 1px 1px rgba(0,0,0,.09);display:flex;gap:4px';
      for (var i = 0; i < 3; i++) {
        var s = document.createElement('span');
        s.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#B0B7BE;display:block';
        if (!REDUCED) s.animate(
          [{opacity:.3,transform:'translateY(0)'},{opacity:1,transform:'translateY(-3px)'},{opacity:.3,transform:'translateY(0)'}],
          { duration:900, iterations:Infinity, delay:i * 150 });
        d.appendChild(s);
      }
      thread.appendChild(d);
      return d;
    };

    while (true) {
      thread.innerHTML = '';
      presence.textContent = PK.wb.sub;
      glow.style.opacity = .12;
      await wait(648);

      divider('DAY 0');   await wait(360);
      bubble(PK.wb.d0, '11:02', true);
      await wait(1440);

      divider('DAY 30');  await wait(360);
      bubble(PK.wb.d30, '09:14', true);
      await wait(1584);

      divider('DAY 60');  await wait(360);
      bubble(PK.wb.d60, '10:30', true);
      await wait(1152);

      presence.textContent = 'online';
      var t = typing();
      glow.style.opacity = .35;
      await wait(1224);
      t.remove();

      bubble(PK.wb.reply, '10:33', false);
      glow.style.opacity = .75;
      burst(fx, .5);
      await wait(504);
      bubble('<span style="color:#12805C;font-weight:600">Back in the funnel \u2197</span>', '10:33', false);
      await wait(2592);
      glow.style.opacity = .2;
      await wait(648);
    }
  }

  async function pulse(root) {
    var glow = root.querySelector('.glow'), url = root.querySelector('.pu-url');
    var s1 = root.querySelector('.pu-s1'), s2 = root.querySelector('.pu-s2');
    var zoom = root.querySelector('.pu-zoom');
    var codeEl = root.querySelector('.pu-code'), eventsEl = root.querySelector('.pu-events');
    var tiles = root.querySelector('.pu-tiles'), funnel = root.querySelector('.pu-funnel');
    var line = root.querySelector('.pu-line'), area = root.querySelector('.pu-area'), head = root.querySelector('.pu-head');

    /* the gradient id must be unique per instance or a second demo steals it */
    var grad = root.querySelector('.pu-grad');
    var gid = 'pf-' + Math.random().toString(36).slice(2, 8);
    grad.id = gid;
    area.setAttribute('fill', 'url(#' + gid + ')');

    var C = function (t, c) { return '<span style="color:' + c + '">' + t + '</span>'; };
    var CODE = [
      C('&lt;!-- Leadly tracking --&gt;', '#6E7681'),
      C('fbq','#D2A8FF') + '(' + C("'init'",'#A5D6FF') + ', ' + C("'PIXEL_ID'",'#A5D6FF') + ');',
      C('fbq','#D2A8FF') + '(' + C("'track'",'#A5D6FF') + ', ' + C("'PageView'",'#A5D6FF') + ');',
      '',
      C('utm','#79C0FF') + '.' + C('capture','#D2A8FF') + '();  ' + C('// source, campaign, adset, ad','#6E7681'),
      '',
      C('on','#D2A8FF') + '(' + C("'view_offer'",'#A5D6FF') + ',&nbsp;&nbsp;&nbsp;&nbsp;() =&gt; ' + C('send','#D2A8FF') + '(' + C("'ViewContent'",'#A5D6FF') + '));',
      C('on','#D2A8FF') + '(' + C("'q_start'",'#A5D6FF') + ',&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;() =&gt; ' + C('send','#D2A8FF') + '(' + C("'InitiateCheckout'",'#A5D6FF') + '));',
      C('on','#D2A8FF') + '(' + C("'q_submit'",'#A5D6FF') + ',&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;() =&gt; ' + C('send','#D2A8FF') + '(' + C("'Lead'",'#A5D6FF') + '));',
      '',
      C('// server-side, so ad blockers can\u2019t eat it', '#6E7681'),
      C('capi','#79C0FF') + '.' + C('mirror','#D2A8FF') + '({ ' + C('deduplicate','#79C0FF') + ': ' + C('true','#79C0FF') + ' });'
    ];
    var EVENTS = [['PageView','Pixel'],['ViewContent','Pixel'],['InitiateCheckout','Pixel + CAPI'],['Lead','Pixel + CAPI']];
    var FUNNEL = [['Ad clicks',1204,100],['Landed on page',1147,95],['Initiated questionnaire',486,40],['Submitted questionnaire',122,10]];
    var METRICS = [
      { k:'Spend', to:442.45, fmt:function(v){ return 'S$' + v.toFixed(2); } },
      { k:'Leads', to:87,     fmt:function(v){ return Math.round(v); } },
      { k:'Cost per lead', to:5.09, fmt:function(v){ return 'S$' + v.toFixed(2); } }
    ];

    tiles.innerHTML = METRICS.map(function (m) {
      return '<div style="background:var(--ui-soft);border-radius:8px;padding:9px 10px">' +
        '<div style="font-size:9px;letter-spacing:.07em;text-transform:uppercase;color:var(--ui-mute);margin-bottom:5px">' + m.k + '</div>' +
        '<div class="pu-v tick" style="font-size:15px;font-weight:600;color:var(--ui-ink)">\u2014</div></div>';
    }).join('');
    var vals = [].slice.call(tiles.querySelectorAll('.pu-v'));

    funnel.innerHTML = FUNNEL.map(function (f) {
      return '<div class="pu-fr" style="opacity:0;transform:translateX(-8px);transition:all .5s cubic-bezier(.34,1.4,.64,1)">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">' +
          '<span style="font-size:10.5px;color:#344054;font-weight:500">' + f[0] + '</span>' +
          '<span class="pu-fv tick" style="font-size:11px;color:var(--ui-ink);font-weight:600">0</span></div>' +
        '<div style="height:6px;border-radius:99px;background:var(--ui-line);overflow:hidden">' +
          '<div class="pu-fb" style="height:100%;width:0;background:var(--accent);border-radius:99px;transition:width .9s cubic-bezier(.4,0,.2,1)"></div></div></div>';
    }).join('');
    var frows = [].slice.call(funnel.querySelectorAll('.pu-fr'));

    var pts = [8,20,15,33,27,44,39,56,50,66,61,74,79];
    var X = function (i) { return (i / (pts.length - 1)) * 456 + 2; };
    var Y = function (v) { return 83 - (v / 86) * 78; };
    var d = pts.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
    line.setAttribute('d', d);
    area.setAttribute('d', d + ' L458 83 L2 83 Z');
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;

    while (true) {
      url.textContent = 'index.html';
      s1.style.opacity = 1; s1.style.pointerEvents = 'auto';
      s2.style.opacity = 0;
      zoom.style.transition = 'none'; zoom.style.transform = 'scale(2.25)';
      codeEl.innerHTML = ''; eventsEl.innerHTML = '';
      vals.forEach(function (v) { v.textContent = '\u2014'; });
      frows.forEach(function (r) {
        r.style.opacity = 0; r.style.transform = 'translateX(-8px)';
        r.querySelector('.pu-fb').style.width = '0';
        r.querySelector('.pu-fv').textContent = '0';
      });
      line.style.transition = 'none'; line.style.strokeDashoffset = len;
      area.style.opacity = 0; head.setAttribute('opacity', 0);
      glow.style.opacity = .16;
      await wait(576);

      for (var ci = 0; ci < CODE.length; ci++) {
        codeEl.insertAdjacentHTML('beforeend', '<div style="padding:0 16px;opacity:0;transition:opacity .25s ease">' + (CODE[ci] || '&nbsp;') + '</div>');
        (function (last) { requestAnimationFrame(function () { last.style.opacity = 1; }); })(codeEl.lastElementChild);
        await wait(115);
      }
      await wait(360);

      for (var ei = 0; ei < EVENTS.length; ei++) {
        var e = document.createElement('div');
        e.style.cssText = 'display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid #1F6FEB;border-radius:7px;background:rgba(31,111,235,.10);opacity:0;transform:translateX(10px);transition:all .4s cubic-bezier(.34,1.4,.64,1)';
        e.innerHTML =
          '<div style="width:6px;height:6px;border-radius:50%;background:#3FB950;flex:none;box-shadow:0 0 0 3px rgba(63,185,80,.18)"></div>' +
          '<div style="min-width:0;flex:1"><div style="font-size:10.5px;color:#C9D1D9;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + EVENTS[ei][0] + '</div>' +
          '<div style="font-size:9px;color:#6E7681">' + EVENTS[ei][1] + '</div></div>' +
          '<span style="font-size:9.5px;color:#3FB950">200</span>';
        eventsEl.appendChild(e);
        (function (ee) { requestAnimationFrame(function () { ee.style.opacity = 1; ee.style.transform = 'translateX(0)'; }); })(e);
        glow.style.opacity = .42;
        await wait(180);
        glow.style.opacity = .22;
        await wait(403);
      }
      await wait(648);

      url.textContent = 'app.leadly.sg / performance';
      s1.style.opacity = 0; s1.style.pointerEvents = 'none';
      s2.style.opacity = 1;
      glow.style.opacity = .34;
      await wait(540);

      for (var fi = 0; fi < frows.length; fi++) {
        frows[fi].style.opacity = 1;
        frows[fi].style.transform = 'translateX(0)';
        frows[fi].querySelector('.pu-fb').style.width = FUNNEL[fi][2] + '%';
        countTo(frows[fi].querySelector('.pu-fv'), 0, FUNNEL[fi][1], 900, function (v) { return Math.round(v).toLocaleString(); });
        await wait(446);
      }
      await wait(936);

      zoom.style.transition = 'transform 2.1s cubic-bezier(.55,.06,.24,1)';
      zoom.style.transform = 'scale(1)';
      glow.style.opacity = .5;
      await wait(648);

      METRICS.forEach(function (m, i) { countTo(vals[i], 0, m.to, 1700 + i * 160, m.fmt); });
      line.style.transition = 'stroke-dashoffset 2.1s cubic-bezier(.4,0,.2,1)';
      line.style.strokeDashoffset = 0;
      area.style.transition = 'opacity 1.3s ease .5s';
      area.style.opacity = 1;
      await wait(1512);

      head.setAttribute('cx', X(pts.length - 1));
      head.setAttribute('cy', Y(pts[pts.length - 1]));
      head.setAttribute('opacity', 1);
      if (!REDUCED) head.animate([{r:4,opacity:1},{r:8.5,opacity:.25},{r:4,opacity:1}], { duration:1800, iterations:Infinity });
      glow.style.opacity = .3;
      await wait(3024);
      glow.style.opacity = .18;
      await wait(504);
    }
  }

  async function pulseboard(root) {
    /* THE DASHBOARD, not the tracking code.
       This mirrors app.leadly.sg/demo: sidebar, date range, KPI tiles with
       period-over-period deltas, an enquiries trend, the campaign table and
       the Ask Pulse insight. Figures below are internally consistent —
       spend / impressions / clicks / enquiries all reconcile, because a
       dashboard that doesn't add up is the fastest way to lose an advisor. */
    var glow  = root.querySelector('.glow');
    var navEl = root.querySelector('.pu-nav');
    var rngEl = root.querySelector('.pu-range');
    var period= root.querySelector('.pu-period');
    var tiles = root.querySelector('.pu-tiles');
    var rows  = root.querySelector('.pu-rows');
    var line  = root.querySelector('.pu-line');
    var area  = root.querySelector('.pu-area');
    var head  = root.querySelector('.pu-head');
    var ask   = root.querySelector('.pu-ask');
    var askTx = root.querySelector('.pu-asktxt');
    var stage = root.querySelector('.pu-stage');
    var zoom  = root.querySelector('.pb-zoom');
    var cap   = root.querySelector('.pb-cap');
    var capTx = root.querySelector('.pb-captxt');
    var capDot= root.querySelector('.pb-dot');

    /* ── THE TOUR ───────────────────────────────────────────────────────────
       At showcase size the whole dashboard is ~330px wide, so every label in
       it is unreadable — the reason Kenneth said "too small can't see". So
       after the dashboard assembles, it ZOOMS to each feature in turn and
       names it. Origins are measured from the live DOM rather than guessed as
       percentages, so the framing stays correct at any panel width. */
    /* Origins MUST be measured while the layer is at rest. Measuring an element
       after a previous zoom is applied reads its transformed position, which
       produced origins like 149% and -14.5% and framed the wrong region. So
       every origin is taken once, at scale(1), and cached. */
    function measureOrigin(el) {
      var s0 = stage.getBoundingClientRect(), e0 = el.getBoundingClientRect();
      return {
        x: ((e0.left + e0.width / 2) - s0.left) / s0.width * 100,
        y: ((e0.top + e0.height / 2) - s0.top) / s0.height * 100
      };
    }
    function zoomTo(origin, scale) {
      if (!origin) return;
      zoom.style.transformOrigin =
        Math.max(0, Math.min(100, origin.x)).toFixed(1) + '% ' +
        Math.max(0, Math.min(100, origin.y)).toFixed(1) + '%';
      zoom.style.transform = 'scale(' + scale + ')';
    }
    function zoomOut() {
      zoom.style.transform = 'scale(1)';
    }
    function caption(n, txt) {
      capDot.textContent = n;
      capTx.textContent = txt;
      cap.style.opacity = 1;
      cap.style.transform = 'none';
    }
    function hideCaption() {
      cap.style.opacity = 0;
      cap.style.transform = 'translateY(6px)';
    }

    /* gradient ids must be unique per instance or a second demo steals the fill */
    var grad = root.querySelector('.pu-grad');
    var gid = 'pf-' + Math.random().toString(36).slice(2, 8);
    grad.id = gid;
    area.setAttribute('fill', 'url(#' + gid + ')');

    var NAV = [['Pulse', 1], ['Campaigns', 0], ['CRM', 0], ['Automations', 0], ['Studio', 0]];
    navEl.innerHTML = NAV.map(function (n) {
      return '<div style="font-size:8.5px;padding:4px 6px;border-radius:5px;' +
        (n[1] ? 'background:rgba(255,255,255,.11);color:#fff;font-weight:600' : 'color:rgba(255,255,255,.5)') +
        '">' + n[0] + '</div>';
    }).join('');

    var RANGES = ['Today', '7d', '30d'];
    rngEl.innerHTML = RANGES.map(function (r, i) {
      return '<span class="pu-rg" style="font-size:8px;padding:3px 7px;border-radius:99px;border:1px solid var(--ui-line);' +
        (i === 1 ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : 'color:var(--ui-mute)') + '">' + r + '</span>';
    }).join('');

    /* spend 1240 · impressions 108,600 · clicks 3,120 · enquiries 82
       → CPM 11.42 · CTR 2.87% · CPC 0.40 · cost/enquiry 15.12  (all check out) */
    var KPI = [
      { k:'Enquiries',        to:82,   d:'+7.8%',  up:1, fmt:function(v){ return Math.round(v); } },
      { k:'Cost per enquiry', to:15.12,d:'-2.5%',  up:0, fmt:function(v){ return 'S$' + v.toFixed(2); } },
      { k:'Spend',            to:1240, d:'+5.2%',  up:1, fmt:function(v){ return 'S$' + Math.round(v).toLocaleString(); } },
      { k:'Ad clicks',        to:3120, d:'+6.2%',  up:1, fmt:function(v){ return Math.round(v).toLocaleString(); } }
    ];
    tiles.innerHTML = KPI.map(function (m) {
      return '<div class="pu-tile" style="background:#fff;border:1px solid var(--ui-line);border-radius:8px;padding:7px 8px;opacity:0;transform:translateY(6px);transition:all .5s cubic-bezier(.16,1,.3,1)">' +
        '<div style="font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ui-mute);margin-bottom:3px">' + m.k + '</div>' +
        '<div style="display:flex;align-items:baseline;gap:4px">' +
          '<span class="pu-v tick" style="font-size:13px;font-weight:700;color:var(--ui-ink)">\u2014</span>' +
          '<span class="pu-d" style="font-size:7.5px;font-weight:600;opacity:0;transition:opacity .5s ease;color:' +
            (m.up ? '#12805C' : '#0055E8') + '">' + (m.up ? '\u25b2' : '\u25bc') + ' ' + m.d.replace(/^[+-]/, '') + '</span>' +
        '</div></div>';
    }).join('');
    var tileEls = [].slice.call(tiles.querySelectorAll('.pu-tile'));
    var vals    = [].slice.call(tiles.querySelectorAll('.pu-v'));
    var deltas  = [].slice.call(tiles.querySelectorAll('.pu-d'));

    /* 512 + 396 + 332 = 1240 spend · 34 + 27 + 21 = 82 enquiries */
    var CAMPAIGNS = [
      ['Retirement Readiness', 'Meta',   'S$512', 34],
      ['Income Protection',    'Meta',   'S$396', 27],
      ['Search \u2014 adviser SG', 'Google', 'S$332', 21]
    ];
    rows.innerHTML = CAMPAIGNS.map(function (c) {
      return '<div class="pu-row" style="display:flex;align-items:center;padding:7px 9px;border-bottom:1px solid var(--ui-line);opacity:0;transform:translateX(-8px);transition:all .5s cubic-bezier(.16,1,.3,1)">' +
        '<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px">' +
          '<span style="font-size:8.5px;font-weight:600;color:var(--ui-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c[0] + '</span>' +
          '<span style="display:flex;align-items:center;gap:3px">' +
            '<span style="width:4px;height:4px;border-radius:50%;background:#12805C"></span>' +
            '<span style="font-size:7px;color:var(--ui-mute)">' + c[1] + ' \u00b7 Live</span></span></span>' +
        '<span style="width:42px;text-align:right;font-size:8.5px;font-weight:600;color:var(--ui-ink)">' + c[2] + '</span>' +
        '<span class="pu-en tick" style="width:34px;text-align:right;font-size:8.5px;font-weight:600;color:var(--accent)">0</span></div>';
    }).join('');
    var rowEls = [].slice.call(rows.querySelectorAll('.pu-row'));
    var enEls  = [].slice.call(rows.querySelectorAll('.pu-en'));

    var pts = [9, 14, 11, 18, 16, 23, 20, 27, 25, 31, 29, 36, 34];
    var X = function (i) { return (i / (pts.length - 1)) * 236 + 2; };
    var Y = function (v) { return 72 - (v / 40) * 66; };
    var d = pts.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
    line.setAttribute('d', d);
    area.setAttribute('d', d + ' L238 74 L2 74 Z');
    var len = line.getTotalLength ? line.getTotalLength() : 400;

    var ASK = 'Income Protection is your cheapest enquiry at S$14.67 \u2014 about 3% under your account average.';

    function reset() {
      period.style.opacity = 0;
      tileEls.forEach(function (t) { t.style.opacity = 0; t.style.transform = 'translateY(6px)'; });
      vals.forEach(function (v) { v.textContent = '\u2014'; });
      deltas.forEach(function (x) { x.style.opacity = 0; });
      rowEls.forEach(function (r) { r.style.opacity = 0; r.style.transform = 'translateX(-8px)'; });
      enEls.forEach(function (e) { e.textContent = '0'; });
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len; line.style.transition = 'none';
      area.style.opacity = 0;
      head.setAttribute('opacity', 0);
      ask.style.opacity = 0; ask.style.transform = 'translateY(6px)';
      askTx.textContent = '';
      glow.style.opacity = .18;
      zoomOut(); hideCaption();
    }

    while (root.isConnected) {
      reset();
      await wait(560);

      period.style.opacity = 1;
      await wait(340);

      /* KPI tiles land one by one and count up — the numbers arriving is the point */
      for (var i = 0; i < KPI.length; i++) {
        (function (idx) {
          tileEls[idx].style.opacity = 1;
          tileEls[idx].style.transform = 'none';
          countTo(vals[idx], 0, KPI[idx].to, 900, KPI[idx].fmt);
          setTimeout(function () { deltas[idx].style.opacity = 1; }, 900);
        })(i);
        await wait(190);
      }
      await wait(680);

      /* the trend draws */
      line.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)';
      line.style.strokeDashoffset = 0;
      area.style.opacity = 1;
      await wait(1500);
      head.setAttribute('cx', X(pts.length - 1));
      head.setAttribute('cy', Y(pts[pts.length - 1]));
      head.setAttribute('opacity', 1);
      if (!REDUCED) head.animate([{ r:3.6, opacity:1 }, { r:7.5, opacity:.25 }, { r:3.6, opacity:1 }],
        { duration:1800, iterations:Infinity });

      /* campaigns fill in underneath */
      for (var r2 = 0; r2 < rowEls.length; r2++) {
        (function (idx) {
          rowEls[idx].style.opacity = 1;
          rowEls[idx].style.transform = 'none';
          countTo(enEls[idx], 0, CAMPAIGNS[idx][3], 700);
        })(r2);
        await wait(220);
      }
      await wait(760);

      /* and Pulse reads the numbers back to you */
      ask.style.opacity = 1; ask.style.transform = 'none';
      glow.style.opacity = .3;
      if (REDUCED) { askTx.textContent = ASK; }
      else {
        askTx.textContent = '';
        for (var ci = 0; ci < ASK.length; ci++) {
          askTx.textContent = ASK.slice(0, ci + 1);
          await wait(15);
        }
      }
      await wait(900);

      /* ── the five-feature tour ── */
      if (REDUCED) { await wait(4000); }
      else {
        var TOUR = [
          [tiles,                           2.05, 'Every number, period over period'],
          [root.querySelector('.pu-chart'), 2.15, 'Enquiries, day by day'],
          [rows,                            2.15, 'Down to the individual campaign'],
          [rngEl,                           2.40, 'Any date range, Meta or Google'],
          [ask,                             2.30, 'AI that reads the numbers for you']
        ];
        /* measure every origin FIRST, while nothing is scaled */
        for (var mi = 0; mi < TOUR.length; mi++) {
          TOUR[mi][3] = TOUR[mi][0] ? measureOrigin(TOUR[mi][0]) : null;
        }
        for (var ti = 0; ti < TOUR.length; ti++) {
          if (!root.isConnected) return;
          zoomTo(TOUR[ti][3], TOUR[ti][1]);
          caption(ti + 1, TOUR[ti][2]);
          await wait(2150);
        }
        hideCaption();
        zoomOut();
        await wait(1150);
      }

      await wait(1200);
      glow.style.opacity = .18;
      await wait(560);
    }
  }

  var RUNNERS = { qualifier: qualifier, ping: ping, sheet: sheet, winback: winback, pulse: pulse, pulseboard: pulseboard };

  /* ═══ MOUNT ═══════════════════════════════════════════════════════════════ */
  function mount(el) {
    if (el._leadlyDemo) return;
    var key = el.dataset.leadlyDemo;
    if (!MARKUP[key] || !RUNNERS[key]) return;
    el._leadlyDemo = true;

    el.classList.add('demo-stage', 'tex-dark');
    el.innerHTML = MARKUP[key];

    /* every phone gets its island, its glass and its side buttons */
    var ph = el.querySelector('.phone');
    if (ph) {
      ph.insertAdjacentHTML('beforeend',
        '<div class="island"><i></i></div>' +
        '<div class="btn-vol"></div><div class="btn-vol b2"></div><div class="btn-pow"></div>');
      var sc = ph.querySelector('.screen');
      if (sc) sc.insertAdjacentHTML('beforeend', '<div class="gloss"></div>');
    }

    /* the Call Sheet and Pulse are desktop windows — keep them LANDSCAPE */
    fitWindow(el);

    RUNNERS[key](el);
  }

  /* ═══ LANDSCAPE LOCK ════════════════════════════════════════════════════════
     .win is a fixed 680px desktop surface. On a narrow screen we do NOT reflow
     it — a spreadsheet squeezed into a phone column stops looking like a
     spreadsheet. We scale it down instead, which preserves the aspect ratio
     exactly. The wrapper takes the scaled height so the layout doesn't leave a
     hole underneath.                                                          */
  var WIN_W = 680;

  function fitWindow(root) {
    var win = root.querySelector('.win');
    if (!win) return;

    var wrap = win.parentNode;
    if (!wrap.classList || !wrap.classList.contains('win-fit')) {
      wrap = document.createElement('div');
      wrap.className = 'win-fit';
      win.parentNode.insertBefore(wrap, win);
      wrap.appendChild(win);
    }

    var apply = function () {
      var avail = wrap.clientWidth;
      if (!avail) return;                       /* panel still display:none */

      var s = Math.min(1, avail / WIN_W);
      if (s < 1) {
        win.style.transformOrigin = 'top left';
        win.style.transform = 'scale(' + s.toFixed(4) + ')';
      } else {
        win.style.transform = '';
        win.style.transformOrigin = '';
      }
      /* offsetHeight is the UNSCALED height, so this stays correct as the demo
         fills its rows. Without the observer below, the wrapper kept the height
         the window had while it was still EMPTY, and the layout collapsed. */
      var natH = win.offsetHeight;
      if (!natH) { wrap.style.height = ''; return; }   /* never pin it at zero */
      wrap.style.height = (s < 1) ? Math.round(natH * s) + 'px' : '';
    };

    apply();

    /* These demos build their content over time — the call sheet writes rows in
       one by one, Pulse swaps scenes. The window's height changes as they run,
       so the scaled wrapper has to follow it. */
    if (!win._leadlyFitRO && 'ResizeObserver' in window) {
      win._leadlyFitRO = new ResizeObserver(apply);
      win._leadlyFitRO.observe(win);
    }
    win._leadlyFitApply = apply;
  }

  function fitAll() {
    var stages = document.querySelectorAll('.demo-stage');
    for (var i = 0; i < stages.length; i++) {
      var w = stages[i].querySelector('.win');
      if (w && w._leadlyFitApply) w._leadlyFitApply();
      else fitWindow(stages[i]);
    }
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(fitAll, 120);
  });
  window.LeadlyDemoFit = fitAll;

  function init() {
    var els = document.querySelectorAll('[data-leadly-demo]');
    var auto = [];
    for (var i = 0; i < els.length; i++) {
      if (!els[i].hasAttribute('data-manual')) auto.push(els[i]);
    }
    if (!auto.length) return;
    if (!('IntersectionObserver' in window)) { auto.forEach(mount); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { mount(e.target); io.unobserve(e.target); } });
    }, { threshold: .25 });
    auto.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LeadlyDemo = { mount: mount };
})();
