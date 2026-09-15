# Katyayani Upadhyay — portfolio

Live at **https://portfolio-delta-sand-89.vercel.app/**

This is my personal site. It is a single page that presents my work as an AI/ML and
Data Science Engineer: three flagship projects with their measured results, my
experience at GobbleCube and NIELIT, a grouped skills map, NPTEL certifications, and a
small assistant that answers questions about me from a fixed set of facts.

## Stack

- **React 19 + Vite 6** with TypeScript
- **Tailwind CSS 3** with a CSS-variable theme (light "engineering paper" by default, dark slate toggle, follows your system preference on first visit)
- **Framer Motion** for a soft section reveal, a scroll-progress hairline, and the
  command palette transition, all disabled under `prefers-reduced-motion`
- **Vercel** for hosting and the `api/chat` serverless function
- **Vitest** for tests, **ESLint** for linting

Fonts are self-hosted through Fontsource (Schibsted Grotesk for text, IBM Plex Mono
for numbers and labels), so the page makes no third-party requests.

## Sections

1. **Hero** — name, tagline, positioning, profile links, a resume download
   (`public/resume.pdf`), and a spec-sheet block summarising the facts.
2. **Flagship projects** — QuickCommerce Copilot, GridLoad Demand & Experiments, and
   the Agentic AI Research Platform. Each full-width row shows the problem, what I
   built, a readout strip of real metrics, the tech involved, and GitHub + live links.
3. **Experience** — GobbleCube (AI Engineer Intern) and NIELIT (AI/ML Engineer Intern).
4. **Skills** — six groups: GenAI & Agentic AI, Data Science & Statistics, Data
   Engineering, AI/ML, MLOps & Deployment, Programming.
5. **Certifications** — four NPTEL courses.
6. **Contact** — email, links, and what I am looking for: AI/ML Engineer and Data
   Science Engineer roles, full-time, 2026.

Press `⌘K` (or `Ctrl K`) anywhere for a command palette that jumps to sections,
toggles the theme, downloads the resume, or opens my profiles.

## Content is data

Everything the site says lives in [`src/data/facts.json`](src/data/facts.json). The
components render from it and the chatbot's system prompt is generated from it, so
there is exactly one place to update a number, a date, or a link. A test in
`src/lib/facts.test.ts` checks the structure and that the key figures survive into the
prompt text verbatim.

## The assistant ("Ask about Katyayani")

A floating widget, bottom-right, collapsed by default. It sends the visitor's question
to `POST /api/chat`, a Vercel function that calls Gemini (`gemini-3.5-flash-lite` by
default, falling back once to `gemini-flash-lite-latest` if Google retires the pinned
model) with a system prompt built from the facts file. The prompt defines three lanes:

- **About me, covered by the facts** — a specific answer in the third person, two to
  four sentences, numbers and links exactly as written.
- **General or technical questions** ("what is RAG?", "explain CUPED") — a short
  generic answer, tied back to my work only when a fact genuinely relates.
- **Personal details not in the facts** — no guessing; it says I haven't shared that
  here and points to the contact links.

The hard rule is that nothing about me may be fabricated or embellished; every
personal claim must trace to `facts.json`.

Cost and abuse controls: 500-character input cap, low output-token limit, low
temperature, an in-memory per-IP token bucket (5 a minute with a burst of 6, so tapping
every chip is fine), and a soft daily budget per instance. A tripped limit answers
"One moment — a quick pause between questions, then ask away." Transient upstream
errors are retried once; if the call still fails or the free quota is exhausted, the
visitor sees "The assistant is resting — meanwhile, everything about Katyayani is on
this page." No raw errors ever reach the browser.

The implementation is in `server/chat/` (validation, rate limiting, prompt, Gemini
client, handler, Node adapter) and is fully tested with an injected `fetch`.
`api/chat.ts` is generated from it by `npm run build:api`: esbuild bundles
`server/chat/entry.ts` into one self-contained file with the facts inlined, so the
deployed function has no runtime imports to resolve. A test fails if the committed
bundle is stale, and `npm run check:api` does the same check on its own.

## Running locally

```bash
npm install
cp .env.example .env      # then add your GEMINI_API_KEY
npm run dev               # http://localhost:5173, /api/chat is bridged to the handler
```

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest
npm run build:api  # regenerate api/chat.ts after changing server/chat or facts.json
```

## Deployment

The site deploys from this repository to Vercel on every push to `main`. Vercel
detects Vite automatically and picks up `api/chat.ts` as a serverless function.
`GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) are set as environment variables in
the Vercel project. Nothing secret is committed; `.env` is gitignored.

## Contact

- Email: [katyayani1612@gmail.com](mailto:katyayani1612@gmail.com)
- LinkedIn: https://www.linkedin.com/in/katyayani-upadhyay
- GitHub: https://github.com/katyayani-upadhyay
- LeetCode: https://leetcode.com/u/Katyayani16
- Kaggle: https://www.kaggle.com/katyayaniupadhyay
