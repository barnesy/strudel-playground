// Tests for Novel UX Features
// Run with: node tests/ux-features.test.js

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

console.log('\n🎨 NOVEL UX FEATURES - TEST SUITE\n');
console.log('═'.repeat(50));

// ============================================================================
// 1. EUCLIDEAN RHYTHM GENERATOR TESTS
// ============================================================================

console.log('\n📐 TEST GROUP: Euclidean Rhythm Generator\n');

/**
 * Generate Euclidean rhythm pattern using Bjorklund algorithm
 * @param {number} hits - Number of hits to distribute
 * @param {number} steps - Total number of steps
 * @returns {number[]} Pattern array (1 = hit, 0 = rest)
 */
function generateEuclidean(hits, steps) {
    if (hits >= steps) return new Array(steps).fill(1);
    if (hits === 0) return new Array(steps).fill(0);

    // Bjorklund algorithm implementation
    const pattern = [];
    const counts = [];
    const remainders = [];

    let divisor = steps - hits;
    remainders.push(hits);

    let level = 0;
    while (true) {
        counts.push(Math.floor(divisor / remainders[level]));
        remainders.push(divisor % remainders[level]);
        divisor = remainders[level];
        level++;
        if (remainders[level] <= 1) break;
    }

    counts.push(divisor);

    // Build the pattern
    const build = (level) => {
        if (level === -1) {
            pattern.push(0);
        } else if (level === -2) {
            pattern.push(1);
        } else {
            for (let i = 0; i < counts[level]; i++) {
                build(level - 1);
            }
            if (remainders[level] !== 0) {
                build(level - 2);
            }
        }
    };

    build(level);
    return pattern.slice(0, steps);
}

/**
 * Rotate pattern by N steps
 */
function rotatePattern(pattern, rotate) {
    const r = rotate % pattern.length;
    return [...pattern.slice(r), ...pattern.slice(0, r)];
}

// Test basic Euclidean patterns
const euc4_16 = generateEuclidean(4, 16);
assert(
    euc4_16.reduce((a, b) => a + b, 0) === 4 && euc4_16.length === 16,
    'Euclidean(4,16) = 4 hits across 16 steps'
);

const euc3_8 = generateEuclidean(3, 8);
assert(
    euc3_8.reduce((a, b) => a + b, 0) === 3 && euc3_8.length === 8,
    'Euclidean(3,8) = 3 hits across 8 steps (tresillo)'
);

const euc5_16 = generateEuclidean(5, 16);
assert(
    euc5_16.reduce((a, b) => a + b, 0) === 5 && euc5_16.length === 16,
    'Euclidean(5,16) = 5 hits across 16 steps'
);

const euc7_16 = generateEuclidean(7, 16);
assert(
    euc7_16.reduce((a, b) => a + b, 0) === 7 && euc7_16.length === 16,
    'Euclidean(7,16) = 7 hits across 16 steps'
);

// Test edge cases
assertEqual(
    generateEuclidean(0, 16),
    new Array(16).fill(0),
    'Euclidean(0,16) = all rests'
);

assertEqual(
    generateEuclidean(16, 16),
    new Array(16).fill(1),
    'Euclidean(16,16) = all hits'
);

const euc1_16 = generateEuclidean(1, 16);
assert(
    euc1_16.reduce((a, b) => a + b, 0) === 1 && euc1_16.length === 16,
    'Euclidean(1,16) = single hit across 16 steps'
);

// Test rotation
assertEqual(
    rotatePattern([1,0,0,1,0,0,1,0], 2),
    [0,1,0,0,1,0,1,0],
    'Rotate tresillo by 2 steps'
);

assertEqual(
    rotatePattern([1,0,0,0], 1),
    [0,0,0,1],
    'Rotate 4-step pattern by 1'
);

// ============================================================================
// 2. PROBABILITY GATES TESTS
// ============================================================================

console.log('\n🎲 TEST GROUP: Probability Gates\n');

/**
 * Check if step should trigger based on probability
 */
function shouldTriggerStep(probability) {
    return Math.random() * 100 < probability;
}

/**
 * Apply probability to pattern
 */
function applyProbability(pattern, probabilities) {
    return pattern.map((hit, idx) => {
        if (hit === 0) return 0;
        return shouldTriggerStep(probabilities[idx]) ? hit : 0;
    });
}

// Test probability application (statistical)
const testPattern = [1,1,1,1,1,1,1,1];
const prob100 = new Array(8).fill(100);
const prob0 = new Array(8).fill(0);

// Run multiple times to check statistical behavior
let hits100 = 0;
let hits0 = 0;

for (let i = 0; i < 100; i++) {
    const result100 = applyProbability(testPattern, prob100);
    const result0 = applyProbability(testPattern, prob0);
    hits100 += result100.reduce((a, b) => a + b, 0);
    hits0 += result0.reduce((a, b) => a + b, 0);
}

assert(
    hits100 > 750, // Should be close to 800 (100 runs * 8 steps)
    '100% probability triggers most hits (statistical)'
);

assert(
    hits0 === 0,
    '0% probability triggers no hits'
);

// Test probability bounds
assert(
    shouldTriggerStep(100) === true || shouldTriggerStep(100) === true,
    'Probability function returns boolean'
);

// ============================================================================
// 3. PATTERN GENETICS TESTS
// ============================================================================

console.log('\n🧬 TEST GROUP: Pattern Genetics\n');

/**
 * Breed two patterns using crossover and mutation
 */
function breedPatterns(patternA, patternB, mutationRate = 0.05) {
    const offspring = [];
    const crossoverPoint = Math.floor(Math.random() * patternA.length);

    for (let i = 0; i < patternA.length; i++) {
        // Crossover: take from A before crossover point, B after
        offspring[i] = i < crossoverPoint ? patternA[i] : patternB[i];

        // Mutation: random flip
        if (Math.random() < mutationRate) {
            offspring[i] = offspring[i] ? 0 : 1;
        }
    }

    return offspring;
}

/**
 * Calculate pattern similarity (0-1)
 */
function patternSimilarity(p1, p2) {
    let matches = 0;
    for (let i = 0; i < Math.min(p1.length, p2.length); i++) {
        if (p1[i] === p2[i]) matches++;
    }
    return matches / Math.min(p1.length, p2.length);
}

// Test breeding without mutation
const parentA = [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];
const parentB = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];

// Breed multiple times with no mutation to test crossover
let offspringResults = [];
for (let i = 0; i < 10; i++) {
    const child = breedPatterns(parentA, parentB, 0); // No mutation
    offspringResults.push(child);
}

assert(
    offspringResults.every(child => child.length === 16),
    'All offspring have correct length'
);

// Check that offspring contains elements from both parents
const firstOffspring = offspringResults[0];
const hasFromA = firstOffspring.some((val, idx) => val === parentA[idx] && val !== parentB[idx]);
const hasFromB = firstOffspring.some((val, idx) => val === parentB[idx] && val !== parentA[idx]);

assert(
    hasFromA || hasFromB || patternSimilarity(parentA, parentB) === 1,
    'Offspring contains genetic material from parents'
);

// Test similarity function
assertEqual(
    patternSimilarity([1,0,1,0], [1,0,1,0]),
    1,
    'Identical patterns have similarity 1'
);

assertEqual(
    patternSimilarity([1,1,1,1], [0,0,0,0]),
    0,
    'Opposite patterns have similarity 0'
);

assertClose(
    patternSimilarity([1,0,1,0], [1,0,0,1]),
    0.5,
    0.01,
    'Half-matching patterns have similarity 0.5'
);

// ============================================================================
// 4. CIRCULAR SEQUENCER MATH TESTS
// ============================================================================

console.log('\n⭕ TEST GROUP: Circular Sequencer Math\n');

/**
 * Convert step index to polar coordinates
 */
function stepToPolar(stepIdx, totalSteps, radius, centerX, centerY) {
    const angle = (stepIdx / totalSteps) * Math.PI * 2 - Math.PI / 2; // Start at top
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        angle: angle
    };
}

/**
 * Convert polar coordinates back to step index
 */
function polarToStep(x, y, centerX, centerY, totalSteps) {
    const dx = x - centerX;
    const dy = y - centerY;
    let angle = Math.atan2(dy, dx) + Math.PI / 2; // Adjust for starting at top
    if (angle < 0) angle += Math.PI * 2;

    const step = Math.floor((angle / (Math.PI * 2)) * totalSteps);
    return step % totalSteps;
}

// Test step to polar conversion
const polar0 = stepToPolar(0, 16, 100, 200, 200);
assertClose(polar0.x, 200, 0.1, 'Step 0 at top (x = center)');
assertClose(polar0.y, 100, 0.1, 'Step 0 at top (y = center - radius)');

const polar4 = stepToPolar(4, 16, 100, 200, 200);
assertClose(polar4.x, 300, 0.1, 'Step 4 at right (x = center + radius)');
assertClose(polar4.y, 200, 0.1, 'Step 4 at right (y = center)');

const polar8 = stepToPolar(8, 16, 100, 200, 200);
assertClose(polar8.x, 200, 0.1, 'Step 8 at bottom (x = center)');
assertClose(polar8.y, 300, 0.1, 'Step 8 at bottom (y = center + radius)');

// Test polar to step conversion (round trip)
assertEqual(
    polarToStep(polar0.x, polar0.y, 200, 200, 16),
    0,
    'Polar to step: 0 → polar → 0'
);

assertEqual(
    polarToStep(polar4.x, polar4.y, 200, 200, 16),
    4,
    'Polar to step: 4 → polar → 4'
);

// ============================================================================
// 5. MULTI-TOUCH CHORD DETECTION TESTS
// ============================================================================

console.log('\n🎹 TEST GROUP: Multi-Touch Chord Detection\n');

/**
 * Calculate intervals between notes
 */
function calculateIntervals(notes) {
    const noteValues = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
                       'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11};

    const values = notes.map(n => noteValues[n]).sort((a, b) => a - b);
    const intervals = [];

    for (let i = 1; i < values.length; i++) {
        intervals.push(values[i] - values[i-1]);
    }

    return intervals;
}

/**
 * Detect chord type from notes
 */
function detectChord(notes) {
    if (notes.length < 2) return 'Single Note';
    if (notes.length === 2) {
        const intervals = calculateIntervals(notes);
        if (intervals[0] === 7) return 'Perfect Fifth';
        if (intervals[0] === 5) return 'Perfect Fourth';
        if (intervals[0] === 4) return 'Major Third';
        if (intervals[0] === 3) return 'Minor Third';
        return 'Interval';
    }

    if (notes.length === 3) {
        const intervals = calculateIntervals(notes);
        if (intervals[0] === 4 && intervals[1] === 3) return 'Major';
        if (intervals[0] === 3 && intervals[1] === 4) return 'Minor';
        if (intervals[0] === 3 && intervals[1] === 3) return 'Diminished';
        if (intervals[0] === 4 && intervals[1] === 4) return 'Augmented';
    }

    return 'Complex';
}

// Test interval calculation
assertEqual(
    calculateIntervals(['C', 'E', 'G']),
    [4, 3],
    'C-E-G intervals = [4, 3] (major third + minor third)'
);

assertEqual(
    calculateIntervals(['C', 'D#', 'G']),
    [3, 4],
    'C-D#-G intervals = [3, 4] (minor third + major third)'
);

// Test chord detection
assertEqual(
    detectChord(['C', 'E', 'G']),
    'Major',
    'C-E-G = Major chord'
);

assertEqual(
    detectChord(['C', 'D#', 'G']),
    'Minor',
    'C-D#-G = Minor chord'
);

assertEqual(
    detectChord(['C', 'G']),
    'Perfect Fifth',
    'C-G = Perfect Fifth'
);

assertEqual(
    detectChord(['C']),
    'Single Note',
    'Single note detection'
);

// ============================================================================
// 6. GESTURE MORPHING TESTS
// ============================================================================

console.log('\n🎨 TEST GROUP: Gesture Morphing\n');

/**
 * Morph between two patterns based on blend ratio
 */
function morphPatterns(patternA, patternB, blendRatio) {
    // blendRatio: 0 = all A, 1 = all B
    const morphed = [];

    for (let i = 0; i < Math.min(patternA.length, patternB.length); i++) {
        // Probabilistic morphing
        const useB = Math.random() < blendRatio;
        morphed.push(useB ? patternB[i] : patternA[i]);
    }

    return morphed;
}

/**
 * Calculate blend ratio from Y position
 */
function yPositionToBlendRatio(y, canvasHeight) {
    return Math.max(0, Math.min(1, y / canvasHeight));
}

// Test blend ratio calculation
assertEqual(
    yPositionToBlendRatio(0, 200),
    0,
    'Top of canvas = 0% blend'
);

assertEqual(
    yPositionToBlendRatio(200, 200),
    1,
    'Bottom of canvas = 100% blend'
);

assertClose(
    yPositionToBlendRatio(100, 200),
    0.5,
    0.01,
    'Middle of canvas = 50% blend'
);

// Test morphing (statistical)
const morphA = [1,1,1,1,1,1,1,1];
const morphB = [0,0,0,0,0,0,0,0];

// At 0% blend, should be mostly A
let morphed0Count = 0;
for (let i = 0; i < 100; i++) {
    const result = morphPatterns(morphA, morphB, 0);
    morphed0Count += result.reduce((a, b) => a + b, 0);
}

assert(
    morphed0Count > 750, // Should be close to 800
    'Morphing at 0% blend favors pattern A'
);

// ============================================================================
// 7. MOTION CONTROL MAPPING TESTS
// ============================================================================

console.log('\n📱 TEST GROUP: Motion Control Mapping\n');

/**
 * Map tilt angle to parameter range
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    const clamped = Math.max(inMin, Math.min(inMax, value));
    return (clamped - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Map device tilt to filter cutoff
 */
function tiltToFilterCutoff(tilt) {
    return mapRange(tilt, -45, 45, 200, 5000);
}

/**
 * Map device tilt to volume
 */
function tiltToVolume(tilt) {
    return mapRange(tilt, -45, 45, 0, 1);
}

// Test range mapping
assertEqual(
    mapRange(0, -45, 45, 0, 100),
    50,
    'Map 0° (center) to middle of range'
);

assertEqual(
    mapRange(-45, -45, 45, 0, 100),
    0,
    'Map -45° to minimum'
);

assertEqual(
    mapRange(45, -45, 45, 0, 100),
    100,
    'Map 45° to maximum'
);

// Test clamping
assertEqual(
    mapRange(100, -45, 45, 0, 100),
    100,
    'Values above max are clamped'
);

assertEqual(
    mapRange(-100, -45, 45, 0, 100),
    0,
    'Values below min are clamped'
);

// Test filter cutoff mapping
assertClose(
    tiltToFilterCutoff(0),
    2600,
    10,
    'Neutral tilt = mid-range filter'
);

assertClose(
    tiltToFilterCutoff(-45),
    200,
    1,
    'Full left tilt = low filter cutoff'
);

assertClose(
    tiltToFilterCutoff(45),
    5000,
    1,
    'Full right tilt = high filter cutoff'
);

// ============================================================================
// 8. VOICE-TO-PATTERN CONVERSION TESTS
// ============================================================================

console.log('\n🎤 TEST GROUP: Voice-to-Pattern Conversion\n');

/**
 * Convert onset times to sequencer pattern
 */
function onsetsToPattern(onsets, bpm, patternLength = 16) {
    const pattern = Array(patternLength).fill(0);
    const sixteenthDuration = (60000 / bpm) / 4;
    const barDuration = sixteenthDuration * patternLength;

    onsets.forEach(onset => {
        const step = Math.floor((onset % barDuration) / sixteenthDuration);
        if (step < patternLength) {
            pattern[step] = 1;
        }
    });

    return pattern;
}

/**
 * Quantize onset times to grid
 */
function quantizeOnsets(onsets, bpm) {
    const sixteenthDuration = (60000 / bpm) / 4;
    return onsets.map(onset => {
        return Math.round(onset / sixteenthDuration) * sixteenthDuration;
    });
}

// Test onset to pattern conversion
assertEqual(
    onsetsToPattern([0, 500, 1000, 1500], 120, 16),
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    'Onsets at 0, 500, 1000, 1500ms → 4-on-floor at 120 BPM'
);

assertEqual(
    onsetsToPattern([0, 750], 120, 16),
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    'Onsets at 0, 750ms → steps 0 and 6'
);

// Test onset quantization
assertEqual(
    quantizeOnsets([120, 380, 630], 120),
    [125, 375, 625],
    'Quantize onsets to 16th note grid at 120 BPM'
);

assertEqual(
    quantizeOnsets([0, 140, 240], 120),
    [0, 125, 250],
    'Snap close onsets to nearest 16th'
);

// ============================================================================
// 9. COLOR HARMONY MAPPING TESTS
// ============================================================================

console.log('\n🌈 TEST GROUP: Color Harmony Mapping\n');

/**
 * Map color wheel angle (0-360°) to musical note
 */
function angleToNote(angle) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const normalizedAngle = ((angle % 360) + 360) % 360; // Handle negative angles
    const noteIndex = Math.floor((normalizedAngle / 360) * 12);
    return noteNames[noteIndex];
}

/**
 * Detect harmony relationship between angles
 */
function detectHarmonyRelation(angles) {
    if (angles.length < 2) return 'Single';

    const sorted = angles.map(a => ((a % 360) + 360) % 360).sort((a, b) => a - b);
    const interval = Math.abs(sorted[1] - sorted[0]);

    if (Math.abs(interval - 180) < 15) return 'Tritone';
    if (Math.abs(interval - 210) < 15) return 'Perfect Fifth';
    if (Math.abs(interval - 150) < 15) return 'Perfect Fourth';
    if (Math.abs(interval - 120) < 15) return 'Major Third';
    if (Math.abs(interval - 90) < 15) return 'Minor Third';

    return 'Custom';
}

// Test angle to note mapping
assertEqual(
    angleToNote(0),
    'C',
    '0° = C'
);

assertEqual(
    angleToNote(180),
    'F#',
    '180° = F# (tritone)'
);

assertEqual(
    angleToNote(210),
    'G',
    '210° = G (perfect fifth from C)'
);

// Test wraparound
assertEqual(
    angleToNote(360),
    'C',
    '360° wraps to C'
);

assertEqual(
    angleToNote(-30),
    'B',
    'Negative angles handled correctly'
);

// Test harmony detection
assertEqual(
    detectHarmonyRelation([0, 180]),
    'Tritone',
    '180° interval = Tritone'
);

assertEqual(
    detectHarmonyRelation([0, 210]),
    'Perfect Fifth',
    '210° interval = Perfect Fifth'
);

assertEqual(
    detectHarmonyRelation([0]),
    'Single',
    'Single angle = no harmony'
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
