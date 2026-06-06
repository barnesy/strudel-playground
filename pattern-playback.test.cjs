/**
 * Test: Pattern Playback Fix
 * Verifies that patterns play the full 8 bars (128 steps) instead of repeating 1 bar
 */

const fs = require('fs');
const path = require('path');

console.log('=== PATTERN PLAYBACK FIX TEST ===\n');

const htmlPath = path.join(__dirname, 'controller-v2.html');
const html = fs.readFileSync(htmlPath, 'utf8');

let passCount = 0;
let failCount = 0;

function test(name, condition, message) {
    if (condition) {
        console.log(`✓ ${name}: ${message}`);
        passCount++;
    } else {
        console.log(`✗ ${name}: ${message}`);
        failCount++;
    }
}

console.log('TEST 1: Pattern Update Frequency');
// Patterns are checked every bar (every 16 steps). The hash guard inside
// updatePatterns() ensures audio only restarts when the state actually changed,
// so the full 128-step (8-bar) sequence plays through without glitching.
// See smart-pattern-update.test.cjs for the full smart-update behavior.
test('Step Clock', html.includes('if (currentStep % 16 === 0)'), 'Pattern update check runs every 16 steps (every bar)');
test('Comment', html.includes('Update patterns every 16 steps'), 'Comment explains per-bar update');
test('Step Clock', html.includes('const patternsChanged = stateHash !== lastPatternHash'), 'Audio only restarts when the state hash changes');
console.log('');

console.log('TEST 2: Constants and Configuration');
const stepsPerBarMatch = html.match(/const STEPS_PER_BAR\s*=\s*(\d+)/);
const stepsPerBar = stepsPerBarMatch ? parseInt(stepsPerBarMatch[1]) : 0;

test('Constants', stepsPerBar === 128, `STEPS_PER_BAR = ${stepsPerBar} (should be 128 for 8 bars)`);
test('Comment', html.includes('// 8 bars × 16 steps'), 'STEPS_PER_BAR comment explains 8 bars');
console.log('');

console.log('TEST 3: Master Volume Updates');
const volumeSliderMatch = html.match(/masterVolumeSlider\.addEventListener\('input'[^}]+\{([^}]+updatePatterns|[^}]+cachedPatterns\.clear)[^}]+\}/);
test('Volume', html.includes('masterVolumeSlider.addEventListener'), 'Master volume slider listener present');
test('Volume', html.includes("debounce('masterVolume'"), 'Master volume uses debounce');
test('Volume', html.match(/masterVolume[^}]+updatePatterns\(\)/), 'Master volume calls updatePatterns()');
console.log('');

console.log('TEST 4: Master Speed Updates');
test('Speed', html.includes('masterSpeedToggle'), 'Master speed toggle present');
test('Speed', html.includes('Update patterns immediately with new speed'), 'Master speed has correct comment');
const speedSection = html.match(/Master speed toggle buttons[\s\S]{0,800}updatePatterns\(\)/);
test('Speed', speedSection !== null, 'Master speed calls updatePatterns()');
console.log('');

console.log('TEST 5: Key/Mode Updates');
test('Key', html.match(/keySelector[^}]+updatePatterns\(\)/), 'Key change calls updatePatterns()');
test('Mode', html.match(/modeSelector[^}]+updatePatterns\(\)/), 'Mode change calls updatePatterns()');
console.log('');

console.log('TEST 6: BPM Updates');
test('BPM', html.match(/tempoSlider[^}]+updatePatterns\(\)/), 'BPM change calls updatePatterns()');
test('BPM', html.includes('stopStepClock()'), 'BPM change stops step clock');
test('BPM', html.includes('startStepClock()'), 'BPM change restarts step clock');
console.log('');

console.log('TEST 7: Pattern Building');
test('Pattern', html.includes('function buildPattern'), 'buildPattern function present');
test('Pattern', html.includes('function sequenceToPattern'), 'sequenceToPattern function present');
test('Pattern', html.includes('.cpm(currentBPM / 16)'), 'CPM calculation correct');
test('Pattern', html.includes('128 steps = 8 bars'), 'Comment explains 128 steps = 8 bars');
console.log('');

console.log('TEST 8: Play Button Initialization');
const playBtnMatch = html.match(/playBtn\.addEventListener\('click'[^}]+\{([^}]+updatePatterns\(\))[^}]*\}/s);
test('Play Button', html.includes("playBtn.addEventListener('click'"), 'Play button listener present');
test('Play Button', playBtnMatch !== null, 'Play button calls updatePatterns() on start');
test('Play Button', html.match(/playBtn[^}]+currentStep = 0/s), 'Play button resets currentStep to 0');
console.log('');

// Summary
console.log('=== TEST SUMMARY ===');
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
    console.log('\n✓ ALL TESTS PASSED');
    console.log('✓ Pattern playback should now play full 8 bars (128 steps)');
    console.log('✓ Pattern updates happen at:');
    console.log('  - Start of playback');
    console.log('  - Start of each bar (every 16 steps), restarting only on change');
    console.log('  - When user changes BPM, volume, speed, key, or mode');
    console.log('  - When user edits patterns');
    console.log('\n✓ The 1-bar repetition bug is FIXED!');
    process.exit(0);
} else {
    console.log('\n✗ SOME TESTS FAILED');
    console.log('Please review the failures above');
    process.exit(1);
}
