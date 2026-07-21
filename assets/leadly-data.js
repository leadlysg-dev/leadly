/* ═══════════════════════════════════════════════════════════════
   LEADLY — SHARED DATA
   Both /for/insurance/ and /for/insurance/deck/ read this file.
   Change it once, both update. Do not duplicate these numbers.

   RULE: Leadly's price is ONE offer — S$1,200/month, and it EXCLUDES
   media. Every time it renders it must read "S$1,200/month + your ad
   spend". Never print a Leadly per-lead price. There is no tier list.
   ═══════════════════════════════════════════════════════════════ */
window.LEADLY = {

  vertical: "Retirement & disability insurance",
  market:   "Singapore",

  /* ── THE OFFER (one price, excludes media) ──────────────────── */
  price:          1200,                        // S$ / month
  priceQualifier: "+ your ad spend",           // ALWAYS render with the fee
  callSLA:        "2 minutes",                  // how fast a qualified lead reaches the rep
  deliverySeconds: 8,                           // form → Google Sheet → WhatsApp

  /* ── THE FIVE COMPONENTS ────────────────────────────────────── */
  system: [
    { n:"Smart Qualifier", d:"A branching questionnaire that asks what your advisors would ask on the call — before the call. The lead is qualified the instant they submit, not over time." },
    { n:"Instant Ping",    d:"The moment a lead submits, their details land in your team's WhatsApp group. Not an email digest. Not a morning export. Seconds." },
    { n:"Live Call Sheet", d:"One shared, always-current Google Sheet of every lead and every answer they gave. Your advisors work from it. You watch it fill." },
    { n:"Winback Engine",  d:"Automatic re-engagement at 30 and 60 days for everyone who didn't convert first time. You already paid for them. We go back." },
    { n:"Leadly Pulse",    d:"Your dashboard. Spend, leads and performance — live, down to the individual ad. The same screen we look at." }
  ]
};
