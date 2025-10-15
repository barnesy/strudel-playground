// Import the initStrudel function from @strudel/web
import { initStrudel } from '@strudel/web';

let isInitialized = false;

// Function to initialize Strudel on first user interaction (required for mobile)
async function ensureInitialized() {
    if (!isInitialized) {
        const status = document.getElementById('status');
        status.textContent = '⏳ Initializing audio...';
        console.log('🎵 Initializing Strudel audio...');

        try {
            await initStrudel();
            isInitialized = true;
            status.textContent = '✅ Audio ready! Playing...';
            console.log('✅ Strudel is ready! Audio should now work.');
        } catch (error) {
            status.textContent = '❌ Error: ' + error.message;
            console.error('Error initializing Strudel:', error);
            throw error;
        }
    }
}

console.log('🎵 Strudel playground loaded!');
console.log('👆 Tap any button to initialize audio and start playing.');

// Example 1: Simple drum pattern
document.getElementById('example1').addEventListener('click', async () => {
    await ensureInitialized();
    console.log('Playing Example 1: Simple drum pattern');
    sound("bd hh sd hh").play();
});

// Example 2: Melodic pattern with notes
document.getElementById('example2').addEventListener('click', async () => {
    await ensureInitialized();
    console.log('Playing Example 2: Melodic pattern');
    note("<c3 e3 g3 c4>").s("piano").play();
});

// Example 3: Complex rhythm with effects
document.getElementById('example3').addEventListener('click', async () => {
    await ensureInitialized();
    console.log('Playing Example 3: Complex rhythm with effects');
    sound("bd*2 [~ sd] hh*4 [~ bd]")
        .room(0.5)
        .delay(0.25)
        .play();
});

// Example 4: Bass line with modulation
document.getElementById('example4').addEventListener('click', async () => {
    await ensureInitialized();
    console.log('Playing Example 4: Bass line');
    note("<c2 [e2 g2] a2 [f2 e2]>")
        .s("sawtooth")
        .lpf("<400 800 1200 2400>")
        .play();
});

// Stop button - stops all playing patterns
document.getElementById('stop').addEventListener('click', async () => {
    await ensureInitialized();
    console.log('Stopping all patterns');
    hush();
});

// Add touch event support for mobile
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.click();
    }, { passive: false });
});

// Additional patterns you can try in the console after clicking a button:
/*

After the first button click, all Strudel functions are globally available!

// Simple drum patterns:
sound("bd sd").play()
sound("bd hh sd hh").play()
sound("bd*2 sd").play()

// Melodic patterns:
note("c a f e").play()
note("<c3 e3 g3 c4>").s("piano").play()
note("c3 e3 g3 c4").slow(2).play()

// With effects:
sound("bd sd").room(0.5).play()
sound("bd hh sd hh").delay(0.125).play()
note("c a f e").lpf("1000").play()

// Complex patterns:
stack(
  sound("bd sd"),
  sound("~ hh").fast(2),
  note("c3 e3 g3").s("piano")
).play()

// Pattern transformations:
sound("bd sd cp").fast(2).play()
sound("bd sd cp").slow(2).play()
sound("bd sd cp hh").rev().play()

// Mini-notation examples:
sound("bd [sd sd] bd sd").play()           // subdivision
sound("bd sd*3 bd sd").play()               // repetition
sound("bd ~ sd ~").play()                   // rests
sound("<bd sd hh cp>").play()               // alternation
sound("bd sd, hh hh hh hh").play()         // polyrhythm

// To stop all sounds:
hush()

// Learn more at: https://strudel.cc/workshop/

*/
