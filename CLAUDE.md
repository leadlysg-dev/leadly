# Leadly — leadly.sg

Static site. No front-end build step. Minimal `package.json` (only `@netlify/blobs`, used by the Netlify functions). Deployed on Netlify from GitHub; every push to `main` auto-deploys.

**Read this whole file before touching anything.** It exists because multiple Claude sessions have worked on this repo independently and built conflicting things.

**Then read `LEADLY-CONTEXT.md`** — the full business/brand/creative handoff (who Kenneth is, architecture, creative pipeline, case-study data, open items). Where it describes builds not present in this repo, the repo wins; its hard rules always apply. **Where it describes the branding as green/all-caps/Hanken, it is STALE — `BRAND.md` + `brand.css` ("Paper & Stage") are the confirmed system (Rule 5).**

---

## The insurance page — one canonical build

`/for/insurance/` is **THE** insurance landing page — white canvas, the dark **stage** hero, the Smart Qualifier, the live product demos (tabbed), and the shared config. If asked to work on "the insurance page", it means `/for/insurance/`.

The old `/insurance/` duplicate has been **deleted**; `/insurance/*` 301-redirects to `/for/insurance/`. Don't recreate it.

**Verticals scale by path.** `/for/insurance` is the template. To launch a new vertical (clinics, immigration, property, …), duplicate the `/for/insurance/` folder to `/for/<vertical>/` and swap its copy + data — same brand, same components, same functions. The whole site is ONE Netlify deploy at leadly.sg; verticals are paths, not separate sites or subdomains.

**Pulse everywhere.** Every Leadly site and every new `/for/<vertical>` page carries (1) a "Leadly Pulse" secondary button in the nav → `https://pulse.leadly.sg`, and (2) a dedicated Pulse showcase section (`.pulse-showcase`, a `.two-col-alt` with copy + the live `data-leadly-demo="pulse"` on a `.stage-dark`) linking to `https://pulse.leadly.sg`. On vertical pages it sits after the system/what-we-do section; on the homepage, between "The work" and the productised callout. Duplicated verticals must keep both.

---

## What's in here

```
index.html                      leadly.sg homepage — Paper & Stage build (see Rule 4)
404.html
privacy-policy/index.html
terms-and-conditions/index.html
request-for-call/index.html

for/insurance/index.html        ★ THE landing page. Paid traffic + sales reps point here.
for/insurance/deck/index.html   ★ Presenter deck. Same sections, rep-driven, noindex.
for/insurance/pricing/index.html  Add-on & ad-hoc pricing (noindex)
for/insurance/demos/*           Standalone demo pages (retirement, income-protection, critical-illness)

animations/index.html           Animation/component showcase on the brand (noindex, not in nav)

assets/brand.css                ★ BRAND TOKENS — the one source (Rule 5)
assets/leadly-components.*       The stage + on-stage objects (phone, window, readout) + product demos
assets/leadly-reel.*            The fanned ad-creative reel (reads window.LEADLY_REEL)
assets/leadly-book.*            The "Book a call" booking modal (any [data-book] opens it)
assets/leadly-analysis.* · leadly-report.* · leadly-funnels.* · leadly-lockscreen.* · leadly-fx.js
                                 Reusable animated components, all built on brand.css tokens
assets/leadly-data.js           ★ SHARED CONFIG — the offer + product copy (Rule 1)
assets/ads/* · assets/logos/*   Ad creatives (reel) + logo assets

BRAND.md · brand-preview.html   Human-readable spec + live token/primitive preview
netlify.toml · _redirects · netlify/functions/*  (analyse, chat, deliver, report)
```

---

## ★ Rule 1 — never duplicate pricing or the monthly number

`/assets/leadly-data.js` is the **single source of truth** for the offer, the managed cost-per-lead, the period/vertical/market, the all-in range, and the product component names. Pages **read** from it; they never copy values out of it. **If you hardcode a price into a page, it will drift and a sales rep will quote the wrong number on a call.**

---

## ★ Rule 2 — the S$5.09 guardrail

`managedCPL` (S$5.09) is **media spend only.**

A prospect's "all-in cost per lead" includes their agency fees, freelancers, bought lists and staff hours. **These two numbers must never be compared.**

Always compare all-in to all-in: **their number vs `allInLow`–`allInHigh` (S$25–40)** — our retainer + spend ÷ leads delivered.

This isn't a style preference. Putting S$98 next to S$5.09 is a lie that collapses the second a prospect does the arithmetic, and it costs Leadly the deal. **Never write copy that makes that comparison.**

---

## ★ Rule 3 — no internal funnel metrics on client-facing pages

Kenneth's explicit instruction. **Never put on a public page:**

- ❌ Drop-off numbers (209 started / 193 disqualified / 16 completed)
- ❌ Impressions, clicks, CTR, CPM
- ❌ The two-route CPL comparison (landing page S$8.98 vs instant form S$4.21)

Public pages show **one** number: the latest managed cost per lead, dated, updated monthly. The rest lives in the sales deck and internal docs.

---

## ★ Rule 3b — three more hard rules (from LEADLY-CONTEXT.md §6)

- **No client brand names in Leadly marketing** — including insurer names.
  "Legacy Planner" and "Income Insurance" must not appear anywhere public.
  Client names were stripped from all insurance marketing for this reason; do not regress it.
- **No unsourced stats. Ever.** The one citable stat: HBR 2011 (Oldroyd,
  McElheran & Elkington, 2,241 firms) — contact within the hour ≈ 7× more
  likely to qualify the lead than waiting one more hour.
- **No text baked into generated images.** Copy lives in HTML.

---

## ★ Rule 4 — the homepage is now the Paper & Stage build

`index.html` was rebuilt from scratch on `brand.css` (15 Jul 2026), **replacing the old Framer mirror**. It is repositioned as a **marketing-technology company / credibility site** — Leadly builds acquisition software, it is not a lead-gen pitch. Sections: hero (the Pulse dashboard runs live on the stage) → thesis → *what we build* (feature-rows) → *the work* (the ad-reel on a stage) → productised-insurance callout → *"We own the digital conversion. You own the sale."* promise stage → final CTA. It reuses the shared booking modal (`[data-book]`), GTM, and the shared component/reel assets — no page-specific forks of tokens.

The four other root pages (`404`, `privacy-policy`, `terms-and-conditions`, `request-for-call`) are simple and may still carry legacy inline styling; retrofit them onto `brand.css` only if asked.

---

## ★ Rule 5 — `/assets/brand.css` is the ONLY source of colour, type, radius, spacing — system: **"Paper & Stage"**

Every design decision lives in **`/assets/brand.css`** — one portable token file shared by all properties (leadly.sg, /for/insurance, the deck, pulse.leadly.sg, app.leadly.sg). **`/BRAND.md`** is the full human-readable spec; **`/brand-preview.html`** renders every token and primitive. **`BRAND.md` is authoritative — this section is the summary.**

- **No hardcoded hex, font name, radius, or pixel gap anywhere outside `brand.css`.** If it isn't a `var(--token)`, it drifts. Convert on sight.
- **Link it, don't fork it.** Every page does `<link rel="stylesheet" href="/assets/brand.css">` then adds only page-specific layout CSS. Never copy token values into a page.
- **`brand.css` stays portable** — it drops into the Pulse repos verbatim.

**Identity in one line: a white page, dark stages, one blue.**

The page is **pure white** and mostly empty. A single **dark rounded panel** (`.stage-dark`, `#0E0F11`, 26px radius) lifts off the paper on a soft blue-tinted shadow. **That panel is the product** — it appears in the hero, once per product demo, and for *Our promise*, and nowhere else. Every stage carries a hairline grid (44px pitch) and one cobalt bloom. The on-stage objects (phone, window, readout) live in `/assets/leadly-components.css`.

- **Type: one family, `Figtree`** (400–800). Display is **sentence case, weight 600**, tracked tight/negative (`-0.033em`), `line-height 1.12`. The signature move: **the last line of a headline is set in the blue** (`<span class="accent">`). Tiny eyebrow labels are the only uppercase. **Weight 900 no longer exists.**
- **Colour: cobalt `#0055E8`** is the brand blue — CTA pills, links (`--accent-ink`), the `.accent` last line. Tint wash is **pale blue `#EBF1FE`**. Muted text `--text-3` `#667085` (AA).
- **Design language:** white canvas · dark **stage** for the product · sentence-case headers · the **feature-row** (text + hairline, no bullets/icons) · **tint-panel** framing imagery · **two-col-alt** alternating layout · **no gradients, no glassmorphism, no glow outside the stage bloom.**

**This voids the previous direction ENTIRELY. RETIRED — treat any occurrence in new work as a bug:** the all-caps / **green** (`#2FB985`) / Hanken Grotesk / "no dark panels" system is **dead**. Hanken → **Figtree**. Green → **cobalt `#0055E8`**. All-caps weight-900 display → **sentence case, weight 600**. "No dark panels" → **reversed; the dark stage is the signature object.** Green tint → **pale blue `#EBF1FE`**.

> **Migration status.** `/for/insurance`, its deck, the pricing sub-page **and the homepage** are all on Paper & Stage. `pulse.leadly.sg` (the Pulse SaaS marketing site) is built on the same `brand.css`. Full token table in `/BRAND.md`.

---

## The product, in the words the pages use

**Five named components — use these exact names:**

1. **Smart Qualifier** — branching questionnaire that filters leads before they reach an advisor
2. **Instant Ping** — new lead lands in the client's WhatsApp group within seconds
3. **Live Call Sheet** — one shared, live sheet of every lead and their answers
4. **Winback Engine** — automatic re-engagement at 30 and 60 days
5. **Leadly Pulse** — the client's dashboard (spend, leads, CPL, by ad)

**Positioning line, non-negotiable:** *"We own the digital conversion. You own the sale."*

Leadly is accountable from impression → qualified lead. **Never write copy promising closes, conversion rates, or ROI.**

---

## Tracking

- **GTM `GTM-5TR4KNPK`** — on every page. Preserve it.
- **GHL chat widget** (`widgets.leadconnectorhq.com`) — preserve where present.
- `dataLayer` events on `/for/insurance/`: `qualifier_start` → `qualifier_complete` → `qualifier_result` → `generate_lead`

---

## Not built yet — next up

1. **Meta Pixel + Conversions API** on `/for/insurance/` — it's a paid landing page running GTM only
2. **GHL handoff** — submissions land in a Netlify Forms inbox, not the CRM
3. **Instant Ping for Leadly's own leads** — the sales script promises *"call within 5 minutes"*, which is fiction until a submission hits the reps' WhatsApp
4. **Pulse pricing** — the Pulse SaaS page shows a 7-day free trial but no monthly price (Stripe not live). Set it when billing ships.

---

## Verifying visual changes

Before/after full-page screenshots at 1440×900 and 390×844, diffed with pixelmatch. Anything above ~1% difference in an area you didn't intend to touch is a regression.

```bash
npm i -D playwright pngjs pixelmatch && npx playwright install chromium
```

---

## Working style

Kenneth directs AI to build; he doesn't write the code himself. He wants **decisions made, not options presented.** Be direct, don't hedge, don't leave threads open. Where something is ambiguous: pick the better option, do it, and state plainly what you picked and why. Every Claude Code prompt should commit directly to `main` (no PR review step).

## Verticals built: /for/immigration + /for/clinics (16 Jul 2026)
- Live vertical pages duplicated from /for/insurance. Each sets `window.LEADLY_VERTICAL` ('immigration' | 'clinic') in <head> before brand.css, which themes the #system demos (qualifier/ping/sheet/winback) via the PACKS system in leadly-components.js. Insurance is the default pack (untouched).
- Tab rule: **Advertising + Leadly Pulse are the fixed core 2**; the middle 4 flex per vertical. Immigration: Eligibility Qualifier · Instant Ping · Live Enquiry Sheet · Winback. Clinics: Treatment Qualifier · Instant Booking · Live Booking Sheet · No-show Recovery.
- STRUCTURAL NOTE: leadly-lockscreen.js, leadly-funnels.js and leadly-analysis.js are STILL insurance-hardcoded (not themed). So on the verticals: the hero uses `data-leadly-demo="ping"` (themed) instead of `data-leadly-lock`; and the `#qualifiers` (3 funnel demos) and `#calculator` (true-cost tool) sections were REMOVED, along with the calculator's inline script. To re-add them per vertical later, theme those three JS files the same way components.js was themed (window.LEADLY_VERTICAL + packs).
- To add a new vertical (property, etc.): copy /for/insurance → /for/<vertical>, add a `clinic`/`immigration`-style pack to leadly-components.js PACKS, set LEADLY_VERTICAL, rework the middle-4 tab labels + sys-copy, hero/thesis/marquee/reel/comparison copy, do the same 3 structural removals, and scrub advisor/insurance terms. Price stays S$1,200.
