# Strudel Playground

A local development environment for experimenting with [Strudel](https://strudel.cc/), a live coding music environment for JavaScript.

## What is Strudel?

Strudel is a JavaScript port of Tidal Cycles, designed for creating music through code. It allows you to:
- Live code music in real-time
- Create algorithmic patterns
- Manipulate sounds with effects
- Learn music and coding simultaneously

## Getting Started

### Running the Development Server

```bash
npm run dev
```

This will start a local development server (usually at `http://localhost:5173`). Open the URL in your browser to see the playground.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally before deploying.

## Project Structure

```
strudel-playground/
├── index.html          # Main HTML file with UI
├── main.js             # JavaScript with Strudel examples
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Using the Playground

### Interactive Buttons

The playground includes 4 example buttons:
1. **Example 1**: Simple drum pattern
2. **Example 2**: Melodic pattern with piano sounds
3. **Example 3**: Complex rhythm with room and delay effects
4. **Example 4**: Bass line with low-pass filter modulation

Click any button to play the pattern. Use the "Stop All" button to silence everything.

### Browser Console

Open your browser's developer console to experiment with Strudel code directly:

```javascript
// Simple drum patterns
sound("bd hh sd hh").play()

// Melodic patterns
note("c a f e").play()

// With effects
sound("bd sd").room(0.5).delay(0.25).play()

// Complex patterns
note("<c3 e3 g3 c4>").s("piano").slow(2).play()
```

### Mini-Notation Syntax

Strudel uses "mini-notation" for creating patterns:

- `bd hh sd hh` - Play sounds in sequence
- `bd*2` - Repeat a sound (plays bd twice)
- `[bd sd]` - Subdivision (play both in one step)
- `<bd sd hh>` - Alternation (alternate each cycle)
- `~` or `-` - Rest (silence)
- `bd sd, hh hh hh hh` - Polyrhythm (layer patterns)

### Example Patterns

```javascript
// Basic drums
sound("bd sd").play()

// Fast hi-hats
sound("bd [~ sd] hh*4 [~ bd]").play()

// Melody with effects
note("c3 e3 g3 c4")
  .s("piano")
  .room(0.3)
  .delay(0.125)
  .play()

// Bass line with filter sweep
note("<c2 [e2 g2] a2 [f2 e2]>")
  .s("sawtooth")
  .lpf("<400 800 1200 2400>")
  .play()

// Stack multiple patterns
stack(
  sound("bd sd"),
  sound("~ hh").fast(2),
  note("c3 e3 g3").s("piano")
).play()
```

## Modifying Examples

Edit `main.js` to change or add new examples. The file includes:
- Button event handlers for each example
- Inline comments explaining the patterns
- Additional pattern ideas in comments at the bottom

## Learn More

- [Strudel Workshop](https://strudel.cc/workshop/getting-started/) - Interactive tutorials
- [Strudel Documentation](https://strudel.cc/) - Full documentation
- [Strudel REPL](https://strudel.cc/) - Online playground
- [Tidal Cycles](https://tidalcycles.org/) - The original pattern language

## License

This project is set up for personal experimentation. Note that Strudel is open-source and requires derivative works to maintain open-source licensing.

## Tips

- Use headphones for the best audio experience
- Start simple and gradually add complexity
- Experiment with different sounds and effects
- Check the browser console for errors if sounds don't play
- Press Ctrl+C in the terminal to stop the dev server

Happy live coding!
