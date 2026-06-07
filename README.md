# Strudel Playground

[![CI](https://github.com/barnesy/strudel-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/barnesy/strudel-playground/actions/workflows/ci.yml)

A browser-based step sequencer built on [Strudel](https://strudel.cc/), the
JavaScript live-coding music environment (a port of Tidal Cycles).

The project is two things:

1. **`controller-v2.html` — the main app.** A full-featured, touch-friendly
   step sequencer with multiple tracks, presets, a timeline, audio recording,
   and a set of generative tools (Euclidean rhythms, pattern breeding, chord
   builder, gesture morphing). It is a single self-contained HTML file that
   loads Strudel from a CDN, so it runs without a build step.
2. **`index.html` + `main.js` — a minimal example.** A tiny four-button demo
   that loads Strudel via npm/ES modules. Useful as a starting point or a
   reference for the Strudel API; not the main app.

## Getting Started

### Run the main app

```bash
npm install      # first time only
npm run dev      # starts Vite; open the printed URL + /controller-v2.html
```

Locally the dev server serves the example at `/` and the app at
`/controller-v2.html`. (On Vercel a rewrite makes `/` serve the app — see
Deploying below.) Serving over `localhost` rather than opening the file
directly keeps audio and microphone access working.

### Run the minimal example

With `npm run dev` running, open the root URL (`/`) for `index.html` / `main.js`.

### Build / preview

```bash
npm run build    # multi-page production build into dist/
npm run preview  # preview the production build locally
```

The build is multi-page (see `vite.config.js`): it emits both
`controller-v2.html` (the app) and `index.html` (the example), and copies
`public/` verbatim — including the shared `js/pattern-utils.js` helper module.

## Deploying (Vercel)

`vercel.json` configures the deploy:

- **Build command:** `vite build`  →  **Output:** `dist/`
- **Rewrite:** `/` serves the app (`/controller-v2.html`); the minimal example
  stays reachable at `/index.html`.

Pushing a branch to a Vercel-connected repo produces a **preview URL** served
over HTTPS — the easiest way to test on a phone (audio and microphone require a
secure context, which `https://` and `localhost` both provide).

## Testing locally on a phone (e.g. Pixel Fold)

Audio/mic need a *secure context*: `https://` or `localhost`. Three options,
easiest first:

1. **Vercel preview URL** — open the preview link in Chrome on the phone. Real
   HTTPS, nothing to install. Best for the full app + microphone recording.
2. **Dev server on the phone (Termux).** In the repo:
   ```bash
   npm install
   npm run dev -- --host       # then open the printed http://localhost:5173/
   ```
   Open `/controller-v2.html` for the app. `localhost` counts as secure, so
   audio/mic work.
3. **Dev server on a laptop, phone on same Wi‑Fi.** Run `npm run dev -- --host`
   and open the `http://<laptop-ip>:5173/` "Network" URL on the phone. Note:
   a plain `http://<ip>` origin is **not** a secure context, so microphone
   recording will be blocked there — playback still works. Use option 1 or 2
   if you need to test recording.

After it loads: tap a control once to unlock the AudioContext (browsers require
a user gesture before audio can start), then press play.

## Tests

Tests are plain Node scripts (no framework). Each prints its own results and
exits non-zero on failure. A small runner discovers and runs them all:

```bash
npm test                 # run every test file
npm test -- pattern      # run only files whose path contains "pattern"
```

The suite covers the shared pure helpers in `public/js/pattern-utils.js`
(Euclidean rhythms, chord detection, quantization, onset detection, range
mapping), pattern generation, the smart pattern-update system, mobile UX
helpers, and recording algorithms — plus source-structure checks against the
HTML.

## Project Structure

```
strudel-playground/
├── controller-v2.html          # The main app (sequencer)
├── index.html                  # Minimal Strudel example (UI)
├── main.js                     # Minimal Strudel example (logic)
├── public/
│   └── js/pattern-utils.js     # Shared pure helpers (app + tests)
├── vite.config.js              # Multi-page build config
├── vercel.json                 # Deploy config
├── run-tests.mjs               # Test runner (npm test)
├── *.test.js / *.test.cjs      # Root-level tests
├── tests/                      # Additional test suites
├── CHANGELOG.md                # Feature history
├── UX-INTEGRATION-GUIDE.md     # Notes on the UX feature set
└── MOBILE-UX-DOCUMENTATION.md  # Notes on mobile UX
```

> The app pulls these helpers in via `window.StrudelUtils` (a classic
> `<script src="/js/pattern-utils.js">`), so the same code runs in the browser
> and under Node in the tests. This is the first step of breaking the
> single-file app into modules; more of `controller-v2.html` can follow the
> same pattern.

## Strudel Mini-Notation (quick reference)

The sequencer compiles to Strudel patterns. The underlying mini-notation:

- `bd hh sd hh` — play sounds in sequence
- `bd*2` — repeat a sound
- `[bd sd]` — subdivision (both in one step)
- `<bd sd hh>` — alternation (one per cycle)
- `~` — rest (silence)
- `bd sd, hh hh hh hh` — polyrhythm (layered patterns)

Try patterns directly in the [Strudel REPL](https://strudel.cc/).

## Learn More

- [Strudel Workshop](https://strudel.cc/workshop/getting-started/) — tutorials
- [Strudel Documentation](https://strudel.cc/)
- [Tidal Cycles](https://tidalcycles.org/) — the original pattern language

## Notes

- Strudel is open-source; derivative works are expected to remain open-source.
- The main app loads Strudel from `unpkg.com/@strudel/web@1.2.5` (pinned for
  stability; bump deliberately and re-test after upgrading).
- Use headphones for the best audio experience.
