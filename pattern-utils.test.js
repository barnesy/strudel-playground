// Tests for the shared pattern-utils module (public/js/pattern-utils.js).
// This is the single source of truth for the app's pure helpers; these tests
// exercise the module directly. Run with: node pattern-utils.test.js
import './public/js/pattern-utils.js';

const U = globalThis.StrudelUtils;

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ ${message}`);
        testsFailed++;
    }
}

function assertEqual(actual, expected, message) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ ${message}`);
        console.error(`   Expected: ${JSON.stringify(expected)}`);
        console.error(`   Actual:   ${JSON.stringify(actual)}`);
        testsFailed++;
    }
}

console.log('\n🧪 PATTERN-UTILS MODULE - TEST SUITE\n');
console.log('═'.repeat(50));

// Module loads and exposes the full API
console.log('\n📦 Module API\n');
const expectedNames = [
    'getSixteenthNoteDuration', 'quantizeToGrid', 'quantizeWithMode', 'detectOnsets',
    'sliceAudioByOnsets', 'timeToStepPosition', 'generateEuclidean', 'rotatePattern',
    'breedPatterns', 'calculateIntervals', 'detectChord', 'morphPatterns',
    'yPositionToBlendRatio', 'mapRange', 'tiltToFilterCutoff', 'tiltToVolume',
    'onsetsToPattern', 'quantizeOnsets', 'angleToNote', 'detectHarmonyRelation',
];
assert(U && typeof U === 'object', 'window.StrudelUtils is defined after import');
expectedNames.forEach(name => {
    assert(typeof U[name] === 'function', `exports ${name}()`);
});

// Timing helpers
console.log('\n⏱️  Timing\n');
assertEqual(U.getSixteenthNoteDuration(120), 125, '16th note at 120 BPM is 125ms');
assertEqual(U.getSixteenthNoteDuration(60), 250, '16th note at 60 BPM is 250ms');
assertEqual(U.quantizeToGrid(100, 120), 125, 'quantizeToGrid snaps 100ms -> 125ms');
assertEqual(U.quantizeWithMode(140, 120, 'strict'), 125, 'strict mode snaps to grid');
assertEqual(U.quantizeWithMode(142, 120, 'off'), 142, 'off mode preserves time');
assertEqual(U.timeToStepPosition(0, 120), 0, 'timeToStepPosition at 0ms is step 0');
assertEqual(U.timeToStepPosition(125, 120), 1, 'timeToStepPosition at 125ms is step 1');

// Euclidean rhythms
console.log('\n🥁 Euclidean\n');
assertEqual(U.generateEuclidean(3, 8), [0, 1, 0, 0, 1, 0, 0, 1], 'E(3,8) tresillo distribution');
assertEqual(U.generateEuclidean(4, 4), [1, 1, 1, 1], 'E(4,4) is all hits');
assertEqual(U.generateEuclidean(0, 4), [0, 0, 0, 0], 'E(0,4) is all rests');
assert(U.generateEuclidean(5, 8).filter(x => x === 1).length === 5, 'E(5,8) has 5 hits');
assertEqual(U.rotatePattern([1, 0, 0, 0], 1), [0, 0, 0, 1], 'rotatePattern by 1');

// Chord detection
console.log('\n🎹 Chords\n');
assertEqual(U.calculateIntervals(['C', 'E', 'G']), [4, 3], 'C major intervals are [4,3]');
assertEqual(U.detectChord(['C', 'E', 'G']), 'Major', 'C-E-G is Major');
assertEqual(U.detectChord(['C', 'D#', 'G']), 'Minor', 'C-D#-G is Minor');
assertEqual(U.detectChord(['C', 'G']), 'Perfect Fifth', 'C-G is a Perfect Fifth');
assertEqual(U.detectChord(['C']), 'Single Note', 'single note detected');

// Motion / range mapping
console.log('\n📐 Range mapping\n');
assertEqual(U.mapRange(0, -45, 45, 0, 1), 0.5, 'mapRange midpoint is 0.5');
assertEqual(U.mapRange(-100, -45, 45, 0, 1), 0, 'mapRange clamps below min');
assertEqual(U.tiltToVolume(45), 1, 'max tilt -> full volume');
assertEqual(U.yPositionToBlendRatio(50, 100), 0.5, 'y blend ratio midpoint');

// Onset -> pattern
console.log('\n🎚️  Onsets\n');
assertEqual(
    U.onsetsToPattern([0, 500, 1000, 1500], 120, 16),
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    'onsetsToPattern places hits on the beat'
);

// Color harmony
console.log('\n🎨 Color harmony\n');
assertEqual(U.angleToNote(0), 'C', 'angle 0 -> C');
assertEqual(U.angleToNote(360), 'C', 'angle 360 wraps to C');
assertEqual(U.detectHarmonyRelation([0, 180]), 'Tritone', '180deg apart is a Tritone');

// Summary
console.log('\n' + '═'.repeat(50));
console.log('\n📊 TEST SUMMARY\n');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
} else {
    console.log('⚠️  SOME TESTS FAILED\n');
    process.exit(1);
}
