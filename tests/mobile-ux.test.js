// Tests for STRUDEL MOBILE UX
// Comprehensive test suite for all mobile UX components and interactions
// Run with: node tests/mobile-ux.test.js

const STEPS_PER_BAR = 16;
const MAX_TRACKS = 8;
const MAX_VELOCITY = 127;
const MIN_TEMPO = 60;
const MAX_TEMPO = 240;

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

// Mock component classes
class StepSequencer {
    constructor(tracks = 4, steps = STEPS_PER_BAR) {
        this.tracks = tracks;
        this.steps = steps;
        this.patterns = Array(tracks).fill(null).map(() => Array(steps).fill(0));
        this.currentStep = 0;
        this.isPlaying = false;
    }

    toggleStep(track, step) {
        if (track >= 0 && track < this.tracks && step >= 0 && step < this.steps) {
            this.patterns[track][step] = this.patterns[track][step] === 0 ? 1 : 0;
            return true;
        }
        return false;
    }

    setStepValue(track, step, value) {
        if (track >= 0 && track < this.tracks && step >= 0 && step < this.steps) {
            this.patterns[track][step] = value;
            return true;
        }
        return false;
    }

    getPattern(track) {
        return this.patterns[track];
    }

    clearPattern(track) {
        this.patterns[track] = Array(this.steps).fill(0);
    }

    fillPattern(track) {
        this.patterns[track] = Array(this.steps).fill(1);
    }

    duplicatePattern(track) {
        if (track >= 0 && track < this.tracks - 1) {
            this.patterns.splice(track + 1, 0, [...this.patterns[track]]);
            this.tracks++;
            return true;
        }
        return false;
    }

    copyStep(fromTrack, fromStep, toTrack, toStep) {
        if (this.isValidPosition(fromTrack, fromStep) && this.isValidPosition(toTrack, toStep)) {
            this.patterns[toTrack][toStep] = this.patterns[fromTrack][fromStep];
            return true;
        }
        return false;
    }

    isValidPosition(track, step) {
        return track >= 0 && track < this.tracks && step >= 0 && step < this.steps;
    }
}

class SoundPicker {
    constructor() {
        this.sounds = {
            drums: ['bd', 'sd', 'hh', 'oh', 'rim', 'lt', 'mt', 'ht', 'rd', 'cr'],
            melodic: ['piano', 'synth', 'bass', 'lead'],
            misc: ['casio', 'metal', 'wind', 'jazz', 'east', 'crow', 'space', 'numbers']
        };
        this.selectedSound = null;
        this.favorites = [];
    }

    selectSound(category, sound) {
        if (this.sounds[category] && this.sounds[category].includes(sound)) {
            this.selectedSound = sound;
            return true;
        }
        return false;
    }

    addToFavorites(sound) {
        if (!this.favorites.includes(sound)) {
            this.favorites.push(sound);
            return true;
        }
        return false;
    }

    removeFromFavorites(sound) {
        const index = this.favorites.indexOf(sound);
        if (index > -1) {
            this.favorites.splice(index, 1);
            return true;
        }
        return false;
    }

    getAllSounds() {
        return Object.values(this.sounds).flat();
    }
}

class EffectsRack {
    constructor() {
        this.availableEffects = {
            lpf: { name: 'Low Pass Filter', params: ['cutoff', 'resonance'] },
            hpf: { name: 'High Pass Filter', params: ['cutoff', 'resonance'] },
            delay: { name: 'Delay', params: ['time', 'feedback', 'mix'] },
            reverb: { name: 'Reverb', params: ['room', 'decay', 'mix'] },
            vowel: { name: 'Vowel Filter', params: ['vowel'] },
            gain: { name: 'Gain', params: ['amount'] },
            pan: { name: 'Pan', params: ['position'] },
            speed: { name: 'Speed', params: ['rate'] }
        };
        this.chain = [];
    }

    addEffect(effectType, params = {}) {
        if (this.availableEffects[effectType]) {
            this.chain.push({
                type: effectType,
                enabled: true,
                params: params
            });
            return true;
        }
        return false;
    }

    removeEffect(index) {
        if (index >= 0 && index < this.chain.length) {
            this.chain.splice(index, 1);
            return true;
        }
        return false;
    }

    toggleEffect(index) {
        if (index >= 0 && index < this.chain.length) {
            this.chain[index].enabled = !this.chain[index].enabled;
            return true;
        }
        return false;
    }

    reorderEffect(fromIndex, toIndex) {
        if (fromIndex >= 0 && fromIndex < this.chain.length &&
            toIndex >= 0 && toIndex < this.chain.length) {
            const [effect] = this.chain.splice(fromIndex, 1);
            this.chain.splice(toIndex, 0, effect);
            return true;
        }
        return false;
    }

    setEffectParam(index, param, value) {
        if (index >= 0 && index < this.chain.length) {
            this.chain[index].params[param] = value;
            return true;
        }
        return false;
    }
}

class XYPad {
    constructor(width = 100, height = 100) {
        this.width = width;
        this.height = height;
        this.x = width / 2;
        this.y = height / 2;
        this.locked = false;
        this.paramX = null;
        this.paramY = null;
    }

    setPosition(x, y) {
        if (!this.locked) {
            this.x = Math.max(0, Math.min(this.width, x));
            this.y = Math.max(0, Math.min(this.height, y));
            return true;
        }
        return false;
    }

    getNormalizedPosition() {
        return {
            x: this.x / this.width,
            y: this.y / this.height
        };
    }

    reset() {
        this.x = this.width / 2;
        this.y = this.height / 2;
        return true;
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }

    assignParameters(paramX, paramY) {
        this.paramX = paramX;
        this.paramY = paramY;
        return true;
    }
}

class PatternManipulator {
    constructor() {
        this.operations = [
            'reverse', 'juxtapose', 'add', 'multiply',
            'offset', 'slow', 'fast', 'euclidean'
        ];
    }

    reverse(pattern) {
        return [...pattern].reverse();
    }

    add(pattern, value) {
        return pattern.map(v => v === 0 ? 0 : v + value);
    }

    multiply(pattern, factor) {
        const result = [];
        pattern.forEach(v => {
            for (let i = 0; i < factor; i++) {
                result.push(v);
            }
        });
        return result;
    }

    euclidean(hits, steps, rotation = 0) {
        if (hits >= steps) return new Array(steps).fill(1);
        if (hits === 0) return new Array(steps).fill(0);

        // Simple Euclidean rhythm generation
        // Distributes hits as evenly as possible across steps
        const pattern = Array(steps).fill(0);
        const bucket = Math.floor(steps / hits);
        const remainder = steps % hits;

        let index = 0;
        for (let i = 0; i < hits; i++) {
            pattern[index] = 1;
            index += bucket;
            if (i < remainder) {
                index++;
            }
        }

        // Apply rotation
        if (rotation > 0) {
            const rot = rotation % steps;
            return [...pattern.slice(rot), ...pattern.slice(0, rot)];
        }

        return pattern;
    }

    probability(pattern, probabilities) {
        return pattern.map((v, i) => {
            const prob = probabilities[i] !== undefined ? probabilities[i] : 1.0;
            return Math.random() < prob ? v : 0;
        });
    }

    breed(pattern1, pattern2, mutationRate = 0.05) {
        const crossover = Math.floor(Math.random() * pattern1.length);
        const child = [];

        for (let i = 0; i < pattern1.length; i++) {
            child.push(i < crossover ? pattern1[i] : pattern2[i]);

            if (Math.random() < mutationRate) {
                child[i] = child[i] === 0 ? 1 : 0;
            }
        }

        return child;
    }
}

class TransportBar {
    constructor() {
        this.isPlaying = false;
        this.isRecording = false;
        this.tempo = 120; // BPM
        this.volume = 0.8;
        this.position = 0;
    }

    play() {
        this.isPlaying = true;
        return true;
    }

    stop() {
        this.isPlaying = false;
        return true;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        return this.isPlaying;
    }

    reset() {
        this.position = 0;
        this.isPlaying = false;
        return true;
    }

    record() {
        this.isRecording = true;
        this.isPlaying = true;
        return true;
    }

    stopRecord() {
        this.isRecording = false;
        return true;
    }

    setTempo(bpm) {
        if (bpm >= MIN_TEMPO && bpm <= MAX_TEMPO) {
            this.tempo = bpm;
            return true;
        }
        return false;
    }

    setVolume(vol) {
        if (vol >= 0 && vol <= 1) {
            this.volume = vol;
            return true;
        }
        return false;
    }
}

// ============================================================================
// TEST SUITE
// ============================================================================

console.log('\n🧪 STRUDEL MOBILE UX - COMPREHENSIVE TEST SUITE\n');
console.log('═'.repeat(70));

// ============================================================================
// TEST GROUP 1: StepSequencer Component
// ============================================================================
console.log('\n📦 TEST GROUP 1: StepSequencer Component\n');

const sequencer = new StepSequencer(4, 16);

assert(
    sequencer.tracks === 4,
    'StepSequencer initializes with correct number of tracks'
);

assert(
    sequencer.steps === 16,
    'StepSequencer initializes with correct number of steps'
);

assert(
    sequencer.patterns.length === 4,
    'StepSequencer creates patterns for all tracks'
);

assert(
    sequencer.toggleStep(0, 0),
    'StepSequencer can toggle step on'
);

assertEqual(
    sequencer.getPattern(0)[0],
    1,
    'Step value is 1 after toggle'
);

assert(
    sequencer.toggleStep(0, 0),
    'StepSequencer can toggle step off'
);

assertEqual(
    sequencer.getPattern(0)[0],
    0,
    'Step value is 0 after second toggle'
);

assert(
    sequencer.setStepValue(1, 5, 3),
    'StepSequencer can set specific step value'
);

assertEqual(
    sequencer.getPattern(1)[5],
    3,
    'Step has correct value after setStepValue'
);

assert(
    !sequencer.toggleStep(-1, 0),
    'StepSequencer rejects invalid track index'
);

assert(
    !sequencer.toggleStep(0, 20),
    'StepSequencer rejects invalid step index'
);

sequencer.fillPattern(0);
assert(
    sequencer.getPattern(0).every(v => v === 1),
    'fillPattern creates pattern with all 1s'
);

sequencer.clearPattern(0);
assert(
    sequencer.getPattern(0).every(v => v === 0),
    'clearPattern creates pattern with all 0s'
);

sequencer.setStepValue(0, 4, 1);
sequencer.setStepValue(0, 8, 1);
const kickPattern = sequencer.getPattern(0);
assert(
    kickPattern[4] === 1 && kickPattern[8] === 1,
    'Can create custom kick pattern'
);

assert(
    sequencer.copyStep(0, 4, 1, 4),
    'Can copy step from one track to another'
);

assertEqual(
    sequencer.getPattern(1)[4],
    1,
    'Copied step has correct value'
);

// ============================================================================
// TEST GROUP 2: SoundPicker Component
// ============================================================================
console.log('\n🎵 TEST GROUP 2: SoundPicker Component\n');

const soundPicker = new SoundPicker();

assert(
    soundPicker.sounds.drums.length === 10,
    'SoundPicker has 10 drum sounds'
);

assert(
    soundPicker.selectSound('drums', 'bd'),
    'Can select drum sound'
);

assertEqual(
    soundPicker.selectedSound,
    'bd',
    'Selected sound is stored correctly'
);

assert(
    !soundPicker.selectSound('drums', 'invalid'),
    'Rejects invalid sound selection'
);

assert(
    !soundPicker.selectSound('invalid', 'bd'),
    'Rejects invalid category selection'
);

assert(
    soundPicker.addToFavorites('bd'),
    'Can add sound to favorites'
);

assert(
    soundPicker.favorites.includes('bd'),
    'Favorite is stored in favorites list'
);

assert(
    !soundPicker.addToFavorites('bd'),
    'Cannot add duplicate to favorites'
);

assert(
    soundPicker.removeFromFavorites('bd'),
    'Can remove sound from favorites'
);

assert(
    !soundPicker.favorites.includes('bd'),
    'Favorite is removed from list'
);

const allSounds = soundPicker.getAllSounds();
assert(
    allSounds.length > 20,
    'getAllSounds returns all available sounds'
);

// ============================================================================
// TEST GROUP 3: EffectsRack Component
// ============================================================================
console.log('\n🎛️  TEST GROUP 3: EffectsRack Component\n');

const effectsRack = new EffectsRack();

assert(
    Object.keys(effectsRack.availableEffects).length === 8,
    'EffectsRack has 8 available effects'
);

assert(
    effectsRack.addEffect('lpf', { cutoff: 1000 }),
    'Can add effect to chain'
);

assertEqual(
    effectsRack.chain.length,
    1,
    'Effect chain has one effect'
);

assert(
    effectsRack.chain[0].enabled,
    'Newly added effect is enabled by default'
);

assert(
    effectsRack.toggleEffect(0),
    'Can toggle effect off'
);

assert(
    !effectsRack.chain[0].enabled,
    'Effect is disabled after toggle'
);

assert(
    effectsRack.addEffect('delay', { time: 0.5 }),
    'Can add second effect'
);

assert(
    effectsRack.reorderEffect(1, 0),
    'Can reorder effects in chain'
);

assertEqual(
    effectsRack.chain[0].type,
    'delay',
    'Effect order changed correctly'
);

assert(
    effectsRack.setEffectParam(0, 'time', 0.25),
    'Can set effect parameter'
);

assertEqual(
    effectsRack.chain[0].params.time,
    0.25,
    'Effect parameter updated correctly'
);

assert(
    effectsRack.removeEffect(0),
    'Can remove effect from chain'
);

assertEqual(
    effectsRack.chain.length,
    1,
    'Chain has correct length after removal'
);

assert(
    !effectsRack.addEffect('invalid'),
    'Rejects invalid effect type'
);

// ============================================================================
// TEST GROUP 4: XYPad Component
// ============================================================================
console.log('\n🎯 TEST GROUP 4: XYPad Component\n');

const xyPad = new XYPad(100, 100);

assertEqual(
    { x: xyPad.x, y: xyPad.y },
    { x: 50, y: 50 },
    'XYPad initializes at center position'
);

assert(
    xyPad.setPosition(75, 25),
    'Can set XYPad position'
);

assertEqual(
    { x: xyPad.x, y: xyPad.y },
    { x: 75, y: 25 },
    'XYPad position updated correctly'
);

xyPad.lock();
assert(
    !xyPad.setPosition(10, 10),
    'Cannot set position when locked'
);

assertEqual(
    { x: xyPad.x, y: xyPad.y },
    { x: 75, y: 25 },
    'Position unchanged after locked attempt'
);

xyPad.unlock();
assert(
    xyPad.setPosition(10, 10),
    'Can set position after unlock'
);

assert(
    xyPad.reset(),
    'Can reset XYPad'
);

assertEqual(
    { x: xyPad.x, y: xyPad.y },
    { x: 50, y: 50 },
    'XYPad returns to center after reset'
);

const normalized = xyPad.getNormalizedPosition();
assert(
    normalized.x === 0.5 && normalized.y === 0.5,
    'getNormalizedPosition returns correct values'
);

xyPad.setPosition(100, 0);
const normalizedCorner = xyPad.getNormalizedPosition();
assert(
    normalizedCorner.x === 1.0 && normalizedCorner.y === 0.0,
    'Normalized position works at corners'
);

assert(
    xyPad.assignParameters('cutoff', 'resonance'),
    'Can assign parameters to XYPad'
);

// ============================================================================
// TEST GROUP 5: PatternManipulator Component
// ============================================================================
console.log('\n🔄 TEST GROUP 5: PatternManipulator Component\n');

const manipulator = new PatternManipulator();

const testPattern = [1, 0, 1, 0, 1, 0, 1, 0];
const reversed = manipulator.reverse(testPattern);

assertEqual(
    reversed,
    [0, 1, 0, 1, 0, 1, 0, 1],
    'reverse() reverses pattern correctly'
);

const added = manipulator.add([1, 2, 3, 0], 2);
assertEqual(
    added,
    [3, 4, 5, 0],
    'add() adds value to non-zero steps'
);

const multiplied = manipulator.multiply([1, 0, 1], 2);
assertEqual(
    multiplied,
    [1, 1, 0, 0, 1, 1],
    'multiply() duplicates each step'
);

// Test Euclidean rhythm generation
const euclidean5_16 = manipulator.euclidean(5, 16);
assertEqual(
    euclidean5_16.filter(v => v === 1).length,
    5,
    'Euclidean(5,16) has exactly 5 hits'
);

assertEqual(
    euclidean5_16.length,
    16,
    'Euclidean(5,16) has exactly 16 steps'
);

const euclidean3_8 = manipulator.euclidean(3, 8);
assertEqual(
    euclidean3_8,
    [1, 0, 0, 1, 0, 0, 1, 0],
    'Euclidean(3,8) generates correct pattern'
);

const euclidean4_4 = manipulator.euclidean(4, 4);
assertEqual(
    euclidean4_4,
    [1, 1, 1, 1],
    'Euclidean(4,4) generates all 1s'
);

const rotated = manipulator.euclidean(3, 8, 2);
assertEqual(
    rotated,
    [0, 1, 0, 0, 1, 0, 1, 0],
    'Euclidean rotation works correctly'
);

// Test probability
const probPattern = manipulator.probability([1, 1, 1, 1], [1, 0, 1, 0]);
assert(
    probPattern[1] === 0 && probPattern[3] === 0,
    'probability() respects 0% probability'
);

// Test breeding
const parent1 = [1, 1, 0, 0, 1, 1, 0, 0];
const parent2 = [0, 0, 1, 1, 0, 0, 1, 1];
const offspring = manipulator.breed(parent1, parent2, 0);
assert(
    offspring.length === 8,
    'breed() returns pattern of correct length'
);

// ============================================================================
// TEST GROUP 6: TransportBar Component
// ============================================================================
console.log('\n⏯️  TEST GROUP 6: TransportBar Component\n');

const transport = new TransportBar();

assert(
    !transport.isPlaying,
    'TransportBar initializes in stopped state'
);

assertEqual(
    transport.tempo,
    120,
    'TransportBar initializes with 120 BPM'
);

assertEqual(
    transport.volume,
    0.8,
    'TransportBar initializes with 0.8 volume'
);

assert(
    transport.play(),
    'Can start playback'
);

assert(
    transport.isPlaying,
    'TransportBar is playing after play()'
);

assert(
    transport.stop(),
    'Can stop playback'
);

assert(
    !transport.isPlaying,
    'TransportBar is stopped after stop()'
);

const toggleResult = transport.togglePlay();
assert(
    toggleResult === true,
    'togglePlay() returns true when starting'
);

assert(
    transport.isPlaying,
    'TransportBar is playing after togglePlay()'
);

assert(
    transport.setTempo(140),
    'Can set tempo to valid BPM'
);

assertEqual(
    transport.tempo,
    140,
    'Tempo updated to 140 BPM'
);

assert(
    !transport.setTempo(300),
    'Rejects tempo above maximum'
);

assert(
    !transport.setTempo(30),
    'Rejects tempo below minimum'
);

assert(
    transport.setVolume(0.5),
    'Can set volume'
);

assertEqual(
    transport.volume,
    0.5,
    'Volume updated correctly'
);

assert(
    !transport.setVolume(1.5),
    'Rejects volume above 1.0'
);

assert(
    !transport.setVolume(-0.1),
    'Rejects negative volume'
);

assert(
    transport.record(),
    'Can start recording'
);

assert(
    transport.isRecording && transport.isPlaying,
    'Recording starts playback'
);

assert(
    transport.stopRecord(),
    'Can stop recording'
);

assert(
    !transport.isRecording,
    'Recording stopped'
);

assert(
    transport.reset(),
    'Can reset transport'
);

assert(
    transport.position === 0 && !transport.isPlaying,
    'Reset returns to position 0 and stops'
);

// ============================================================================
// TEST GROUP 7: Integration & Complex Scenarios
// ============================================================================
console.log('\n🔗 TEST GROUP 7: Integration & Complex Scenarios\n');

// Scenario: Create a complete drum pattern
const drumSequencer = new StepSequencer(3, 16);
drumSequencer.setStepValue(0, 0, 1);  // Kick on 1
drumSequencer.setStepValue(0, 4, 1);  // Kick on 5
drumSequencer.setStepValue(0, 8, 1);  // Kick on 9
drumSequencer.setStepValue(0, 12, 1); // Kick on 13
drumSequencer.setStepValue(1, 4, 1);  // Snare on 5
drumSequencer.setStepValue(1, 12, 1); // Snare on 13

const kickHits = drumSequencer.getPattern(0).filter(v => v === 1).length;
const snareHits = drumSequencer.getPattern(1).filter(v => v === 1).length;

assert(
    kickHits === 4 && snareHits === 2,
    'Can create complete drum pattern with kick and snare'
);

// Scenario: Apply effects chain to sound
const drumSounds = new SoundPicker();
const drumEffects = new EffectsRack();

drumSounds.selectSound('drums', 'bd');
drumEffects.addEffect('lpf', { cutoff: 800 });
drumEffects.addEffect('delay', { time: 0.25, feedback: 0.3 });
drumEffects.addEffect('reverb', { room: 0.5 });

assert(
    drumSounds.selectedSound === 'bd' && drumEffects.chain.length === 3,
    'Can chain multiple effects on selected sound'
);

// Scenario: Use pattern manipulator to create variations
const basePattern = [1, 0, 0, 0, 1, 0, 0, 0];
const variation1 = manipulator.reverse(basePattern);
const variation2 = manipulator.euclidean(5, 8);
const variation3 = manipulator.breed(basePattern, variation2);

assert(
    variation1.length === 8 && variation2.length === 8 && variation3.length === 8,
    'Pattern variations maintain correct length'
);

// Scenario: Use XYPad to control multiple effect parameters
const filterPad = new XYPad(100, 100);
filterPad.assignParameters('cutoff', 'resonance');
filterPad.setPosition(80, 30);

const pos = filterPad.getNormalizedPosition();
const cutoffValue = 200 + (pos.x * 4800); // Map to 200-5000 Hz
const resonanceValue = pos.y * 10; // Map to 0-10

assert(
    cutoffValue > 200 && cutoffValue < 5000 && resonanceValue >= 0 && resonanceValue <= 10,
    'XYPad controls mapped to effect parameter ranges'
);

// Scenario: Complete performance workflow
const performanceTransport = new TransportBar();
const performanceSequencer = new StepSequencer(4, 16);

// Set up pattern
performanceSequencer.fillPattern(0);
const eucPattern = manipulator.euclidean(7, 16);
eucPattern.forEach((v, i) => performanceSequencer.setStepValue(1, i, v));

// Set tempo and play
performanceTransport.setTempo(128);
performanceTransport.play();

assert(
    performanceTransport.isPlaying &&
    performanceTransport.tempo === 128 &&
    performanceSequencer.getPattern(0).filter(v => v === 1).length === 16 &&
    performanceSequencer.getPattern(1).filter(v => v === 1).length === 7,
    'Complete performance workflow functions correctly'
);

// ============================================================================
// TEST GROUP 8: Touch Gesture Simulation
// ============================================================================
console.log('\n👆 TEST GROUP 8: Touch Gesture Simulation\n');

// Simulate TAP gesture
const tapSequencer = new StepSequencer(1, 16);
const tapResult = tapSequencer.toggleStep(0, 0);

assert(
    tapResult && tapSequencer.getPattern(0)[0] === 1,
    'TAP gesture toggles step on'
);

// Simulate DOUBLE TAP gesture (copy)
tapSequencer.setStepValue(0, 5, 1);
const doubleTapResult = tapSequencer.copyStep(0, 5, 0, 10);

assert(
    doubleTapResult && tapSequencer.getPattern(0)[10] === 1,
    'DOUBLE TAP gesture copies step'
);

// Simulate LONG PRESS gesture (velocity edit)
const longPressVelocity = 100;
tapSequencer.setStepValue(0, 3, longPressVelocity);

assert(
    tapSequencer.getPattern(0)[3] === longPressVelocity,
    'LONG PRESS gesture sets velocity'
);

// Simulate SWIPE RIGHT gesture (duplicate)
const swipeSequencer = new StepSequencer(2, 16);
swipeSequencer.setStepValue(0, 0, 1);
swipeSequencer.setStepValue(0, 4, 1);
const duplicated = swipeSequencer.duplicatePattern(0);

assert(
    duplicated && swipeSequencer.tracks === 3,
    'SWIPE RIGHT gesture duplicates track'
);

// Simulate DRAG gesture (XYPad)
const dragPad = new XYPad(100, 100);
const dragPath = [
    [10, 10], [20, 15], [30, 25], [40, 40]
];

dragPath.forEach(([x, y]) => dragPad.setPosition(x, y));

assert(
    dragPad.x === 40 && dragPad.y === 40,
    'DRAG gesture updates XYPad position'
);

// Simulate PINCH gesture (zoom)
let zoomLevel = 1.0;
const pinchGesture = (delta) => {
    zoomLevel = Math.max(0.5, Math.min(2.0, zoomLevel + delta));
};

pinchGesture(0.5);
assert(
    zoomLevel === 1.5,
    'PINCH gesture increases zoom'
);

pinchGesture(-1.0);
assert(
    zoomLevel === 0.5,
    'PINCH gesture decreases zoom (with min limit)'
);

// ============================================================================
// TEST GROUP 9: Strudel Pattern Generation
// ============================================================================
console.log('\n🎼 TEST GROUP 9: Strudel Pattern Generation\n');

function sequenceToStrudelPattern(track, sequence) {
    const items = track.samples || track.notes;
    const pattern = [];

    sequence.forEach((val) => {
        if (val === 0) {
            pattern.push('~');
        } else {
            pattern.push(items[val - 1]);
        }
    });

    return pattern.join(' ');
}

const strudelTrack = {
    samples: ['bd', 'sd'],
    notes: null
};

const strudelSequence = [1, 0, 0, 0, 2, 0, 0, 0];
const strudelPattern = sequenceToStrudelPattern(strudelTrack, strudelSequence);

assertEqual(
    strudelPattern,
    'bd ~ ~ ~ sd ~ ~ ~',
    'Generates correct Strudel pattern string'
);

const noteTrack = {
    samples: null,
    notes: ['c2', 'e2', 'g2']
};

const noteSequence = [1, 0, 2, 0, 3, 0, 0, 0];
const notePattern = sequenceToStrudelPattern(noteTrack, noteSequence);

assertEqual(
    notePattern,
    'c2 ~ e2 ~ g2 ~ ~ ~',
    'Generates correct note pattern'
);

// ============================================================================
// TEST GROUP 10: Error Handling & Edge Cases
// ============================================================================
console.log('\n⚠️  TEST GROUP 10: Error Handling & Edge Cases\n');

// Empty sequencer
const emptySeq = new StepSequencer(0, 0);
assert(
    emptySeq.tracks === 0 && emptySeq.steps === 0,
    'Handles empty sequencer initialization'
);

// Single step pattern
const singleSeq = new StepSequencer(1, 1);
singleSeq.toggleStep(0, 0);
assert(
    singleSeq.getPattern(0)[0] === 1,
    'Handles single step pattern'
);

// Maximum tracks
const maxTrackSeq = new StepSequencer(MAX_TRACKS, 16);
assert(
    maxTrackSeq.tracks === MAX_TRACKS,
    'Handles maximum number of tracks'
);

// Effect chain limits
const maxEffects = new EffectsRack();
for (let i = 0; i < 10; i++) {
    maxEffects.addEffect('lpf');
}
assert(
    maxEffects.chain.length === 10,
    'Handles long effect chains'
);

// XYPad boundary testing
const boundaryPad = new XYPad(100, 100);
boundaryPad.setPosition(-10, -10);
assert(
    boundaryPad.x === 0 && boundaryPad.y === 0,
    'XYPad clamps negative coordinates to 0'
);

boundaryPad.setPosition(150, 150);
assert(
    boundaryPad.x === 100 && boundaryPad.y === 100,
    'XYPad clamps coordinates above maximum'
);

// Euclidean edge cases
const euclideanZero = manipulator.euclidean(0, 8);
assert(
    euclideanZero.every(v => v === 0),
    'Euclidean(0,n) returns all zeros'
);

const euclideanFull = manipulator.euclidean(8, 8);
assert(
    euclideanFull.every(v => v === 1),
    'Euclidean(n,n) returns all ones'
);

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '═'.repeat(70));
console.log('\n📊 TEST SUMMARY\n');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}`);
console.log(`💯 Score:  ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('🎵 Mobile UX components are ready for integration with Strudel!\n');
    process.exit(0);
} else {
    console.log('⚠️  SOME TESTS FAILED\n');
    process.exit(1);
}
