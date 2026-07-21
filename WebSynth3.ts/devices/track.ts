import { Logger } from "../lib-ts/logger";
import { AudioDevice } from "./base-devices/audio-device";
import { AudioApp } from "./audio-app";
import { SequencerBase } from "./sequencer-base";
import { BruteSequencer } from "./brute-sequencer";
import { DrumSequencer } from "./drum-sequencer";

export class Track extends AudioDevice {
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "Track");
    this.registerChildElementHandler("BruteSequencer", "BruteSequencer");
    this.registerChildElementHandler("DrumSequencer", "DrumSequencer");
    this.registerChildElementHandler("AudioDevices", "AudioDevice");
  }

  get audioApp() { return this.getParentElementHandler("AudioApp") as AudioApp; }
  get bruteSequencer() { return this.findChildElementHandler("BruteSequencer") as BruteSequencer; }
  get drumSequencer() { return this.findChildElementHandler("DrumSequencer") as DrumSequencer; }
  get sequencer(): SequencerBase {
    if (this.bruteSequencer)
      return this.bruteSequencer;
    else if (this.drumSequencer)
      return this.drumSequencer;
    else {
      throw "No sequencer found";
    }
  }
  get audioDevices() { return this.findChildElementHandlers("AudioDevice") as AudioDevice[]; }

  setupAudioGraph(): void {
    this.audioDevices.forEach(audioDevice => audioDevice.setupAudioGraph());

    Logger.log("Connecting audio devices for track " + this.id);
    for (let deviceIndex = 0; deviceIndex < this.audioDevices.length - 1; deviceIndex++) {
      Logger.log(`Connecting audio device ${this.audioDevices[deviceIndex].name} for track ${this.id}`);
      this.audioDevices[deviceIndex].output!.connect(this.audioDevices[deviceIndex + 1].input!);
    }
    if (this.audioDevices.length > 0)
      this.audioDevices[this.audioDevices.length - 1].output!.connect(this.wetOutput!);

    this.output!.connect(this.audioApp.wetOutput!);
  }
}

// class TrackOld extends AudioDevice {
//   _isPlaying: boolean;
//   element: any;
//   output: any;
//   constructor(element: HTMLElement, elementClass: string) {
//     super(element, elementClass, ElementHandlerRegistry, "Track", "AudioChannel");

//     this.registerChildElementHandler("BruteSequencer", "BruteSequencer");
//     this.registerChildElementHandler("DrumSequencer", "DrumSequencer");
//     this.registerChildElementHandler("AudioDevices", "AudioDevice");

//     this._isPlaying = false;
//   }

//   get id() { return this.element.id; }
//   get audioApp() { return this.getParentElementHandler("AudioApp"); }

//   get volume() { return this.output.gain.value; }
//   set volume(value) { this.output.gain.value = value; }

//   get bruteSequencer() { return this.findChildElementHandler("BruteSequencer"); }
//   get drumSequencer() { return this.findChildElementHandler("DrumSequencer"); }
//   get sequencer() {
//     if (this.bruteSequencer)
//       return this.bruteSequencer;
//     else if (this.drumSequencer)
//       return this.drumSequencer;
//     else {
//       throw "No sequencer found";
//     }
//   }
//   get audioDevices() { return this.findChildElementHandlers("AudioDevice"); }

//   setupAudioGraph(audioContext) {
//     Logger.log("Track.setupAudioGraph");

//     super.setupAudioGraph(audioContext);

//     this.sequencer.setupAudioGraph(audioContext);

//     this.audioDevices.forEach(audioDevice => audioDevice.setupAudioGraph(audioContext));

//     Logger.log("Connecting audio devices for track " + this.id);
//     for (let deviceIndex = 0; deviceIndex < this.audioDevices.length - 1; deviceIndex++) {
//       Logger.log(`Connecting audio device ${this.audioDevices[deviceIndex].name} for track ${this.id}`);
//       this.audioDevices[deviceIndex].output.connect(this.audioDevices[deviceIndex + 1].input);
//     }
//     if (this.audioDevices.length > 0)
//       this.audioDevices[this.audioDevices.length - 1].output.connect(this.wetOutput);

//     this.output.connect(this.audioApp.wetOutput);
//   }
//   wetOutput(wetOutput: any) {
//     throw new Error("Method not implemented.");
//   }
// }