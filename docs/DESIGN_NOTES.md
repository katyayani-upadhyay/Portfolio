# Design notes

Working log for the 2026 makeover of the portfolio. Newest decisions at the bottom.

## 1. Audit of the previous site (May 2026 build)

Stack found: React 19, Vite 6, Tailwind 3, Framer Motion 12, plus `react-scroll`,
`react-type-animation`, and `react-icons`. Plain JSX, no tests, no API routes.

| Area | Finding | Decision |
| --- | --- | --- |
| Palette | Navy `#1a1a2e` / cyan `#00f5c3` / red `#e94560`. Generic dark-portfolio look. | Replace. |
| Typography | JetBrains Mono as the body font, Poppins loaded but unused. Two Google Fonts requests. | Replace with one self-hosted display face and one mono. |
| Hero | Typing animation cycling four slogans, bouncing scroll chevron. | Remove. Static tagline, no motion gimmicks. |
| Section titles | Large translucent duplicate text behind each heading. | Remove. |
| Navigation | `react-scroll` spy links plus a floating scroll-to-top button. | Native anchors and `scroll-margin-top`. Drop the dependency. |
| Data | `src/data/portfolioData.jsx` mixes content with JSX icons. CGPA, dates and projects are out of date. | Replace with `src/data/facts.json`, plain data, used by both the site and the chatbot. |
| Content | About, Leadership and phone number sections; internship-seeking copy. | Drop all of them. Only the FACTS block is allowed on the site. |
| Assets | `public/favicon.png`, `favicon.ico`, `Resume.pdf`, `vite.svg`. | Keep favicons. Resume will be `public/resume.pdf` (lowercase, supplied separately). |
| Tooling | ESLint flat config for JS only. `.npmrc` with `legacy-peer-deps`. | Extend ESLint for TypeScript. Keep `.npmrc`. |
| Deployment | No `vercel.json`; Vercel auto-detects Vite. | Leave as is. Add `api/chat.ts`, which Vercel picks up automatically. |

Salvaged: the Vite + Tailwind + PostCSS scaffold, the ESLint base, `index.html` skeleton,
favicon files, the `engines` pin (Node 24) that Vercel uses. Everything in
`src/components` is rewritten.

## 2. Direction: precision instrument

The site should read like a well-made measuring instrument or a data sheet, not a
launch page. Concretely:

- **Structure over decoration.** Hairline rules, a visible column grid, numbered
  sections (`01 Projects`), and right-aligned mono metadata. No orbs, gradients,
  particles, blobs, or illustrations.
- **Numbers are the hero.** Every real metric is rendered as a readout: large
  tabular mono numerals, a small caption underneath, separated by hairlines in a
  strip. Nothing is animated into a fake count-up.
- **Two typefaces.** Schibsted Grotesk (variable) for display and body copy.
  IBM Plex Mono for numbers, labels, eyebrows, and the chatbot. Both are
  self-hosted through Fontsource so there are no third-party font requests.
- **One accent.** Signal amber, the colour of an indicator lamp. It marks the
  active state, the readout values, and focus rings. Nothing else is coloured.
- **Dark by default, light on request.** Theme is a class on `<html>` driven by
  CSS custom properties. The toggle persists to `localStorage` and falls back to
  `prefers-color-scheme`.
- **Motion is a whisper.** Elements rise 8 px and fade in once when they enter
  the viewport, 400 ms, ease-out. `useReducedMotion` turns all of it off.
  No scroll-jacking, no parallax, no hover tilt.
- **Density is deliberate.** Wide gutters, a 72 rem max width, and generous
  vertical rhythm so the readouts have room.

### Palette

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#0b0c0e` | `#f5f4f0` |
| `--bg-raised` | `#111316` | `#ffffff` |
| `--line` | `#22262b` | `#d9d6ce` |
| `--fg` | `#e8e9eb` | `#15161a` |
| `--fg-muted` | `#9aa0a6` | `#5b6069` |
| `--accent` | `#f0a533` | `#b3620a` |
| `--accent-ink` | `#0b0c0e` | `#ffffff` |

Contrast: muted text on both backgrounds clears WCAG AA for body sizes; accent
text is reserved for large readouts and the darker light-mode shade is used for
small accent text.

### Type scale

Display: 56/64 (hero name), 32/40 (section heads), 20/28 (card titles).
Body: 16/26. Labels and readout captions: 12/16 mono, tracked +0.08 em, uppercase.
Readout values: 32/36 mono with `font-variant-numeric: tabular-nums`.

## 3. Information architecture

Single page, anchored sections in this order:

1. `#top` Hero: name, tagline, positioning, link row, resume button.
2. `#projects` Flagship projects: three rich cards (problem, built, readout strip,
   tech chips, GitHub + Live). Copilot card carries the cold-start note.
3. `#experience` Timeline: GobbleCube, NIELIT, each with bullets and a readout strip.
4. `#skills` Six exact skill groups as chip lists, no proficiency bars.
5. `#certifications` One compact row.
6. `#contact` Email CTA, links, seeking statement. Footer inside.

The chatbot is a floating widget, bottom-right, collapsed by default.

## 4. Data integrity

`src/data/facts.json` is the only source of copy. Components import it; the
chatbot's system prompt is generated from it at request time by
`api/_lib/prompt.ts`. There is no other content file. If a fact is not in the JSON,
it does not appear on the site.

## 5. Chatbot

- The handler is written against the Web `Request`/`Response` API in
  `server/chat/handler.ts` and wrapped by a small Node `(req, res)` adapter. It
  calls Gemini's `generateContent` REST endpoint with plain `fetch`, so the
  function has zero runtime dependencies and cold-starts quickly.
- `api/chat.ts` is a generated bundle of `server/chat/entry.ts` (esbuild, facts
  inlined). The first deploy of a multi-file TypeScript function failed at
  invocation on Vercel; shipping one self-contained file removes every
  builder-specific failure mode. `server/chat/bundle.test.ts` fails if the
  committed bundle drifts from the source.
- Model defaults to `gemini-3.5-flash-lite` (was 2.5 until 2026-09-15, see log),
  overridable with `GEMINI_MODEL`; a 404 on the configured model retries once with
  the `gemini-flash-lite-latest` alias.
- Guardrails: 500-char input cap, 220 max output tokens, temperature 0.2,
  in-memory per-IP limiter (8 requests / minute), a soft per-instance daily cap.
- Any upstream failure returns the resting message. No error text leaves the
  function.
- The widget ships four chips: three grounded questions and one off-topic
  question that demonstrates the refusal behaviour.

## 6. Log

- 2026-09-10: Audit complete. Repo re-attached to `origin/main` (the working copy
  was a zip download identical to the remote). Direction set. Build started.
- 2026-09-10: All sections built from `facts.json`. Headless Chrome checks at 1440
  and 390 px in both themes: no horizontal overflow, reveal animation fires,
  console clean. Readout values longer than seven characters step down one size so
  `0% → 100%` fits a four-column strip.
- 2026-09-10: Lighthouse (desktop preset, production preview): performance 100,
  accessibility 100, best practices 100, SEO 91 → 100 after adding `robots.txt`
  and a one-URL sitemap. LCP 0.6 s, TBT 0 ms, CLS 0.
- 2026-09-10: Chatbot handler covered by 30 tests (validation, limiter, budget,
  refusal fallback, upstream failure paths). Verified locally through the Vite
  bridge: 400 for empty/oversized input, 405 for GET, resting message with no key.

- 2026-09-10: First push deployed the static site correctly but `/api/chat`
  returned FUNCTION_INVOCATION_FAILED. Replaced the multi-file TypeScript
  function with a generated single-file bundle and a Node-style default export.

- 2026-09-10: Redeploy verified live: `/api/chat` returns 400 for empty input,
  405 for GET, and the resting message for questions (no key configured yet).

## 7. Open items

- `GEMINI_API_KEY` must be added to the Vercel project before the assistant answers
  in production; until then it returns the resting message.
- Optional: a real-browser pass on the light theme at 768 px (tablet) once deployed.

---

# Revision 2 (2026-09-15): engineering paper, light-first

## 8. Why the change

The first revision read well but defaulted to a near-black wall, which the owner
wanted replaced with something closer to a printed engineering sheet: warm paper,
ink text, a faint graph-paper grid, and one confident accent. Dark mode stays as a
toggle, re-tuned to slate rather than black.

## 9. Tokens

| Token | Light (paper) | Dark (slate) |
| --- | --- | --- |
| `--bg` | `#f6f3ec` | `#0f1318` |
| `--bg-raised` | `#fbfaf6` | `#151a21` |
| `--line` | `#dcd6c8` | `#262d37` |
| `--fg` | `#14161a` | `#e6e8ec` |
| `--fg-muted` | `#5a5f68` | `#9aa3ad` |
| `--accent` | `#1d4ed8` | `#7aa2ff` |
| `--grid` | `rgba(20,22,26,.055)` | `rgba(230,232,236,.035)` |

Accent choice: electric blue over international orange. Orange at a usable
saturation lands near 3:1 on paper and fails AA for text; blue `#1d4ed8` is 6.05:1
on `--bg` and 6.42:1 on raised panels. Measured ratios (WCAG relative luminance):

| Pair | Light | Dark |
| --- | --- | --- |
| fg on bg | 16.3 | 15.2 |
| muted on bg | 5.8 | 7.3 |
| accent on bg | 6.1 | 7.5 |
| accent-ink on accent | 6.7 | 7.5 |

The grid is drawn by a fixed `body::before` with two 1px gradients at 32px pitch,
so it costs no image request and never scrolls with content.

## 10. Interaction layer

- **Scroll progress**: a 1px accent hairline at the top, `scaleX` bound to
  `useScroll`. It reports position rather than decorating, so it stays on under
  reduced motion.
- **Command palette** (`⌘K` / `Ctrl K`, also a nav button): sections, actions
  (toggle theme, download resume), and external links. `role="dialog"` with
  `aria-modal`, combobox/listbox semantics, arrow-key navigation, Tab focus trap,
  Escape to close, focus restored to the opener, body scroll locked while open.
- **Theme crossfade**: the toggle adds a `theme-transition` class to `<html>` for
  350ms that transitions colours only; skipped under reduced motion. Tokens are
  CSS variables so nothing re-lays out, only repaints.
- **Hover**: links underline-slide from the left (`background-size` on a 1px
  gradient); project rows and panels lift 2px with a deeper shadow.
- **Reveal**: unchanged 8px rise/fade, once.
- First visit follows `prefers-color-scheme`; an explicit toggle persists.

## 11. Layout changes

- Hero summary plate became a **spec sheet**: titled header, field count, seven
  rows, all values copied from `facts.json` (including counts derived from it).
- Projects are **full-width rows**: identity and actions on the left; problem,
  what I built, readout strip, and terminal-style tech chips (`›` prefix) on the
  right. Rows are hoverable panels.
- Section headers gained an accent index and a closing hairline.

## 12. Chatbot: three lanes

The prompt now routes each question into one of three lanes: (A) about Katyayani
and in the facts → specific third-person answer; (B) general or technical → brief
generic answer, connected to her work only when a fact genuinely relates; (C)
personal but not in the facts → a fixed "she hasn't shared that here" sentence with
the contact links. The hard rule stays: every claim about her must trace to
`facts.json`. A blocked or empty completion is treated as lane C, never guessed.
Input cap, output cap, temperature, per-IP limiter, daily budget, and the resting
fallback are unchanged.

Unit tests cover the prompt structure, the lane instructions reaching the model,
representative replies for each lane passing through untouched, the stale-number
sweep, and the fallback. Lane routing itself is model behaviour and is checked
manually against the live endpoint.

## 13. Log

- 2026-09-15: Root cause of the resting message with a valid key: Google returns
  404 `NOT_FOUND` for `gemini-2.5-flash-lite` ("no longer available to new users")
  while ListModels still advertises it. The handler swallowed the 404 into the
  resting fallback. Fixed by pinning `gemini-3.5-flash-lite`, retrying once on 404
  with the rolling alias, and logging upstream status + body server-side.

- 2026-09-15: Copilot facts updated to the 60-row eval results; tests assert the
  30-row numbers are gone everywhere, including the bundled prompt.
- 2026-09-15: Light-first redesign, command palette, scroll hairline, theme
  crossfade, spec sheet, project rows, three-lane assistant.
- 2026-09-15: Lighthouse on the production preview: desktop 100 / 100 / 100 / 100,
  mobile 95 / 100 / 100 / 100 (performance, accessibility, best practices, SEO).
  LCP 0.6 s desktop, 2.6 s mobile; TBT 0 ms; CLS 0 in both. Headless checks at
  1440 and 390 px in both themes: no horizontal overflow, console clean.
- 2026-09-15: Five-cell readout strips now sit 3 over 2 so no cell is left empty
  and numerals stay on one line in the narrower project column.

---

# Revision 3 (2026-09-15): art direction pass on the hero

## 14. Hero rhythm

The hero is now a single composed block: eyebrow, name (60–68 px at desktop, one
line), tagline, positioning, two buttons, link row on the left; instrument panel
and the agent-loop schematic on the right. Height is
`min(100svh − 12rem, 46rem)` at `md` and up, so at 1440×900 the block owns the
viewport and the "01 Flagship projects" heading peeks above the fold as the scroll
cue, while very tall or portrait screens never get a stretched hero. Below `md`
the hero is content-height.

## 15. Instrument panel

Five rows, right-aligned mono values, `white-space: nowrap`, hairline dividers,
a 2 px accent tick on the active row (Status). Every value is derived from
`facts.json`: Status "Open to AI/ML & DS roles — 2026", Now "AI Engineer Intern @
GobbleCube", Degree "B.Tech CS · CGPA 8.56", Projects "3 flagship, live", Eval
"60-row eval — gate PASS". Rows repeating the eyebrow or tagline were removed.
Keys are one word so nothing wraps at 390 px.

## 16. Signature visual

`AgentLoop.tsx`: an inline SVG (440×150 viewBox) of the Copilot's decide → act →
reflect cycle. Hairline 1 px strokes in the muted colour, arrowheads via a
marker, mono 9 px sub-labels, grotesk node names. The return path passes through
a diamond guardrail node, the single use of the accent, captioned
"guardrail · cite or refuse". Paths draw in with `pathLength` over ~1.8 s on
mount; nodes fade. Under `prefers-reduced-motion` everything renders static.
Hidden below `sm` where the labels would be illegible.

## 17. Font discipline

Grotesk (Schibsted) for nav, wordmark, buttons, headings, prose, chat UI text,
palette results. Mono (Plex) only for labels, numbers, timestamps, section
indices, chips, and panel values. Buttons: primary is solid accent
(`#1d4ed8` / `#7aa2ff`, ink 6.7:1 / 7.5:1) inverting to ink on hover; secondary
is a quiet keyline.

## 18. Accent and dark mode

Accent appears on section indices, link underline-slides, readout numerals, the
panel tick, the guardrail node, and primary buttons. Dark mode text lifted one
step: `--fg #eef0f3` (16.3:1), `--fg-muted #aab3bd` (8.8:1 on bg, 8.2:1 on
raised). Dark grid alpha raised from 0.035 to 0.06 so the texture is just
visible.

## 19. Density

Section padding 64/96 → 48/64 px, header gap 40/48 → 32/40, project rows 24 → 20
apart, experience rows 40 → 32. Readout numerals are large: 40 px at desktop for
short values, stepping down for long strings so no cell wraps.

## 20. Log

- 2026-09-15: Revision 3 shipped. Lighthouse (production preview): desktop
  100/100/100/100, mobile 95/100/100/100; LCP 0.6 s / 2.6 s; TBT 0 / 10 ms;
  CLS 0. Headless checks at 1440×900 and 390×844 in both themes: no overflow,
  console clean, panel values on one line, next section visible above the fold.
