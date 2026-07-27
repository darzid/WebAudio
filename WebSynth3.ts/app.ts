import { Logger } from "./lib-ts/logger";
import { ElementHandlerRegistry } from "./lib-ts/element-handler-registry/element-handler-registry";
import { Device } from "./devices/base-devices/device";
import { BruteSequencer } from "./devices/brute-sequencer";
import { BruteSequencerStep } from "./devices/brute-sequencer-step";
import { DrumSequencer } from "./devices/drum-sequencer";
import { DrumSequencerStep } from "./devices/drum-sequencer-step";
import { DuoSynthDevice } from "./devices/duo-synth";
import { Track } from "./devices/track";
import { AudioApp } from "./devices/audio-app";
import { applyTemplates } from "./lib-ts/template-expander/template-expander";
import { setupKnob } from "./lib-ts/knob/knob"


Logger.log('TypeScript works!');

// initialize();

Logger.log('Initialized');


