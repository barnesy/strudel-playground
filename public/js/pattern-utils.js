/**
 * pattern-utils — pure, framework-free helpers shared by the sequencer app
 * (controller-v2.html) and the test suite.
 *
 * These functions have no DOM, Strudel, or app-state dependencies, so they are
 * safe to unit test in isolation. This file is the single source of truth:
 *
 *   - Browser: loaded as a classic <script>, it exposes `window.StrudelUtils`.
 *   - Node (ESM or CJS tests): exposes the same API via `module.exports` and
 *     `globalThis.StrudelUtils`.
 *
 * It intentionally uses only `typeof` guards (no import/export keywords) so the
 * same file runs unchanged in every environment.
 */
(function (root) {
    'use strict';

    /**
     * Duration of a 16th note in milliseconds.
     * @param {number} bpm - Beats per minute
     * @returns {number}
     */
    function getSixteenthNoteDuration(bpm) {
        return (60000 / bpm) / 4;
    }

    /** Quantize a timestamp to the nearest 16th-note grid position. */
    function quantizeToGrid(time, bpm) {
        const gridSize = getSixteenthNoteDuration(bpm);
        return Math.round(time / gridSize) * gridSize;
    }

    /** Quantize with sensitivity: 'off' | 'loose' | 'strict'. */
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

    /** Detect onsets (transients) in an audio buffer; returns times in ms. */
    function detectOnsets(audioData, sampleRate, threshold = 0.3) {
        const onsets = [];
        const windowSize = Math.floor(sampleRate * 0.01); // 10ms windows
        const hopSize = Math.floor(windowSize / 2);

        let previousEnergy = 0;

        for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
            let energy = 0;
            for (let j = 0; j < windowSize; j++) {
                const sample = audioData[i + j];
                energy += sample * sample;
            }
            energy = Math.sqrt(energy / windowSize); // RMS

            if (energy > threshold && energy > previousEnergy * 1.5) {
                const timeMs = (i / sampleRate) * 1000;
                if (onsets.length === 0 || timeMs - onsets[onsets.length - 1] > 20) {
                    onsets.push(Math.round(timeMs));
                }
            }

            previousEnergy = energy;
        }

        return onsets;
    }

    /** Slice an audio buffer into segments based on onset times. */
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

    /** Convert a millisecond time to a 16-step grid position (0-15). */
    function timeToStepPosition(timeMs, bpm) {
        const sixteenthDuration = getSixteenthNoteDuration(bpm);
        const position = Math.floor(timeMs / sixteenthDuration) % 16;
        return position;
    }

    /**
     * Generate a Euclidean rhythm pattern using the Bjorklund algorithm.
     * @param {number} hits - Number of hits to distribute
     * @param {number} steps - Total number of steps
     * @returns {number[]} Pattern (1 = hit, 0 = rest)
     */
    function generateEuclidean(hits, steps) {
        if (hits >= steps) return new Array(steps).fill(1);
        if (hits === 0) return new Array(steps).fill(0);

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

    /** Rotate a pattern by N steps. */
    function rotatePattern(pattern, rotate) {
        const r = rotate % pattern.length;
        return [...pattern.slice(r), ...pattern.slice(0, r)];
    }

    /** Breed two patterns using single-point crossover and mutation. */
    function breedPatterns(patternA, patternB, mutationRate = 0.05) {
        const offspring = [];
        const crossoverPoint = Math.floor(Math.random() * patternA.length);

        for (let i = 0; i < patternA.length; i++) {
            offspring[i] = i < crossoverPoint ? patternA[i] : patternB[i];
            if (Math.random() < mutationRate) {
                offspring[i] = offspring[i] ? 0 : 1;
            }
        }

        return offspring;
    }

    /** Calculate semitone intervals between sorted note names. */
    function calculateIntervals(notes) {
        const noteValues = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
                           'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11};

        const values = notes.map(n => noteValues[n]).sort((a, b) => a - b);
        const intervals = [];

        for (let i = 1; i < values.length; i++) {
            intervals.push(values[i] - values[i - 1]);
        }

        return intervals;
    }

    /** Detect a chord type from a set of note names. */
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

    /** Probabilistically morph between two patterns (0 = all A, 1 = all B). */
    function morphPatterns(patternA, patternB, blendRatio) {
        const morphed = [];

        for (let i = 0; i < Math.min(patternA.length, patternB.length); i++) {
            const useB = Math.random() < blendRatio;
            morphed.push(useB ? patternB[i] : patternA[i]);
        }

        return morphed;
    }

    /** Map a Y position to a blend ratio (0-1). */
    function yPositionToBlendRatio(y, canvasHeight) {
        return Math.max(0, Math.min(1, y / canvasHeight));
    }

    /** Linearly map a value from one range to another, clamped to the input range. */
    function mapRange(value, inMin, inMax, outMin, outMax) {
        const clamped = Math.max(inMin, Math.min(inMax, value));
        return (clamped - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /** Map a device tilt angle to a filter cutoff frequency. */
    function tiltToFilterCutoff(tilt) {
        return mapRange(tilt, -45, 45, 200, 5000);
    }

    /** Map a device tilt angle to a volume (0-1). */
    function tiltToVolume(tilt) {
        return mapRange(tilt, -45, 45, 0, 1);
    }

    /** Convert onset times to a sequencer step pattern. */
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

    /** Quantize onset times to the 16th-note grid. */
    function quantizeOnsets(onsets, bpm) {
        const sixteenthDuration = (60000 / bpm) / 4;
        return onsets.map(onset => {
            return Math.round(onset / sixteenthDuration) * sixteenthDuration;
        });
    }

    /** Map a color-wheel angle (0-360°) to a musical note name. */
    function angleToNote(angle) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const noteIndex = Math.floor((normalizedAngle / 360) * 12);
        return noteNames[noteIndex];
    }

    /** Detect a harmonic relationship between two color-wheel angles. */
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

    const api = {
        getSixteenthNoteDuration,
        quantizeToGrid,
        quantizeWithMode,
        detectOnsets,
        sliceAudioByOnsets,
        timeToStepPosition,
        generateEuclidean,
        rotatePattern,
        breedPatterns,
        calculateIntervals,
        detectChord,
        morphPatterns,
        yPositionToBlendRatio,
        mapRange,
        tiltToFilterCutoff,
        tiltToVolume,
        onsetsToPattern,
        quantizeOnsets,
        angleToNote,
        detectHarmonyRelation,
    };

    // CommonJS (require) — e.g. *.test.cjs
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    // Browser classic script + Node ESM side-effect import both see globalThis.
    if (root) {
        root.StrudelUtils = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
