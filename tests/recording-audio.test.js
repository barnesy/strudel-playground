// Tests for Audio Recording & Quantization Features
// Run with: node tests/recording-audio.test.js

// Test utilities
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

function assertClose(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) <= tolerance) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ ${message}`);
        console.error(`   Expected: ${expected} (±${tolerance})`);
        console.error(`   Actual:   ${actual}`);
        testsFailed++;
    }
}

console.log('\n🎙️  AUDIO RECORDING & QUANTIZATION - TEST SUITE\n');
console.log('═'.repeat(50));

// ============================================================================
// QUANTIZATION ENGINE TESTS
// ============================================================================

console.log('\n📐 TEST GROUP: Quantization Engine\n');

/**
 * Calculate the duration of a 16th note in milliseconds
 * @param {number} bpm - Beats per minute
 * @returns {number} Duration in milliseconds
 */
function getSixteenthNoteDuration(bpm) {
    return (60000 / bpm) / 4;
}

/**
 * Quantize a timestamp to the nearest 16th note grid position
 * @param {number} time - Time in milliseconds
 * @param {number} bpm - Beats per minute
 * @returns {number} Quantized time in milliseconds
 */
function quantizeToGrid(time, bpm) {
    const gridSize = getSixteenthNoteDuration(bpm);
    return Math.round(time / gridSize) * gridSize;
}

/**
 * Quantize with sensitivity (loose vs strict)
 * @param {number} time - Time in milliseconds
 * @param {number} bpm - Beats per minute
 * @param {string} mode - 'off', 'loose', 'strict'
 * @returns {number} Quantized time
 */
function quantizeWithMode(time, bpm, mode = 'strict') {
    if (mode === 'off') return time;

    const gridSize = getSixteenthNoteDuration(bpm);
    const nearestGrid = Math.round(time / gridSize) * gridSize;

    if (mode === 'loose') {
        const distance = Math.abs(time - nearestGrid);
        const threshold = gridSize * 0.2; // 20% of grid size
        return distance <= threshold ? nearestGrid : time;
    }

    return nearestGrid; // strict mode
}

// Test 16th note duration calculation
assertClose(
    getSixteenthNoteDuration(120),
    125,
    0.1,
    '16th note at 120 BPM = 125ms'
);

assertClose(
    getSixteenthNoteDuration(140),
    107.14,
    0.1,
    '16th note at 140 BPM ≈ 107ms'
);

assertClose(
    getSixteenthNoteDuration(90),
    166.67,
    0.1,
    '16th note at 90 BPM ≈ 167ms'
);

// Test quantization snapping
assertEqual(
    quantizeToGrid(0, 120),
    0,
    'Time at 0ms stays at 0ms'
);

assertEqual(
    quantizeToGrid(125, 120),
    125,
    'Time exactly on grid stays put'
);

assertEqual(
    quantizeToGrid(130, 120),
    125,
    'Time slightly after grid snaps to nearest'
);

assertEqual(
    quantizeToGrid(190, 120),
    250,
    'Time close to next grid snaps forward (190ms -> 250ms)'
);

assertEqual(
    quantizeToGrid(62, 120),
    0,
    'Time at 62ms snaps to 0ms (62 < 125/2)'
);

// Test quantization modes
assertEqual(
    quantizeWithMode(100, 120, 'off'),
    100,
    'OFF mode: no quantization'
);

assertEqual(
    quantizeWithMode(125, 120, 'strict'),
    125,
    'STRICT mode: exact grid position'
);

assertEqual(
    quantizeWithMode(130, 120, 'strict'),
    125,
    'STRICT mode: snaps 130ms to 125ms'
);

assertEqual(
    quantizeWithMode(110, 120, 'loose'),
    125,
    'LOOSE mode: within threshold, snaps to grid'
);

assertEqual(
    quantizeWithMode(50, 120, 'loose'),
    50,
    'LOOSE mode: far from grid, stays unquantized'
);

// ============================================================================
// ONSET DETECTION TESTS
// ============================================================================

console.log('\n🎯 TEST GROUP: Onset Detection\n');

/**
 * Detect onsets (transients) in an audio buffer
 * @param {Float32Array} audioData - Audio samples
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} threshold - Detection threshold (0-1)
 * @returns {number[]} Array of onset times in milliseconds
 */
function detectOnsets(audioData, sampleRate, threshold = 0.3) {
    const onsets = [];
    const windowSize = Math.floor(sampleRate * 0.01); // 10ms windows
    const hopSize = Math.floor(windowSize / 2);

    let previousEnergy = 0;

    for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
        // Calculate energy in current window
        let energy = 0;
        for (let j = 0; j < windowSize; j++) {
            const sample = audioData[i + j];
            energy += sample * sample;
        }
        energy = Math.sqrt(energy / windowSize); // RMS

        // Detect onset if energy increases significantly
        if (energy > threshold && energy > previousEnergy * 1.5) {
            const timeMs = (i / sampleRate) * 1000;

            // Avoid duplicate detections (min 20ms apart)
            if (onsets.length === 0 || timeMs - onsets[onsets.length - 1] > 20) {
                onsets.push(Math.round(timeMs));
            }
        }

        previousEnergy = energy;
    }

    return onsets;
}

// Create test audio data: silence with peaks
function createTestAudioWithPeaks(sampleRate, peakTimes) {
    const duration = 2; // 2 seconds
    const bufferSize = sampleRate * duration;
    const audioData = new Float32Array(bufferSize);

    // Add peaks at specified times
    peakTimes.forEach(timeMs => {
        const sampleIndex = Math.floor((timeMs / 1000) * sampleRate);
        const peakWidth = Math.floor(sampleRate * 0.005); // 5ms peak

        for (let i = 0; i < peakWidth && sampleIndex + i < bufferSize; i++) {
            audioData[sampleIndex + i] = 0.8; // Peak amplitude
        }
    });

    return audioData;
}

// Test onset detection with clear peaks
const testAudio1 = createTestAudioWithPeaks(44100, [100, 300, 500, 700]);
const detectedOnsets1 = detectOnsets(testAudio1, 44100, 0.3);

assert(
    detectedOnsets1.length === 4,
    `Detected 4 onsets from 4 peaks (got ${detectedOnsets1.length})`
);

assert(
    detectedOnsets1.every((onset, i) => Math.abs(onset - [100, 300, 500, 700][i]) < 50),
    'Onsets detected within 50ms of actual peaks'
);

// Test with threshold: low amplitude should not trigger
const quietAudio = new Float32Array(44100).fill(0.1);
const detectedOnsets2 = detectOnsets(quietAudio, 44100, 0.3);

assert(
    detectedOnsets2.length === 0,
    'Low amplitude audio produces no onsets'
);

// Test empty/silent audio
const silentAudio = new Float32Array(44100).fill(0);
const detectedOnsets3 = detectOnsets(silentAudio, 44100, 0.3);

assertEqual(
    detectedOnsets3.length,
    0,
    'Silent audio produces no onsets'
);

// ============================================================================
// AUDIO SLICING TESTS
// ============================================================================

console.log('\n✂️  TEST GROUP: Audio Slicing\n');

/**
 * Slice audio buffer into segments based on onset times
 * @param {Float32Array} audioData - Full audio buffer
 * @param {number[]} onsets - Onset times in milliseconds
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {Float32Array[]} Array of audio slices
 */
function sliceAudioByOnsets(audioData, onsets, sampleRate) {
    if (onsets.length === 0) return [audioData];

    const slices = [];

    for (let i = 0; i < onsets.length; i++) {
        const startTime = onsets[i];
        const endTime = i < onsets.length - 1 ? onsets[i + 1] : (audioData.length / sampleRate) * 1000;

        const startSample = Math.floor((startTime / 1000) * sampleRate);
        const endSample = Math.floor((endTime / 1000) * sampleRate);

        const slice = audioData.slice(startSample, endSample);
        slices.push(slice);
    }

    return slices;
}

// Test slicing with 2 onsets
const testAudio2 = new Float32Array(44100); // 1 second
const slices1 = sliceAudioByOnsets(testAudio2, [0, 500], 44100);

assert(
    slices1.length === 2,
    'Slicing with 2 onsets creates 2 slices'
);

assertClose(
    slices1[0].length / 44100 * 1000,
    500,
    10,
    'First slice is ~500ms'
);

assertClose(
    slices1[1].length / 44100 * 1000,
    500,
    10,
    'Second slice is ~500ms'
);

// Test slicing with no onsets
const slices2 = sliceAudioByOnsets(testAudio2, [], 44100);

assert(
    slices2.length === 1,
    'No onsets returns single slice (entire buffer)'
);

assertEqual(
    slices2[0].length,
    testAudio2.length,
    'Single slice contains all samples'
);

// Test slicing with 4 even onsets
const slices3 = sliceAudioByOnsets(testAudio2, [0, 250, 500, 750], 44100);

assert(
    slices3.length === 4,
    'Slicing with 4 onsets creates 4 slices'
);

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('\n🔗 TEST GROUP: Integration (Detect → Quantize → Slice)\n');

// Create audio with peaks at specific times
const intTestAudio = createTestAudioWithPeaks(44100, [120, 370, 620, 870]);

// Step 1: Detect onsets
const detectedOnsets = detectOnsets(intTestAudio, 44100, 0.3);
assert(
    detectedOnsets.length > 0,
    'Integration: Onsets detected from test audio'
);

// Step 2: Quantize to 120 BPM grid
const bpm = 120;
const quantizedOnsets = detectedOnsets.map(onset => quantizeToGrid(onset, bpm));
assert(
    quantizedOnsets.every(onset => onset % getSixteenthNoteDuration(bpm) === 0),
    'Integration: All onsets quantized to grid'
);

// Step 3: Slice based on quantized onsets
const slices = sliceAudioByOnsets(intTestAudio, quantizedOnsets, 44100);
assert(
    slices.length === quantizedOnsets.length,
    'Integration: Number of slices matches quantized onsets'
);

// ============================================================================
// GRID POSITION TESTS
// ============================================================================

console.log('\n🎹 TEST GROUP: Grid Position Mapping\n');

/**
 * Convert millisecond time to 16-step grid position (0-15)
 * @param {number} timeMs - Time in milliseconds
 * @param {number} bpm - Beats per minute
 * @returns {number} Step position (0-15)
 */
function timeToStepPosition(timeMs, bpm) {
    const sixteenthDuration = getSixteenthNoteDuration(bpm);
    const position = Math.floor(timeMs / sixteenthDuration) % 16;
    return position;
}

assertEqual(
    timeToStepPosition(0, 120),
    0,
    'Time 0ms maps to step 0'
);

assertEqual(
    timeToStepPosition(125, 120),
    1,
    'Time 125ms maps to step 1 (at 120 BPM)'
);

assertEqual(
    timeToStepPosition(250, 120),
    2,
    'Time 250ms maps to step 2'
);

assertEqual(
    timeToStepPosition(1875, 120),
    15,
    'Time 1875ms maps to step 15'
);

assertEqual(
    timeToStepPosition(2000, 120),
    0,
    'Time 2000ms (next bar) wraps to step 0'
);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '═'.repeat(50));
console.log('\n📊 TEST SUMMARY\n');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}`);
console.log(`💯 Score:  ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
} else {
    console.log('⚠️  SOME TESTS FAILED\n');
    process.exit(1);
}
