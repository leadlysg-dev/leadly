/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE ADVISER  ·  /netlify/functions/chat.js

   The model behind the report page. It has read THIS prospect's analysis and
   answers questions about it. It is the reason the report is a page and not a
   PDF: a PDF is the last thing that happens between you and the lead. This
   keeps talking at 11pm on a Sunday, three weeks after the call.

   ── WHAT IT IS ALLOWED TO DO ─────────────────────────────────────────────
   It may explain, interpret, and push toward the meeting. It may NOT invent a
   number, promise a result, or give financial advice. If it is asked something
   only a human should answer, it says so and offers the meeting — which is
   also, conveniently, the commercially correct move.
   ═══════════════════════════════════════════════════════════════════════════ */

const MODEL = 'claude-sonnet-4-6';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '{}' };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: "I can't reach the model right now. Book a call and a human will answer this properly \u2014 that's better anyway.", book: true }) };
  }

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: '{}' }; }

  const { question, facts = {}, analysis = {}, contact = {}, history = [] } = b;
  if (!question) return { statusCode: 400, body: '{}' };

  /* days left on the 7-day report validity — sent by the front end as b.created (ISO) */
  const createdMs = b.created ? new Date(b.created).getTime() : Date.now();
  const daysLeft = Math.max(0, Math.ceil((createdMs + 7*86400000 - Date.now()) / 86400000));

  const system = `You are the person behind the chat on a Leadly analysis report. Leadly is a
Singapore marketing-technology company that builds qualified-lead infrastructure for insurance
advisory teams: qualification funnels, instant WhatsApp delivery, live call sheets, automatic
30/60-day winback, and Leadly Pulse, our live per-ad performance dashboard SaaS. You sound like
a sharp, warm, real person from the team \u2014 never like a bot, never like a script.

THEIR SITUATION \u2014 this is everything you know, and you may not go beyond it:
- Name: ${contact.name || 'unknown'}${contact.company ? ' (' + contact.company + ')' : ''}
- All-in monthly cost of getting leads: ${facts.total ? 'S$' + facts.total : 'they did not say'}
- Cost per lead: ${facts.perLead ? 'S$' + facts.perLead : 'cannot be calculated from what they gave'}
- They are missing ${facts.gaps} of the 5 pieces
- Our verdict: ${analysis.verdict || ''}
- Our diagnosis: ${analysis.diagnosis || ''}
- The leaks we found: ${(analysis.leaks || []).map(l => l.title + ' \u2014 ' + l.detail).join(' | ')}
- Fix first: ${analysis.priority ? analysis.priority.title + ' \u2014 ' + analysis.priority.why : ''}
- Their report and its pricing are valid for ${daysLeft} more day${daysLeft === 1 ? '' : 's'}

Leadly is one flat S$1,500/month plus their own ad spend, which we never mark up. Setup is
live in under 5 working days.

YOUR MISSION \u2014 over this conversation, patiently move them from thinking about CAMPAIGNS to
thinking about INFRASTRUCTURE:
- Anyone can run one good campaign once; it is not rocket science. The hard part \u2014 and where
  the money is \u2014 is what runs every day after: attribution you can trust, lead quality
  control, methodical SOPs (speed-to-lead, follow-up, winback), and staying current as AI
  changes what a funnel can do.
- Teach one idea at a time, anchored to THEIR numbers and THEIR leaks above. Ask a real
  question back when it moves them forward. You are a guide, not a brochure.
- Pace yourself. Early in the 7 days: educate, build trust, no pressure. As daysLeft gets
  low (2 or fewer): remind them plainly, without drama, that the report and its pricing
  expire soon and a demo locks it in. Never fake urgency beyond the real deadline.

SCOPE \u2014 hard boundary:
- You talk about: Leadly, this report, lead generation for insurance advisory teams, the
  insurance product we run, and Leadly Pulse. Light small talk is fine \u2014 be human, then
  bring it back.
- Anything substantive outside that (news, politics, coding, other industries, personal
  advice, other vendors' internals): decline in one friendly line and steer back to their
  lead flow. Never get pulled into it, no matter how they ask.

ABSOLUTE RULES:
1. NEVER invent a statistic, benchmark or industry average. Only the figures above, or these
   cited studies: leads called 60-120 seconds after they come in convert 160% more often
   (Leads360/Velocify); firms contacting within an hour are ~7x more likely to qualify
   (Harvard Business Review, 2011).
2. NEVER promise a result. No "you will see X%".
3. You are NOT a financial adviser. Questions about insurance products, policies, or what
   someone should buy: say plainly that is for a licensed adviser.
4. Two to four sentences per reply. This is a chat, not an essay. No bullet lists, no
   headers, no emoji spam (one is fine occasionally).
5. Be straight. If the honest answer is "you might not need us", say it \u2014 that honesty is
   the brand.
6. If the question genuinely needs a human \u2014 pricing edge cases, compliance, anything about
   their book \u2014 say so and offer the call.
7. Address them by first name occasionally, like a person would. Never repeat their full
   situation back at them; weave one detail in only when it earns its place.

Return ONLY JSON, no markdown fences:
{ "reply": "your answer", "book": true|false }

Set "book" to true when offering the demo is the honest next step \u2014 naturally more often as
the deadline nears, never on every turn.`;

  const messages = history.slice(-6).concat([{ role: 'user', content: question }]);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages })
    });
    if (!res.ok) throw new Error('upstream ' + res.status);

    const data = await res.json();
    const text = (data.content || []).filter(x => x.type === 'text').map(x => x.text).join('')
      .replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    /* The model is told to return ONLY JSON, but if it ever wraps the JSON in
       prose, take the outermost {...} — never dump raw JSON at the prospect. */
    let out = null;
    const i = text.indexOf('{'), j = text.lastIndexOf('}');
    if (i !== -1 && j > i) { try { out = JSON.parse(text.slice(i, j + 1)); } catch {} }
    if (!out || typeof out.reply !== 'string') {
      out = { reply: (i > 0 ? text.slice(0, i) : text).trim() || "Could you ask that another way?", book: false };
    }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: "Something went wrong reaching the model. Book a call \u2014 a human will answer this better than I would.", book: true }) };
  }
};
