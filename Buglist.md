## What the app is

A vanilla-JS Web Audio synth workstation: an HTML-template-driven UI where DOM elements with CSS classes (`Synth`, `Track`, `DrumSequencer`…) get paired with JS "handler" classes via `ElementHandlerRegistry`. Sequencer steps dispatch `PlayNote` DOM events; instruments listen and schedule Web Audio nodes. It's a clean, consistent architecture overall — but there are real bugs.

## Broken features (will throw or misbehave when used)

1. FIXED - **Recording is broken twice over** — [audio-app.js:107](devices/audio-app.js:107) `record()` references a bare `audioContext`, but the only `AudioContext` is a local `const` inside `setupAudioGraph()` in [websynth.js:119](websynth.js:119). Pressing record throws `ReferenceError: audioContext is not defined`. Even if that were fixed, [audio-app.js:143](devices/audio-app.js:143) calls `this.output.disconnect(this.mediaRecorder)` — a `MediaRecorder` isn't an audio node and was never the thing connected (the `MediaStreamAudioDestinationNode` was), so `stop()` would also throw. Minor bonus: the blob is `audio/ogg` but downloads as `Recording.wav`.

2. FIXED - **Missing template = page hangs forever** — in [template-expander.js:67](lib/template-expander/template-expander.js:67), when a template id isn't found, the function returns *without removing* the `data-template` attribute. `applyTemplates()` loops `while (templateItems.length > 0)`, so one typo'd template name makes startup spin in an infinite loop and freezes the tab.

3. FIXED - **Disabling a device makes it *louder*, not silent** — in `AudioEffectDevice.setupAudioGraph` ([device-base.js:92-121](devices/device-base.js:92)) three parallel gains all connect the same `_outputNode` to `_output`: two wired with `inverseBoolToInt` (gain 1 when *disabled*) and one with `boolToInt`. Enabled → total gain 1×; disabled → 2× of the fully-processed signal. There's no actual bypass path from the input, so the "Enabled" toggle on an Effector doubles its output instead of bypassing it.

4. FIXED - **`isPlaying` getter has no `return`** — [audio-app.js:50](devices/audio-app.js:50) `get isPlaying() { this.hasState("is-playing"); }` always yields `undefined`. Everything that reads it (`stopPlaying` at line 57) silently gets falsy.

5. FIXED - **`setBoolPropertyValue` crashes if ever called** — [element-handler-registry.js:156-161](lib/element-handler-registry/element-handler-registry.js:156) references `inputElement`, which is never declared in that method (copy-paste from `setFloatPropertyValue` without assigning the variable). Currently unused, so it's a landmine rather than an active bug. Same file, line 128: `getChildInputElements()` calls `.filter` on a plain object — would also throw. And line 133's `if (!childElement.nodeName == "input")` is an operator-precedence bug that makes the check always pass.

6. FIXED - **Recorder can't work: its dependency is never loaded** — `recorder.js` is included in index.html but `lib/web-audio/inline-worker.js` (which defines `InlineWorker`, used at [recorder.js:39](lib/web-audio/recorder.js:39)) is not in any `<script>` tag. `new Recorder(...)` would throw. In practice `Recorder`, `FmKick`, and `Sampler` are all loaded but never instantiated — dead weight.

7. FIXED - **Duplicate class trap** — `devices/drum-synth.js` and `devices/drum-synth2.js` both declare `class DrumSynth`. Only the first is loaded today, but the moment someone adds drum-synth2.js to index.html, the page dies with "Identifier 'DrumSynth' has already been declared." The two also disagree on the note map (`C0`=Kick vs `C1`=kick) and parameter names (Tone vs Pitch), so they're not drop-in replacements.

## Correctness bugs in the audio engine

8. **Node cleanup skips half the nodes** — in `Synth.playNote`, the `onended` handlers ([synth.js:122-127](devices/synth.js:122) and 148-153) do `connectedNodes.forEach(node => { node.disconnect(); connectedNodes.splice(...) })`. Splicing an array while `forEach`-ing it skips every other element, so nodes leak on every note. With two oscillators both running this same handler on the *shared* array, the second one double-disconnects what's left. `drum-synth.js` does this correctly (decrement-counter pattern) — `synth.js` should match it.

9. FIXED - **Per-note reassignment of shared UI handlers** — every `playNote` call overwrites `oninput` on the shared Osc1/Osc2 Octave/Detune/Volume inputs and the Filter inputs ([synth.js:101-102](devices/synth.js:101), [filter.js:51-57](devices/modules/filter.js:51)), binding them to that one note's nodes. Turning a knob only affects the most recent note (fine-ish for live tweaks) but each closure pins the previous note's oscillator/filter in memory until the next note, and `connectBoolPropertyToAudioParam(ampEnvGain.gain, "Enabled")` per-note means the Enabled checkbox only controls the last-played note's envelope gain.

10. FIXED - **Event-listener leaks in the UI-mode system** — `ElementUIMode` ([element-ui-mode.js:27,35,55,59](lib/ui-modes/element-ui-mode.js:27)) and `WobbleMode.deactivate` ([knob.js:66](lib/knob/knob.js:66)) call `removeEventListener` with *freshly created* arrow functions, which never match the ones added — nothing is ever removed, and `deactivate()` re-adds the activation listener each cycle. Every wobble activate/deactivate accumulates more listeners; long sessions degrade. Also `WobbleConfigMode` is constructed with an empty-string activation event, so it can never activate — its double-tap-config feature is effectively dead code.

11. **Sequencer timing relies on chained `setTimeout` one step ahead** ([sequencer-base.js:118](devices/sequencer-base.js:118)). It self-corrects against `context.currentTime`, but background-tab throttling (timeouts clamped to ≥1s) will make playback fall apart when the tab loses focus. The standard fix is a lookahead scheduler that queues several steps per tick.

12. FIXED - **`changeLoopLength` calls `setPlayingStep(0)` with one argument** ([sequencer-base.js:47](devices/sequencer-base.js:47)) — the signature is `(time, value)`, so `value` is `undefined` and the intent (restart at step 0) never happens. Also `DrumSequencer`'s constructor sets `LoopLength` to 4 *after* the base class already applied visibility for the HTML default of 8, and `setFloatPropertyValue` fires `onchange` while the loop-length hook is on `oninput` — so the step display doesn't match the actual loop length until the user touches the knob.

13. **`Track.setupAudioGraph` disconnect on re-setup is incomplete** — it disconnects device outputs but the old level-meter analysers, `ControlAutoUpdater` meters, and `LevelMeterManager` entries accumulate on every re-setup ([level-meter.js:10-22](lib/web-audio/level-meter.js:10), [control-autoupdater.js:6-14](control-autoupdater.js:6)); each registered meter also runs *two* permanent `requestAnimationFrame` loops (one in `LevelMeterManager.updateMeters`, one inside `vumeter()`), which is a lot of per-frame work for a page full of meters.

## Robustness / cross-browser issues

14. **`window.event` everywhere** — [knob.js](lib/knob/knob.js:232) (keydown, wheel, all pointer handlers) and [websynth.js:59](websynth.js:59) (`window.event.srcElement`) use the non-standard `window.event` instead of the event parameter. This breaks all knob interaction in Firefox and is deprecated everywhere else. The handlers receive the event as a parameter already — it's just not used.

15. **Errors are silenced by the logging flag** — `consoleError` and `consoleWarn` in [websynth.js:12-22](websynth.js:12) are gated on `logging = false`, so genuine errors (missing templates, missing knob inputs) vanish silently. Errors should always print; only verbose logs should be gated.

16. **Preset browser edge cases** — `savePreset()` ([preset-browser.js:64](devices/preset-browser.js:64)) doesn't handle the user cancelling the prompt (saves a preset literally named `"null"`); `select()` throws if no radio is checked; `load()` has no try/catch around `JSON.parse` of localStorage (one corrupt save bricks the browser dialog); and `import()` is an empty stub with a live button wired to it.

17. FIXED - **`addSynthTrack` is half-dead** — [audio-app.js:61](devices/audio-app.js:61) uses `innerHTML +=` on the Tracks container, which destroys and re-creates every existing track's DOM (orphaning all registered handlers' element references), and the call to re-process handlers is commented out, so the new track never becomes functional anyway.

18. FIXED - **Invalid HTML in `<head>`** — index.html places an `<svg>` block (line 58) and all the app markup inside/after the head without a `<body>` open tag; browsers repair it, but it's fragile. Templates also use self-closing `<div ... />`, which HTML parsers ignore, occasionally producing surprise nesting.

19. FIXED - **`getParentElementWithClassName`** ([control-autoupdater.js:44](control-autoupdater.js:44)) walks `parentElement` with no null check — crashes with a null dereference if the class is never found.

## Suggested priorities

If you want fixes, I'd order them: **#2** (infinite loop — one typo freezes the app), **#3** (disable = louder), **#1** (recording), **#8/#9** (note-level leaks and knob-binding), then **#14** (Firefox support) and the rest. Several are small, surgical fixes. Tell me which ones you'd like me to tackle and I'll fix and verify them — the app is trivially runnable locally so each fix can be checked in the browser.

One open question that affects fixing #3: was the "Enabled" toggle on effect devices meant to be a *bypass* (dry signal passes through) or a *mute*? The wiring suggests bypass was intended but never got a dry path from the input.

these were the bug that were found earlier. 

read the api documentation pages and see if you have a solution for a refactoring

only plan