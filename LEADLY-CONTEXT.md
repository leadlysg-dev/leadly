# LEADLY — FULL CONTEXT HANDOFF
### For Claude Code. Written 14 Jul 2026. Read this before touching anything.

---

## 0 · WHO AND WHAT

**Kenneth** — co-founder of Elephant & Ostrich LLP, trading as **Leadly**. Based in Melbourne, from Singapore. ~10 years in e-commerce, digital marketing and lead gen. He is an **architect and product decision-maker**, not a hand-coder — he directs AI tools to build and deploy. Assume he does not want to be taught; he wants the thing done, decisively, with the reasoning stated once.

**Leadly** is a **marketing technology company** — not an agency, not a SaaS. Productised acquisition (paid ads → funnel → CRM, sold by vertical), funded by agency revenue, with **Leadly Pulse** as the software layer clients log into.

**Positioning line, endorsed and load-bearing:**
> **"We own the digital conversion. You own the sale."**

Never build marketing that promises closes. Leadly optimises digital conversion; the advisors close.

---

## 1 · ARCHITECTURE

| Property | What it is |
|---|---|
| `leadly.sg` | Parent brand site. Credibility, not traffic. Mirrored off Framer to static HTML on Netlify. |
| `leadly.sg/for/insurance` | **THE landing page.** Where reps and paid ads point. Must be self-sufficient: Pixel, CAPI, speed, conversion events. |
| `leadly.sg/for/insurance/deck` | Same content as slides. Reps walk prospects through it. The qualifier is **live** in the deck. |
| `pulse.leadly.sg` | Pulse marketing site + self-serve signup. Separate repo. (Also his Deakin SIT120 project.) |
| `app.leadly.sg` | The Pulse dashboard itself. |
| GitHub org | `leadlysg-dev` |

`/assets/leadly-data.js` is the **shared config** both the LP and the deck read — CPL, period, pricing tiers, setup fee, component names. **Update once, both pages change. Never duplicate those numbers.**

---

## 2 · BRAND TOKENS

### Current (dark)
```
bg          #0D0D0D / #0A0A0A
text        #FFF at 100% / 75% / 56%
accent      #0055E8   (Leadly blue — this NEVER changes)
alert       #FA7A7A
fonts       Instrument Serif (display) · Satoshi (body) · Figtree (labels)
radii       4 / 8 / 12 / 24 / 999
container   1200px · hero 1440x900
```

### PENDING REBRAND — Leadly goes WHITE
Kenneth wants the site turned **white**, in the register of a reference he showed (a Dribbble shot by *We Are CreativeCo*): a **white page with a large near-black rounded panel** floating on it, a two-line headline (line 1 white, line 2 accent), and a **fan of cards** rotating inside.

- **Typeface:** unidentifiable from a screenshot. It's a **geometric sans, Circular/Cera lineage** — tall x-height, circular bowls, double-storey `a`. Built with **Figtree** (closest free match, already licensed in the stack), behind **one CSS variable `--display`**. Swapping to Plus Jakarta Sans / Outfit / Cera / Circular is one line. **Kenneth has not confirmed a final face.**
- **IP position taken:** lifting a typeface is fine (fonts are licensed, not owned). Cloning a studio's whole identity system is not. Built an original system in the same register.

**Going-light rules that were learned the hard way — reuse them:**
1. **A glow can't glow on white.** It becomes a **tint** — a soft blue radial that stains the page, not a blurred halo.
2. **Black shadows read as dirt on white.** Tint every shadow blue: `rgba(0,60,170,.12)` on the outer layers.
3. **The stage must have no background.** Cards-inside-cards is what makes an animation look bolted on.

**STILL OPEN:** the funnel hero and **both films** are composited on `#08090B`. A white brand orphans them — they need re-cutting on a light ground. Do this **after** the typeface is confirmed, not twice.

---

## 3 · THE CREATIVE PIPELINE

Lives at **`~/Desktop/leadly-creative`** on his Mac. Node CLI, `FAL_KEY` in a `.env`.

### Stack
| Job | Model |
|---|---|
| Router | **fal.ai** (one key, per-image billing) |
| Image generation | `fal-ai/gpt-image-2` (fallback id `openai/gpt-image-2`) |
| Image editing / variants | `fal-ai/nano-banana-pro/edit` (~$0.15/edit) |
| Voice | `fal-ai/elevenlabs/tts/eleven-v3` ($0.10 / 1k chars) |
| Word-level timings | `fal-ai/elevenlabs/speech-to-text` (Scribe) |
| Music | `fal-ai/elevenlabs/music` ($0.80/min) |

gpt-image-2 at 1920×1080: **~$0.03 low / $0.10 medium / $0.37 high.**
Video, if ever needed: Veo 3.1 for hero, Kling 3.0 for volume. **Sora is dead** — API discontinued 24 Sep 2026.

### Files
```
leadly-creative/
  .env                 FAL_KEY=...
  generate.js          node generate.js briefs/x.json      → N variants → out/<name>/<stamp>/
  generate-set.js      node generate-set.js ad-            → runs every brief with that prefix
  edit.js              node edit.js <img> "<change>" <n>   → Nano Banana Pro
  voice-test.js        auditions 6 voices on one line
  music-test.js        3 background beds, 30s each
  make-audio.js        full VO + music + word timings for the film
  briefs/*.json        { name, style, model, quality, n, image_size, prompt, negative }
  styles/*.txt         SHARED style blocks
  out/                 everything lands here
```

### The one idea that matters
**A shared style block is what makes a set look like a set.** Every brief in a family names the same `"style"` and inherits `styles/<name>.txt` **verbatim**. Generate them independently and you get five strangers. `styles/leadly-ui.txt` and `styles/insurance-ad.txt` already exist.

### ⚠️ OPEN SECURITY ITEM
**His first fal key was exposed in a screenshot and has not been rotated.** fal.ai → Settings → API Keys → delete → create → paste into `.env`. Nag him.

---

## 4 · WHAT'S BUILT

### `/for/insurance` — the landing page
7-step branching **Smart Qualifier** in the hero. It makes the prospect calculate their **own all-in cost per lead** (ad spend + agency fees + lists + staff hours × rate ÷ leads), then shows it against Leadly's all-in **S$25–40**. Feature-gap scoring ("you have 1 of the 5"). Lead scoring → HOT/WARM/COOL hidden field for the CRM.

Kicker: *"That questionnaire you just filled in — that's the product."*

Hero is the AI-generated **funnel render** (v1): grey particles deflecting off a machined sieve, a few blue ones passing through. 2.25MB PNG → responsive WebP set (1920/1440/1024 + mobile crop), **72KB at full width**, preloaded as LCP. Two-axis scrim; the qualifier card is frosted glass (`rgba(10,10,10,.76)` + backdrop-blur) so the blue glow bleeds around it.

### `leadly-components.html` — five animated product components
Hand-coded HTML/CSS/SVG. **Not AI video** — AI video is the wrong tool for UI motion (text warps, edges wobble, brand blue drifts). These cost $0, are editable in plain English, are vector-crisp, and can be recorded to MP4 for Meta creative for free.

IntersectionObserver-gated. `leadly-components-LIGHT.html` is the white variant.

| Component | What it proves |
|---|---|
| **Smart Qualifier** | Not a name and a number. Mirrors the real retirement questionnaire and builds a live *"what your advisor already knows"* profile beside the phone. |
| **Instant Ping** | Lead lands in the sales team's WhatsApp group in **under 10 seconds**. Full WhatsApp UI, `#075E54` header. |
| **Live Call Sheet** | Google Sheets UI, 6 columns of qualification data, rows writing themselves, a status flipping to Booked on its own. |
| **Winback Engine** | A WhatsApp exchange. Day 0 → Day 30 → Day 60 → *"Actually yes — just had a kid. Can we talk this week?"* Confetti. |
| **Leadly Pulse** | Two scenes: pixel/CAPI/UTM install with events firing 200 OK → cut to Pulse zoomed into the funnel → slow zoom-out to the live dashboard. |

### `leadly-white-hero.html` — the new white brand
White page, `#0E0F11` panel, Figtree, `#0055E8`. The **card-fan reel**: 8 ad creatives riding an arc (R=640px, 15.5° between cards, gone past 62°). Each card **counter-rotates 55%** so it fans rather than spins.

**The z-index bug, and the fix — do not regress this:**
- Cards were stacked with `z-index` computed from distance to centre. **z-index is an integer** — so when two cards swap order at the centre the swap lands in one frame. That was the visible pop. You cannot smooth an integer.
- **Fix:** removed z-index entirely. `transform-style: preserve-3d` on the pivot and cards, plus a continuous `translateZ((cos(angle)-1) * 340)`. The GPU sorts depth every frame; crossing cards slide past each other.
- **Second trap:** adding CSS `perspective` made the *outer* cards render **bigger** — the pivot sits far below the stage, and perspective projection blows up anything far from its origin. Keep `preserve-3d` (which alone gives depth sorting), **drop `perspective`**, and cue depth with an explicit `scale()`.

Ads live in one `ADS` array pointing at `ads/ad-0N-*.png`, with a gradient fallback that only swaps once the real image loads — so it never shows a broken image.

### The Pulse explainer film
**v2: 1:48, 30fps, 1080p** + square Meta cut. Plus a **0:30 cut** in 16:9, 1:1 and 9:16.

**Architecture — this is the whole trick:**
`film.html` is a **pure function of time**. `window.__render(t)` sets every element's state from `t` alone. No `requestAnimationFrame` loops, no CSS transitions. So Playwright **seeks** to an exact timestamp and screenshots each frame. **Zero drift, fully deterministic.** `render.js` does it in chunks (~500 frames per call). ffmpeg concatenates and muxes.

**Sync:** the VO went through Scribe, which returns **word-level timestamps**. Every visual beat is pinned to a word. The ad pauses itself *on* the word "pauses," not near it.

**Tempo is one constant:** `SP = 1.10` in `film.html`. Change that number and the entire film re-times.

**Audio:** Voice = **Will** (ElevenLabs). Music = **bed B** (warm, confident). Because B is warm from bar one and the film's first 42 seconds are supposed to feel *bad*, the arc is engineered **in the mix, not the composition**: the track runs low-pass filtered at 420 Hz and low volume under scenes 1–2, then the filter opens and it blooms to full **exactly on "So we built a third one."**

**The entire SFX bed was synthesised from scratch in numpy** — clicks, thuds, whooshes, risers, a boom, chimes, an alert, a success arpeggio. ~35 cues placed on word timings. Free, no API. Two sidechain compressors: music ducks hard under VO, SFX duck lightly.

**Total cost of the film: about US$1.60.** Edits that don't change the words cost **$0** and minutes.

**The structural move worth preserving:** scene 2 (a runaway ad burning money at 2am, unwatched) and scene 7 (the same ad, same shot, but the alert fires and it pauses itself) are **literally the same DOM element, cloned.** Same shot, different ending. That rhyme is the best twelve seconds in the film.

---

## 5 · THE CASE-STUDY DATA (Meta, 13 Jun – 12 Jul 2026, SGD)

**Blended:** S$442.45 spend · 45,110 impressions · 1,111 clicks · 2.46% CTR · **87 leads · S$5.09 CPL**

- **Smart Qualifier / LP route:** S$143.62, 331 clicks, 3.01% CTR, 320 LPV, **209 started the questionnaire, 16 leads**, S$8.98 CPL
- **On-Meta instant form route:** S$298.83, 780 clicks, 2.29% CTR, 71 leads, S$4.21 CPL

**193 of 209 self-disqualified and never reached the call sheet.**

> ⚠️ Questionnaire completion is **7.7%** — low against the 20–40% norm. Unresolved whether that's brutal qualification or fixable friction. **Worth investigating.**

---

## 6 · HARD RULES — VIOLATE THESE AND THE WORK IS WRONG

**1 · Transparency policy (Kenneth's own call, and it's correct).**
**No internal funnel metrics on any client-facing page.** No 209/193/16. No impressions/clicks/CTR. No two-route CPL comparison. No "why our LP route costs more" FAQ.
His reasoning: on cold traffic, an advisor reads *"209 started, 16 finished"* as **"their page is broken,"** not "they filter hard." That nuance needs a human in the room. **It lives in the sales deck, not the landing page.**
What stays public: **outcomes** (S$442.45 / 87 leads / S$5.09 CPL) — a result is not a confession.

**2 · The rep guardrail. Repeat it in every sales asset.**
**NEVER** compare a prospect's all-in cost per lead to **S$5.09**. S$5.09 is media-only; their number includes agency fees and staff time. Compare **all-in to all-in**: theirs vs Leadly's **S$25–40**. The fake comparison collapses the second a prospect does the arithmetic.

**3 · No unsourced stats. Ever.**
Two got caught today. Claude fabricated a *"47h industry average"*; Kenneth supplied a *"34% conversion increase"* that could not be sourced anywhere. Both removed.
The **real, citable** stat: **HBR 2011** (Oldroyd, McElheran & Elkington — audit of **2,241 US firms**): contacting a lead within the hour makes a firm **~7× more likely to qualify it** than waiting one more hour, and **60×** vs waiting 24h+. Average response time was 42h; 23% never responded.

**4 · No client brand names in Leadly marketing.** "Legacy Planner" and "Income Insurance" must not appear anywhere.

**5 · No text baked into generated images.** Copy lives in HTML — responsive, indexable, and it can't come back misspelled.

---

## 7 · CREATIVE DIRECTION FOR AD IMAGERY

`styles/insurance-ad.txt` — the rules, and they're deliberate:

- **Real Singapore, not stock.** HDB corridors at golden hour. A foreman's hands round a cooling kopi. East Coast Park at dusk. A hawker centre coming alive around a glowing laptop.
- **Nobody smiles at the camera.** People are turned away, in profile, or seen from behind. **No handshakes, no thumbs-up, no piggy banks, no umbrella-over-the-family.** Those clichés are why insurance advertising is invisible.
- **The bottom third of every frame is deliberately calm** — dark, out of focus, empty. The headline overlays there.
- **Never depict illness, hospital beds, or death.** Imply. Never show.

8 briefs exist: `ad-01-retirement` … `ad-08-pulse`. Portrait 1024×1408. ~80¢ for the set.

```
node generate-set.js ad-
mkdir -p ads
for d in out/ad-*/*/; do cp "$d"v1.png "ads/$(basename $(dirname $d)).png"; done
```

---

## 8 · OPEN ITEMS

**Blocking / do first**
1. **Rotate the exposed fal key.**
2. **Confirm the display typeface.** Everything downstream waits on it.
3. **Meta Pixel + CAPI on `/for/insurance`.** Not installed.
4. **The WhatsApp Instant Ping does not exist yet.** Submissions currently land in a Netlify Forms inbox. **The rep script's "call within 5 minutes" rule is fiction until this is built.** This is the biggest gap between what's marketed and what runs.

**Waiting on Kenneth**
- Tier pricing + setup fee (Claude proposed Starter S$1,497 / Growth S$2,497 / Scale S$3,997 + a S$1,500 setup and 3-month minimum — **unconfirmed**)
- Exact buyer: individual advisors vs agency leaders vs firms
- Market: Singapore vs Australia
- Rep lead source and compensation
- Component names (Smart Qualifier / Live Call Sheet / Instant Ping / Winback Engine / Leadly Pulse — Claude's proposal, unconfirmed)

**Queued**
- Re-cut the funnel hero and both films on a light ground, once the typeface lands
- GHL pipeline handoff
- Pulse: Stripe billing, Google Business Profile API approval
- A browser UI over the creative pipeline (so he stops using Terminal)
- Record the five components to MP4 → free Meta video creative

---

## 9 · KNOWN LIMITATIONS

- **Claude cannot read video.** A `.mov` screen recording was uploaded and was unreadable even after frame extraction. **Dribbble is blocked to fetch.** Kenneth's **PNG screenshots pasted into chat work perfectly.** Always ask for a screenshot or a URL — never a screen recording.
- **Long renders time out.** Chunk frame rendering to ~500 frames per shell call.

---

## 10 · HOW TO WORK WITH KENNETH

- **Decide. Don't present options.** He asks for a recommendation, not a menu.
- **Do it, don't explain it.** Then state the reasoning once, briefly, after it's done.
- **Baby-guide anything in Terminal.** Numbered steps, exact commands, one at a time. Assume no prior knowledge of the tooling — he's directing, not typing from memory.
- **Push back when he's wrong, and concede fast when he's right.** He cut the funnel internals from the LP against Claude's design and his reasoning was better. He also supplied a stat that didn't check out and accepted the correction without friction.
- He communicates **tersely, often via screenshot**. Don't mistake brevity for vagueness.
