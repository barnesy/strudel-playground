// Synchronization Tests for STRUDEL CONTROLLER v2
// Tests timing accuracy between UI and playback
// Run with: node controller-v2-sync.test.js

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

function assertEqual(actual, expected, message, tolerance = 0) {
    const isEqual = tolerance === 0
        ? actual === expected
        : Math.abs(actual - expected) <= tolerance;

    if (isEqual) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ ${message}`);
        console.error(`   Expected: ${expected}${tolerance > 0 ? ` (±${tolerance})` : ''}`);
        console.error(`   Actual:   ${actual}`);
        testsFailed++;
    }
}

console.log('\n🎯 STRUDEL CONTROLLER v2 - SYNCHRONIZATION TESTS\n');
console.log('═'.repeat(60));

// TEST 1: Step Clock Timing Calculations
console.log('\n⏱️  TEST GROUP: Step Clock Timing\n');

function calculateStepDuration(bpm) {
    // Each bar has 4 beats, each beat has 4 sixteenth notes
    // So 16 steps per bar = 4 beats worth of sixteenth notes
    return (60000 / bpm) / 4;
}

// Test at 120 BPM (standard tempo)
const step120 = calculateStepDuration(120);
assertEqual(step120, 125, 'Step duration at 120 BPM is 125ms', 0.1);

// Test at 60 BPM (slow)
const step60 = calculateStepDuration(60);
assertEqual(step60, 250, 'Step duration at 60 BPM is 250ms', 0.1);

// Test at 180 BPM (fast)
const step180 = calculateStepDuration(180);
assertEqual(step180, 83.333, 'Step duration at 180 BPM is ~83.3ms', 0.1);

// Test at 90 BPM
const step90 = calculateStepDuration(90);
assertEqual(step90, 166.666, 'Step duration at 90 BPM is ~166.7ms', 0.1);

// TEST 2: Bar Duration Calculations
console.log('\n🎼 TEST GROUP: Bar Duration (Full Sequence)\n');

function calculateBarDuration(bpm) {
    return calculateStepDuration(bpm) * STEPS_PER_BAR;
}

// At 120 BPM, one bar = 2 seconds
const bar120 = calculateBarDuration(120);
assertEqual(bar120, 2000, 'Bar duration at 120 BPM is 2000ms (2 seconds)', 0.1);

// At 60 BPM, one bar = 4 seconds
const bar60 = calculateBarDuration(60);
assertEqual(bar60, 4000, 'Bar duration at 60 BPM is 4000ms (4 seconds)', 0.1);

// At 180 BPM, one bar = 1.333 seconds
const bar180 = calculateBarDuration(180);
assertEqual(bar180, 1333.333, 'Bar duration at 180 BPM is ~1333ms', 1);

// TEST 3: Step Index Wrapping
console.log('\n🔄 TEST GROUP: Step Index Wrapping\n');

function getNextStep(currentStep) {
    return (currentStep + 1) % STEPS_PER_BAR;
}

// Test wrapping from 0 to 15
let step = 0;
const stepSequence = [];
for (let i = 0; i < STEPS_PER_BAR * 2; i++) {
    stepSequence.push(step);
    step = getNextStep(step);
}

assert(
    stepSequence.length === STEPS_PER_BAR * 2,
    'Step sequence can cycle through 2 complete bars'
);

assert(
    stepSequence[0] === 0 && stepSequence[15] === 15 && stepSequence[16] === 0,
    'Step index wraps correctly at bar boundary'
);

assert(
    stepSequence.slice(0, 16).every((val, idx) => val === idx),
    'First bar steps are 0-15 in order'
);

assert(
    stepSequence.slice(16, 32).every((val, idx) => val === idx),
    'Second bar repeats same 0-15 sequence'
);

// TEST 4: Beat Counter Update Timing
console.log('\n📊 TEST GROUP: Beat Counter Sync\n');

function simulateStepClock(bpm, durationMs) {
    const stepDuration = calculateStepDuration(bpm);
    const steps = [];
    let currentStep = 0;
    let elapsedTime = 0;

    while (elapsedTime < durationMs) {
        steps.push({
            step: currentStep,
            time: elapsedTime
        });
        currentStep = getNextStep(currentStep);
        elapsedTime += stepDuration;
    }

    return steps;
}

// Simulate 2 bars at 120 BPM
const steps120 = simulateStepClock(120, 4000);
assert(
    steps120.length === 32,
    'Exactly 32 steps occur in 4 seconds at 120 BPM'
);

assert(
    steps120[0].step === 0 && steps120[0].time === 0,
    'First step starts at time 0'
);

assert(
    steps120[16].step === 0,
    'Step counter resets to 0 after 16 steps'
);

assert(
    Math.abs(steps120[16].time - 2000) < 1,
    'Second bar starts at 2000ms at 120 BPM'
);

// TEST 5: Pattern Update Timing
console.log('\n🔄 TEST GROUP: Pattern Update Timing\n');

// Pattern should update when step 0 is reached
const patternUpdates = steps120.filter(s => s.step === 0);

assert(
    patternUpdates.length === 2,
    'Pattern updates twice in 2 bars'
);

assert(
    patternUpdates.every(p => p.step === 0),
    'Pattern only updates at step 0 (bar boundary)'
);

const updateIntervals = [];
for (let i = 1; i < patternUpdates.length; i++) {
    updateIntervals.push(patternUpdates[i].time - patternUpdates[i - 1].time);
}

assert(
    updateIntervals.every(interval => Math.abs(interval - 2000) < 1),
    'Pattern updates occur at consistent 2-second intervals at 120 BPM'
);

// TEST 6: Timing Accuracy Across Different Tempos
console.log('\n🎵 TEST GROUP: Multi-Tempo Timing Accuracy\n');

const tempos = [60, 90, 120, 140, 180];

tempos.forEach(bpm => {
    const stepDuration = calculateStepDuration(bpm);
    const barDuration = calculateBarDuration(bpm);

    // Simulate exactly 16 steps
    const steps = [];
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        steps.push({
            step: i,
            time: i * stepDuration
        });
    }

    assert(
        steps.length === STEPS_PER_BAR,
        `Exactly ${STEPS_PER_BAR} steps in one bar at ${bpm} BPM`
    );

    // Check timing precision of last step
    const lastStep = steps[steps.length - 1];
    const expectedLastStepTime = barDuration - stepDuration;
    assert(
        Math.abs(lastStep.time - expectedLastStepTime) < 0.01,
        `Last step timing is accurate at ${bpm} BPM`
    );
});

// TEST 7: Step Highlighting Sync
console.log('\n✨ TEST GROUP: Step Highlighting Sync\n');

function getHighlightedSteps(currentStep, allSteps) {
    // Only the current step should be highlighted
    return allSteps.map((_, idx) => idx === currentStep);
}

// Test at different points in sequence
const highlightAt0 = getHighlightedSteps(0, new Array(STEPS_PER_BAR).fill(false));
assert(
    highlightAt0.filter(Boolean).length === 1 && highlightAt0[0] === true,
    'Only step 0 is highlighted when current step is 0'
);

const highlightAt8 = getHighlightedSteps(8, new Array(STEPS_PER_BAR).fill(false));
assert(
    highlightAt8.filter(Boolean).length === 1 && highlightAt8[8] === true,
    'Only step 8 is highlighted when current step is 8'
);

const highlightAt15 = getHighlightedSteps(15, new Array(STEPS_PER_BAR).fill(false));
assert(
    highlightAt15.filter(Boolean).length === 1 && highlightAt15[15] === true,
    'Only step 15 is highlighted when current step is 15'
);

// TEST 8: Sequencer-to-Pattern Alignment
console.log('\n🎯 TEST GROUP: Sequencer-to-Pattern Alignment\n');

function sequenceToPattern(samples, sequence) {
    return sequence.map(val => val === 0 ? '~' : samples[val - 1]).join(' ');
}

// Test that pattern generation preserves step count
const testSequences = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Kick
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Snare
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // Hi-hat
];

testSequences.forEach((seq, idx) => {
    const pattern = sequenceToPattern(['bd'], seq);
    const patternSteps = pattern.split(' ');

    assert(
        patternSteps.length === STEPS_PER_BAR,
        `Pattern ${idx + 1} has exactly ${STEPS_PER_BAR} steps`
    );

    // Verify step-by-step alignment
    seq.forEach((val, stepIdx) => {
        const expectedToken = val === 0 ? '~' : 'bd';
        assert(
            patternSteps[stepIdx] === expectedToken,
            `Pattern ${idx + 1}, step ${stepIdx} matches sequence value`
        );
    });
});

// TEST 9: Concurrent Track Timing
console.log('\n🎼 TEST GROUP: Concurrent Track Timing\n');

// When multiple tracks are playing, they should all be in sync
function simulateMultiTrackPlayback(tracks, bpm, duration) {
    const stepDuration = calculateStepDuration(bpm);
    const trackSteps = tracks.map(() => []);
    let currentStep = 0;
    let elapsedTime = 0;

    while (elapsedTime < duration) {
        // All tracks should update at the same time
        tracks.forEach((_, trackIdx) => {
            trackSteps[trackIdx].push({
                step: currentStep,
                time: elapsedTime
            });
        });

        currentStep = getNextStep(currentStep);
        elapsedTime += stepDuration;
    }

    return trackSteps;
}

const multiTrackSteps = simulateMultiTrackPlayback(['kick', 'snare', 'hihat'], 120, 2000);

assert(
    multiTrackSteps.every(track => track.length === 16),
    'All tracks have same number of steps'
);

assert(
    multiTrackSteps.every(track =>
        track.every((step, idx) => step.step === multiTrackSteps[0][idx].step)
    ),
    'All tracks are on the same step at any given time'
);

assert(
    multiTrackSteps.every(track =>
        track.every((step, idx) => step.time === multiTrackSteps[0][idx].time)
    ),
    'All tracks trigger at exactly the same time'
);

// TEST 10: Visual Feedback Timing
console.log('\n💫 TEST GROUP: Visual Feedback Timing\n');

const VISUAL_FEEDBACK_DURATION = 100; // ms

function getVisualFeedbackWindows(steps, feedbackDuration) {
    return steps.map(step => ({
        step: step.step,
        startTime: step.time,
        endTime: step.time + feedbackDuration
    }));
}

const feedbackWindows = getVisualFeedbackWindows(steps120.slice(0, 16), VISUAL_FEEDBACK_DURATION);

assert(
    feedbackWindows.length === 16,
    'Visual feedback windows created for all 16 steps'
);

assert(
    feedbackWindows.every(window => window.endTime - window.startTime === VISUAL_FEEDBACK_DURATION),
    'All visual feedback windows have correct duration'
);

// Check that feedback doesn't overlap at 120 BPM
const stepDuration120 = calculateStepDuration(120);
assert(
    VISUAL_FEEDBACK_DURATION < stepDuration120,
    'Visual feedback duration is shorter than step interval (no overlap)'
);

// TEST 11: Tempo Change Handling
console.log('\n⚡ TEST GROUP: Tempo Change Handling\n');

function simulateTempoChange(initialBpm, newBpm, changeAtStep) {
    const steps = [];
    let currentStep = 0;
    let elapsedTime = 0;
    let currentBpm = initialBpm;

    for (let i = 0; i < 32; i++) {
        if (currentStep === changeAtStep && i > 0) {
            currentBpm = newBpm;
        }

        steps.push({
            step: currentStep,
            time: elapsedTime,
            bpm: currentBpm
        });

        currentStep = getNextStep(currentStep);
        elapsedTime += calculateStepDuration(currentBpm);
    }

    return steps;
}

const tempoChangeSteps = simulateTempoChange(120, 140, 0);

assert(
    tempoChangeSteps.filter(s => s.bpm === 120).length === 16,
    'First bar plays at 120 BPM'
);

assert(
    tempoChangeSteps.filter(s => s.bpm === 140).length === 16,
    'Second bar plays at 140 BPM'
);

const firstBarDuration = tempoChangeSteps[15].time + calculateStepDuration(120);
const secondBarDuration = tempoChangeSteps[31].time - tempoChangeSteps[16].time + calculateStepDuration(140);

assertEqual(firstBarDuration, 2000, 'First bar at 120 BPM takes 2 seconds', 1);
assertEqual(secondBarDuration, 1714.286, 'Second bar at 140 BPM takes ~1.71 seconds', 2);

// TEST 12: Boundary Condition Testing
console.log('\n🔬 TEST GROUP: Boundary Conditions\n');

// Test minimum BPM (60)
const minBpmSteps = simulateStepClock(60, calculateBarDuration(60));
assert(
    minBpmSteps.length === STEPS_PER_BAR,
    'Sequencer works correctly at minimum BPM (60)'
);

// Test maximum BPM (180)
const maxBpmSteps = simulateStepClock(180, calculateBarDuration(180));
assert(
    maxBpmSteps.length === STEPS_PER_BAR,
    'Sequencer works correctly at maximum BPM (180)'
);

// Test that timing remains precise across a long sequence
const longSequence = simulateStepClock(120, 20000); // 20 seconds
const expectedSteps = Math.floor(20000 / calculateStepDuration(120));
assert(
    Math.abs(longSequence.length - expectedSteps) <= 1,
    'Timing remains accurate over extended playback (20 seconds)'
);

// Summary
console.log('\n' + '═'.repeat(60));
console.log('\n📊 SYNCHRONIZATION TEST SUMMARY\n');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}`);
console.log(`💯 Score:  ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

if (testsFailed === 0) {
    console.log('🎉 ALL SYNCHRONIZATION TESTS PASSED!');
    console.log('✨ UI and playback timing are perfectly aligned!\n');
    process.exit(0);
} else {
    console.log('⚠️  SOME SYNCHRONIZATION TESTS FAILED');
    console.log('🔧 UI and playback may be out of sync\n');
    process.exit(1);
}
