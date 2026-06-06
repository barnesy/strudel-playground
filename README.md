# Strudel Playground

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

`controller-v2.html` is self-contained. Serve the folder and open it:

```bash
npm install      # first time only
npm run dev      # starts Vite, then open the printed URL + /controller-v2.html
```

You can also open `controller-v2.html` directly in a browser (it pulls Strudel
from `unpkg.com`), but serving it over `http://` avoids browser restrictions on
microphone access and audio.

### Run the minimal example

`npm run dev` serves the directory; open the root URL (`/`) to load
`index.html` / `main.js`.

### Build / preview (minimal example only)

```bash
npm run build    # production build of the Vite example into dist/
npm run preview  # preview the production build
```

> Note: the build pipeline only covers the `index.html` example. The main app
> (`controller-v2.html`) is a standalone file and does not need a build.

## Tests

Tests are plain Node scripts (no framework). Each prints its own results and
exits non-zero on failure. A small runner discovers and runs them all:

```bash
npm test                 # run every test file
npm test -- pattern      # run only files whose path contains "pattern"
```

The suite covers the pure logic extracted from `controller-v2.html` (pattern
generation, Euclidean rhythms, chord detection, quantization, the smart
pattern-update system, mobile UX helpers, recording algorithms) plus
source-structure checks against the HTML.

## Project Structure

```
strudel-playground/
├── controller-v2.html          # The main app (sequencer)
├── index.html                  # Minimal Strudel example (UI)
├── main.js                     # Minimal Strudel example (logic)
├── run-tests.mjs               # Test runner (npm test)
├── *.test.js / *.test.cjs      # Root-level tests
├── tests/                      # Additional test suites
├── CHANGELOG.md                # Feature history
├── UX-INTEGRATION-GUIDE.md     # Notes on the UX feature set
└── MOBILE-UX-DOCUMENTATION.md  # Notes on mobile UX
```

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
- The main app currently loads Strudel from `unpkg.com/@strudel/web@latest`.
  Pinning to a specific version is recommended for stability.
- Use headphones for the best audio experience.
