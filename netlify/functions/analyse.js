/* ═══════════════════════════════════════════════════════════════════════════
   LEADLY — THE ANALYSIS ENDPOINT  ·  /netlify/functions/analyse.js

   This is a REAL model call. It is not a rules engine wearing an AI costume.

   The front end sends the answers the prospect gave the Smart Qualifier. Claude
   reads them and writes back a structured analysis: a diagnosis in plain words,
   the leaks it can see, a 90-day plan, and the priority to act on first. The
   page then draws that.

   ── WHAT IT IS ALLOWED TO SAY ─────────────────────────────────────────────
   The model is FORBIDDEN from inventing numbers. Every figure on the results
   screen is either
     (a) arithmetic on what the prospect typed in, or
     (b) the one cited third-party stat we actually have (Leads360 / Velocify).
   The model writes the JUDGEMENT — what the numbers mean, what to fix first,
   in what order. That is the part a model is genuinely good at and a rules
   engine is not, and it is why this is worth calling an AI analysis.

   If you let a model make up a "+340% conversion uplift", the whole page
   becomes a liability. The system prompt below says so explicitly.

   ── SETUP ────────────────────────────────────────────────────────────────
   Netlify → Site settings → Environment variables:
       ANTHROPIC_API_KEY = sk-ant-...
   Until that is set, this function returns 503 and the front end falls back to
   a deterministic analysis. The page never breaks; it just gets less good.
   ═══════════════════════════════════════════════════════════════════════════ */

const MODEL = 'claude-sonnet-4-6';

const SYSTEM = `You are the analysis engine behind Leadly's 2-minute check — a senior lead-generation
analyst at Leadly, a Singapore marketing-technology company that builds qualified-lead
infrastructure for insurance advisory teams: qualification funnels, instant WhatsApp delivery,
live call sheets, automatic 30/60-day winback, and Leadly Pulse (a live per-ad performance
dashboard). One flat fee, the client's own ad account, their spend never marked up.

A prospect — an agency principal or team leader who is busy and has heard every pitch — has
just completed the check. You are given their answers and arithmetic already done on their own
figures. Write the analysis an honest specialist would give a friend: sharp, specific to THEM,
zero filler.

THE LEADLY FRAMEWORK — the lens you analyse through:
- Infrastructure beats campaigns. Anyone can run one good campaign; a system that qualifies,
  routes, follows up and measures keeps working when the campaign fatigues.
- Speed-to-lead is the highest-leverage fix in this industry. A lead is warmest in the minutes
  after they raise their hand.
- Unqualified volume is a cost disguised as success: every unfiltered lead bills an advisor's hour.
- What isn't measured per-ad cannot be optimised; budget silently flows to losing creative.
- Most pipelines leak at the SECOND touch: no systematic 30/60-day re-ask means paid-for leads
  quietly expire.
- These patterns are what we see repeatedly in advisory teams we have built for in Singapore.
  You may reference these patterns qualitatively ("the pattern we see in teams like yours").

ABSOLUTE RULES — breaking any of these makes the output unusable:
1. NEVER invent a statistic, percentage, benchmark, or industry average. Not one. If you have
   not been given a number, you do not have it. Client-pattern references stay qualitative.
2. The ONLY citable study: leads called 60-120 seconds after they come in convert 160% more
   often than those called later (Leads360 / Velocify).
3. Do not promise results. Never "you will see X%". You may say what a gap costs them in their
   own numbers, and what closing it would change.
4. If they gave no spend figure, say plainly that they cannot improve a number they have never
   measured. Do not guess at their spend.
5. No hype words. No "revolutionise", "game-changing", "unlock". Write like an analyst who
   respects the reader. Confidence comes from specificity, not adjectives.
6. Address them as "you". Never "the client".
7. Their own numbers are the whole argument — every claim should point back at something THEY
   told you. Mirror their language where natural (their role, their team size, their sources).

Return ONLY a JSON object, no prose, no markdown fences:

{
  "verdict": "one line, max 12 words — the single truest thing about their setup",
  "diagnosis": "2-3 sentences. What their answers actually reveal, through the framework above. Specific to them, in their numbers.",
  "leaks": [
    { "title": "3-5 words", "detail": "one sentence — what is leaking and why it costs them", "severity": "high" | "medium" | "low" }
  ],
  "priority": {
    "title": "the ONE thing to fix first",
    "why": "one sentence — why this before anything else, for THEM"
  },
  "closing": "one sentence. Honest. If they genuinely don't need us, say so — that honesty is the brand."
}

leaks: 2-4 items, ordered by severity, each anchored to a specific answer they gave.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    /* No key configured. Tell the front end honestly so it can fall back —
       do NOT return a fake "AI" result. */
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on this site' })
    };
  }

  let facts;
  try {
    facts = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad json' }) };
  }

  const prompt = [
    'THEIR ANSWERS',
    `- Role: ${facts.role || 'not given'}`,
    `- Advisors needing leads: ${facts.advisors || 'not given'}`,
    `- Where leads come from today: ${(facts.sources || []).join(', ') || 'not given'}`,
    `- New leads per month: ${facts.leads || 'not given'}`,
    `- When they want this running: ${facts.timing || 'not given'}`,
    '',
    'THE ARITHMETIC ON THEIR OWN FIGURES (do not alter these, do not add to them)',
    `- All-in monthly cost of getting leads: ${facts.total ? 'S$' + facts.total : 'they did not give a figure'}`,
    facts.breakdown && facts.breakdown.length
      ? '- Made up of: ' + facts.breakdown.map(b => `${b[0]} S$${b[1]}`).join('; ')
      : '- No breakdown given',
    `- Cost per lead: ${facts.perLead ? 'S$' + facts.perLead : 'cannot be calculated from what they gave'}`,
    '',
    'THE FIVE PIECES OF THE SYSTEM — what they told us they already have',
    ...['Leads qualified before reaching an advisor',
        'New leads reach the team within seconds',
        'One shared live call list',
        'Automatic follow-up at 30 and 60 days',
        'A live dashboard of performance by ad'
       ].map(p => `- ${p}: ${(facts.features || []).includes(p) ? 'HAVE' : 'MISSING'}`),
    '',
    `They are missing ${facts.gaps != null ? facts.gaps : '?'} of the 5.`,
    '',
    'Leadly is one flat S$1,500/month plus their own ad spend, which we never mark up.'
  ].join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        system: SYSTEM,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const t = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'model call failed', detail: t.slice(0, 300) }) };
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    let out;
    try {
      out = JSON.parse(text);
    } catch {
      return { statusCode: 502, body: JSON.stringify({ error: 'model returned unparseable json' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(out)
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e).slice(0, 200) }) };
  }
};
