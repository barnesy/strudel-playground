/**
 * Record Tab Validation Script
 * Simple validation without external dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('=== RECORD TAB VALIDATION ===\n');

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

// Test 1: Voice tap elements are removed
console.log('TEST 1: Voice Tap Elements Removed');
test('HTML', !html.includes('id="voiceTapBtn"'), 'voiceTapBtn element removed');
test('HTML', !html.includes('id="voicePreviewContainer"'), 'voicePreviewContainer element removed');
test('HTML', !html.includes('id="voicePreviewPattern"'), 'voicePreviewPattern element removed');
test('HTML', !html.includes('id="applyVoicePattern"'), 'applyVoicePattern element removed');
test('HTML', !html.includes('VOICE TAP'), 'Voice tap button text removed');
console.log('');

// Test 2: Voice tap CSS removed
console.log('TEST 2: Voice Tap CSS Removed');
test('CSS', !html.includes('.voice-tap-btn {'), 'voice-tap-btn CSS removed');
test('CSS', !html.includes('.voice-tap-btn:active'), 'voice-tap-btn:active CSS removed');
test('CSS', !html.includes('.voice-tap-btn.recording'), 'voice-tap-btn.recording CSS removed');
test('CSS', !html.includes('.voice-preview {'), 'voice-preview CSS removed');
test('CSS', !html.includes('.voice-preview-title'), 'voice-preview-title CSS removed');
test('CSS', !html.includes('.voice-preview-pattern'), 'voice-preview-pattern CSS removed');
test('CSS', !html.includes('.voice-preview-step'), 'voice-preview-step CSS removed');
console.log('');

// Test 3: Required record elements still present
console.log('TEST 3: Required Record Elements Present');
test('HTML', html.includes('id="recordBtn"'), 'recordBtn element present');
test('HTML', html.includes('id="countdownDisplay"'), 'countdownDisplay element present');
test('HTML', html.includes('id="levelMeterFill"'), 'levelMeterFill element present');
test('HTML', html.includes('id="waveformCanvas"'), 'waveformCanvas element present');
test('HTML', html.includes('id="sampleGrid"'), 'sampleGrid element present');
test('HTML', html.includes('class="record-btn"'), 'record-btn CSS class present');
console.log('');

// Test 4: Record tab functionality intact
console.log('TEST 4: Record Tab Functionality');
test('JS', html.includes('function startRecording()'), 'startRecording function present');
test('JS', html.includes('function stopRecording()'), 'stopRecording function present');
test('JS', html.includes('function detectOnsets'), 'detectOnsets function present');
test('JS', html.includes('function quantizeWithMode'), 'quantizeWithMode function present');
test('JS', html.includes('function getSixteenthNoteDuration'), 'getSixteenthNoteDuration function present');
test('JS', html.includes("getElementById('recordBtn')"), 'recordBtn event listener present');
console.log('');

// Test 5: No JavaScript references to removed elements
console.log('TEST 5: No JavaScript References to Removed Elements');
test('JS', !html.includes("getElementById('voiceTapBtn')"), 'No voiceTapBtn JavaScript reference');
test('JS', !html.includes("getElementById('voicePreviewContainer')"), 'No voicePreviewContainer JavaScript reference');
test('JS', !html.includes("getElementById('voicePreviewPattern')"), 'No voicePreviewPattern JavaScript reference');
test('JS', !html.includes("getElementById('applyVoicePattern')"), 'No applyVoicePattern JavaScript reference');
console.log('');

// Test 6: Record view structure
console.log('TEST 6: Record View Structure');
test('HTML', html.includes('id="record-view"'), 'Record view container present');
test('HTML', html.includes('class="record-container"'), 'Record container present');
test('HTML', html.includes('class="record-controls"'), 'Record controls present');
test('HTML', html.includes('class="level-meter-container"'), 'Level meter container present');
test('HTML', html.includes('class="waveform-container"'), 'Waveform container present');
test('HTML', html.includes('class="quantize-mode-container"'), 'Quantize mode container present');
test('HTML', html.includes('class="sample-library"'), 'Sample library present');
console.log('');

// Summary
console.log('=== VALIDATION SUMMARY ===');
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
    console.log('\n✓ ALL TESTS PASSED');
    console.log('✓ Record tab is clean after voice tap removal');
    console.log('✓ No errors expected');
    process.exit(0);
} else {
    console.log('\n✗ SOME TESTS FAILED');
    console.log('Please review the failures above');
    process.exit(1);
}
