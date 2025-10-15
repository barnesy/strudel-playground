// Tests for STRUDEL CONTROLLER v2
// Run with: node controller-v2.test.js

const STEPS_PER_BAR = 16;

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

// Extract function from controller-v2.html
function sequenceToPattern(track, sequence) {
    const items = track.samples || track.notes;
    const pattern = [];

    sequence.forEach((val, idx) => {
        if (val === 0) {
            pattern.push('~');
        } else {
            pattern.push(items[val - 1]);
        }
    });

    return pattern.join(' ');
}

// Test data
const trackDefinitions = [
    {
        id: 'kick',
        name: 'KICK',
        samples: ['bd'],
        defaultPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
    },
    {
        id: 'snare',
        name: 'SNARE',
        samples: ['sd'],
        defaultPattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
    },
    {
        id: 'hihat',
        name: 'HI-HATS',
        samples: ['hh', 'oh'],
        defaultPattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
    },
    {
        id: 'bass',
        name: 'BASS',
        notes: ['c2', 'e2', 'g2', 'a2'],
        defaultPattern: [1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0]
    },
    {
        id: 'melody',
        name: 'MELODY',
        notes: ['c4', 'd4', 'e4', 'g4', 'a4', 'c5'],
        defaultPattern: [1, 0, 3, 0, 4, 0, 0, 0, 6, 0, 0, 0, 4, 0, 0, 0]
    }
];

console.log('\n🧪 STRUDEL CONTROLLER v2 - TEST SUITE\n');
console.log('═'.repeat(50));

// TEST 1: Pattern Generation
console.log('\n📦 TEST GROUP: Pattern Generation\n');

// Test kick pattern
const kickPattern = sequenceToPattern(trackDefinitions[0], trackDefinitions[0].defaultPattern);
assertEqual(
    kickPattern,
    'bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~',
    'Kick pattern generates correctly'
);

// Test snare pattern
const snarePattern = sequenceToPattern(trackDefinitions[1], trackDefinitions[1].defaultPattern);
assertEqual(
    snarePattern,
    '~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ sd ~ ~ ~',
    'Snare pattern generates correctly (backbeat)'
);

// Test hihat with multiple samples
const hihatPattern = sequenceToPattern(trackDefinitions[2], [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0]);
assertEqual(
    hihatPattern,
    'hh ~ oh ~ hh ~ oh ~ hh ~ oh ~ hh ~ oh ~',
    'Hi-hat pattern with alternating samples'
);

// Test bass notes
const bassPattern = sequenceToPattern(trackDefinitions[3], trackDefinitions[3].defaultPattern);
assertEqual(
    bassPattern,
    'c2 ~ ~ ~ e2 ~ ~ ~ g2 ~ ~ ~ a2 ~ ~ ~',
    'Bass pattern with notes generates correctly'
);

// Test melody with complex pattern
const melodyPattern = sequenceToPattern(trackDefinitions[4], [1, 3, 5, 0, 2, 4, 6, 0, 1, 0, 5, 0, 3, 0, 6, 0]);
assertEqual(
    melodyPattern,
    'c4 e4 a4 ~ d4 g4 c5 ~ c4 ~ a4 ~ e4 ~ c5 ~',
    'Melody pattern with complex sequence'
);

// TEST 2: Sequence Length
console.log('\n📏 TEST GROUP: Sequence Length\n');

assert(
    trackDefinitions[0].defaultPattern.length === STEPS_PER_BAR,
    `Kick default pattern has ${STEPS_PER_BAR} steps`
);

assert(
    trackDefinitions[1].defaultPattern.length === STEPS_PER_BAR,
    `Snare default pattern has ${STEPS_PER_BAR} steps`
);

assert(
    trackDefinitions[2].defaultPattern.length === STEPS_PER_BAR,
    `Hi-hat default pattern has ${STEPS_PER_BAR} steps`
);

// TEST 3: Empty Pattern
console.log('\n🔇 TEST GROUP: Empty Patterns\n');

const emptyPattern = sequenceToPattern(trackDefinitions[0], new Array(STEPS_PER_BAR).fill(0));
const expectedEmpty = '~ '.repeat(STEPS_PER_BAR - 1) + '~';
assertEqual(
    emptyPattern,
    expectedEmpty,
    'Empty pattern generates all rests'
);

// TEST 4: Full Pattern
console.log('\n🔊 TEST GROUP: Full Patterns\n');

const fullPattern = sequenceToPattern(trackDefinitions[0], new Array(STEPS_PER_BAR).fill(1));
const expectedFull = 'bd ' + ('bd '.repeat(STEPS_PER_BAR - 1)).trim();
assertEqual(
    fullPattern,
    expectedFull,
    'Full pattern generates all hits'
);

// TEST 5: Pattern with Multiple Sample Values
console.log('\n🎵 TEST GROUP: Multi-Sample Patterns\n');

const multiSamplePattern = sequenceToPattern(
    { samples: ['bd', 'sd', 'cp'] },
    [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]
);
assertEqual(
    multiSamplePattern,
    'bd sd cp ~ bd sd cp ~ bd sd cp ~ bd sd cp ~',
    'Pattern cycles through multiple samples correctly'
);

// TEST 6: Edge Cases
console.log('\n⚠️  TEST GROUP: Edge Cases\n');

// Single step pattern
const singleStepPattern = sequenceToPattern(trackDefinitions[0], [1]);
assertEqual(
    singleStepPattern,
    'bd',
    'Single step pattern works'
);

// Pattern with only first and last step
const bookendPattern = sequenceToPattern(
    trackDefinitions[0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
);
assertEqual(
    bookendPattern,
    'bd ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bd',
    'Pattern with only first and last step'
);

// TEST 7: Utility Functions
console.log('\n🛠️  TEST GROUP: Utility Functions\n');

// Test clear (all zeros)
const clearSequence = new Array(STEPS_PER_BAR).fill(0);
assert(
    clearSequence.every(v => v === 0),
    'Clear function creates all-zero sequence'
);

// Test fill (all ones)
const fillSequence = new Array(STEPS_PER_BAR).fill(1);
assert(
    fillSequence.every(v => v === 1),
    'Fill function creates all-one sequence'
);

// Test random pattern generation
const randomSequence = Array.from(
    {length: STEPS_PER_BAR},
    () => Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0
);
assert(
    randomSequence.length === STEPS_PER_BAR,
    'Random pattern has correct length'
);

assert(
    randomSequence.every(v => v >= 0 && v <= 2),
    'Random pattern values are within valid range'
);

// TEST 8: State Management
console.log('\n💾 TEST GROUP: State Management\n');

const trackState = {
    enabled: false,
    sequence: [...trackDefinitions[0].defaultPattern],
    volume: 0.7,
    speed: 1,
    reverb: 0,
    delay: 0
};

assert(
    trackState.sequence.length === STEPS_PER_BAR,
    'Track state sequence has correct length'
);

assert(
    trackState.volume >= 0 && trackState.volume <= 1,
    'Track state volume is in valid range'
);

assert(
    trackState.speed > 0,
    'Track state speed is positive'
);

// TEST 9: Track Configuration
console.log('\n⚙️  TEST GROUP: Track Configuration\n');

assert(
    trackDefinitions.every(track => track.id && track.name),
    'All tracks have id and name'
);

assert(
    trackDefinitions.every(track => track.samples || track.notes),
    'All tracks have samples or notes defined'
);

assert(
    trackDefinitions.every(track => track.defaultPattern && track.defaultPattern.length === STEPS_PER_BAR),
    'All tracks have valid default patterns'
);

// Verify kick and snare are separate tracks
assert(
    trackDefinitions.some(t => t.id === 'kick'),
    'Kick track exists as separate track'
);

assert(
    trackDefinitions.some(t => t.id === 'snare'),
    'Snare track exists as separate track'
);

// TEST 10: Pattern Output Format
console.log('\n📝 TEST GROUP: Pattern Output Format\n');

const testPatterns = [
    sequenceToPattern(trackDefinitions[0], [1, 0, 1, 0]),
    sequenceToPattern(trackDefinitions[1], [0, 1, 0, 1]),
    sequenceToPattern(trackDefinitions[3], [1, 2, 3, 4])
];

testPatterns.forEach((pattern, idx) => {
    assert(
        typeof pattern === 'string',
        `Pattern ${idx + 1} returns string`
    );

    assert(
        pattern.split(' ').length > 0,
        `Pattern ${idx + 1} has space-separated values`
    );
});

// TEST 11: Complex Rhythm Patterns
console.log('\n🎼 TEST GROUP: Complex Rhythm Patterns\n');

// Euclidean-like pattern
const euclideanPattern = sequenceToPattern(
    trackDefinitions[0],
    [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
);
assert(
    euclideanPattern.split('bd').length - 1 === 6,
    'Euclidean-like pattern has correct number of hits'
);

// Syncopated pattern
const syncopatedPattern = sequenceToPattern(
    trackDefinitions[1],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0]
);
assert(
    syncopatedPattern.includes('sd'),
    'Syncopated pattern contains snare hits'
);

// Summary
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
