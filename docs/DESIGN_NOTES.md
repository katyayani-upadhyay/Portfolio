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
- Model defaults to `gemini-2.5-flash-lite`, overridable with `GEMINI_MODEL`.
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
