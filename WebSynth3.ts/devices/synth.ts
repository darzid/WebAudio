import { NonCustomOscillatorType } from "tone/build/esm/source/oscillator/OscillatorInterface";
import { Logger } from "../lib-ts/logger";
import { toggleNextSiblingVisibility } from "../main.ts";
import { AudioDevice } from "./base-devices/audio-device";
// import * as Tone from "tone";

export class Synth extends AudioDevice {
  private _bypassFilters = false;
  _filter1Module: any;
  _filter2Module: any;
  _context: any;
  release: any;
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "Synth");

    Logger.log("Create Synth for element", element);
    this.registerPropertyInputElement("Enabled", ".SynthTitle input[name='Enabled']");

    this.registerPropertyInputElement("Osc1Enabled", ".Osc1 input[name='Enabled']");
    this.registerPropertyInputElement("Osc1Type", ".Osc1 input[name='Type']");
    this.registerPropertyInputElement("Osc1Octave", ".Osc1 input[name='Octave']");
    this.registerPropertyInputElement("Osc1Detune", ".Osc1 input[name='Detune']");
    this.registerPropertyInputElement("Osc1Volume", ".Osc1 input[name='Volume']");

    this.registerPropertyInputElement("Osc2Enabled", ".Osc2 input[name='Enabled']");
    this.registerPropertyInputElement("Osc2Type", ".Osc2 input[name='Type']");
    this.registerPropertyInputElement("Osc2Octave", ".Osc2 input[name='Octave']");
    this.registerPropertyInputElement("Osc2Detune", ".Osc2 input[name='Detune']");
    this.registerPropertyInputElement("Osc2Volume", ".Osc2 input[name='Volume']");

    // if (!this._bypassFilters) {
    //   this._filter1Module = new Filter(this, "Filter1");
    //   this._filter2Module = new Filter(this, "Filter2");
    // }


    this.registerPropertyInputElement("AmpEnvEnabled", ".AmpEnv input[name='Enabled']");
    this.registerPropertyInputElement("Attack", ".AmpEnv input[name='Attack']");
    this.registerPropertyInputElement("Decay", ".AmpEnv input[name='Decay']");
    this.registerPropertyInputElement("Sustain", ".AmpEnv input[name='Sustain']");
    this.registerPropertyInputElement("Release", ".AmpEnv input[name='Release']");
    this.registerPropertyInputElement("Volume", ".AmpEnv input[name='Volume']");

    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle")!);

    document.addEventListener("PlayNote", (e: Event) => {
      let eventInfo = e as CustomEvent;
      console.log("Synth play note")
      if (eventInfo.detail.track == this.track.id) this.playNote(eventInfo);
    });
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }

  get osc1Type(): NonCustomOscillatorType { return this.getPropertyInputElement("Osc1Type").dataset.optionValue as NonCustomOscillatorType; }
  get osc2Type(): NonCustomOscillatorType { return this.getPropertyInputElement("Osc2Type").dataset.optionValue as NonCustomOscillatorType; }

  setupAudioGraph() {
    super.setupAudioGraph();

    /* FM 
    this.fm1Lfo = this._context.createOscillator({frequency: this.getPropertyValue("Osc1FmRate")});
    this.fm1LfoGain = this._context.createGain({gain: this.getPropertyValue("Osc1FmAmount")});
    this.fm1Lfo.connect(this.fm1LfoGain.gain);
    
    this.fm2Lfo = this._context.createOscillator({frequency: this.getPropertyValue("Osc2FmRate")});
    this.fm2LfoGain = this._context.createGain({gain: this.getPropertyValue("Osc2FmAmount")});
    this.fm2Lfo.connect(this.fm2LfoGain.gain);
    */
  }

  playNote(eventInfo: CustomEvent) {
    if (!this.getPropertyValue("Enabled"))
      return;

    Logger.log("PlayNote", eventInfo);

    let startTime = eventInfo.detail.time;
    let duration = (eventInfo.detail.stepDuration / 500) * (eventInfo.detail.gate / 127);

    let frequency = NOTE_FREQUENCIES[eventInfo.detail.note];

    let osc1gain = this._context.createGain();
    let osc2gain = this._context.createGain();
    let oscsGain = this._context.createGain();
    osc1gain.connect(oscsGain);
    osc2gain.connect(oscsGain);

    // let ampEnvGain = new Tone.Volume(this._context, { gain: 1.0, channelCount: 2 });

    // this.connectBoolPropertyToAudioParam(ampEnvGain.gain, "Enabled");

    let holdVolume = this.getPropertyValue<number>("Volume") * (eventInfo.detail.velocity / 127);
    let attackEndTime = eventInfo.detail.time + this.getPropertyValue("Attack");
    let decayEndTime = attackEndTime + this.getPropertyValue("Decay");
    let gateEndTime = startTime + duration;
    let releaseEndTime = gateEndTime + this.getPropertyValue("Release");

    // if (this.getPropertyValue("Osc1Enabled")) {
    //   let oscillator1 = new Tone.MonoSynth({
    //     oscillator: {
    //       type: this.osc1Type
    //     },
    //     envelope: {
    //       attack: this.getPropertyValue<number>("Attack"),
    //       decay: this.getPropertyValue<number>("Decay"),
    //       sustain: this.getPropertyValue<number>("Sustain"),
    //       release: this.getPropertyValue<number>("Release")
    //     },
    //     filter: {
    //       frequency: this.getPropertyValue<number>("Filter1Frequency"),
    //       type: this.getPropertyValue<string>("Filter1Type") as BiquadFilterType
    //     }
    //   });
    //   this._updateDetune(oscillator1, "Osc1");
    //   this.subscribeToPropertyChange("Osc1Octave", () => this._updateDetune(oscillator1, "Osc1"));
    //   this.subscribeToPropertyChange("Osc1Detune", () => this._updateDetune(oscillator1, "Osc1"));

    //   this.connectFloatPropertyToAudioParam(osc1gain.gain, "Osc1Volume");

    //   oscillator1.connect(osc1gain);

    //   this.audioApp.logAudioEvent(startTime, this.track.id, "Synth", "Start oscillator1");
    //   oscillator1.triggerAttackRelease(startTime, releaseEndTime);
    //   this.audioApp.logAudioEvent(releaseEndTime, this.track.id, "Synth", "Stop oscillator1");
    // }

    // if (this.getPropertyValue("Osc2Enabled")) {
    //   let oscillator2 = new Tone.MonoSynth({
    //     oscillator: {
    //       type: this.osc2Type
    //     },
    //     envelope: {
    //       attack: this.getPropertyValue<number>("Attack"),
    //       decay: this.getPropertyValue<number>("Decay"),
    //       sustain: this.getPropertyValue<number>("Sustain"),
    //       release: this.getPropertyValue<number>("Release")
    //     },
    //     filter: {
    //       frequency: this.getPropertyValue<number>("Filter1Frequency"),
    //       type: this.getPropertyValue<string>("Filter1Type") as BiquadFilterType
    //     }
    //   });

    //   this._updateDetune(oscillator2, "Osc2");
    //   this.subscribeToPropertyChange("Osc2Octave", () => this._updateDetune(oscillator2, "Osc2"));
    //   this.subscribeToPropertyChange("Osc2Detune", () => this._updateDetune(oscillator2, "Osc2"));

    this.connectFloatPropertyToAudioParam(osc2gain.gain, "Osc2Volume");
    // oscillator2.connect(osc2gain);

    this.audioApp.logAudioEvent(startTime, this.track.id, "Synth", "Start oscillator2");
    // oscillator2.triggerAttackRelease(startTime, releaseEndTime);
    this.audioApp.logAudioEvent(releaseEndTime, this.track.id, "Synth", "Stop oscillator2");
  }

  // if (!this._bypassFilters) {
  //   this._filter1Module.setupAudioGraph(this._context, oscsGain, startTime, duration, eventInfo.detail.pressure);
  //   this._filter2Module.setupAudioGraph(this._context, oscsGain, startTime, duration, eventInfo.detail.pressure);

  //   this._filter1Module.output.connect(this.wetOutput);
  //   this._filter2Module.output.connect(this.wetOutput);
  // }
  // else
  //oscsGain.connect(this.wetOutput);

  // if (this.getPropertyValue("AmpEnvEnabled")) {
  //   if (this.getPropertyValue<number>("Attack") > 0) {
  //     ampEnvGain.gain.setValueAtTime(0, eventInfo.detail.time);
  //     ampEnvGain.gain.linearRampToValueAtTime(holdVolume, attackEndTime);
  //   }
  //   else
  //     ampEnvGain.gain.value = holdVolume;

  //   ampEnvGain.gain.linearRampToValueAtTime(this.getPropertyValue<number>("Sustain") * holdVolume, decayEndTime);
  //   if (this.release) {
  //     ampEnvGain.gain.linearRampToValueAtTime(this.getPropertyValue<number>("Sustain") * holdVolume, gateEndTime);
  //     ampEnvGain.gain.linearRampToValueAtTime(0, releaseEndTime);
  //   }
  // }
  // ampEnvGain.connect(wetOutput);
}

  // _updateDetune(oscillator: Tone.MonoSynth, oscillatorId: string) {
  //   oscillator.detune.value = (this.getPropertyValue<number>(oscillatorId + "Octave") * 1200) + this.getPropertyValue<number>(oscillatorId + "Detune");
  // }


export const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C0': 16.351,
  'C#0': 17.324,
  'D0': 18.354,
  'D#0': 19.445,
  'E0': 20.601,
  'F0': 21.827,
  'F#0': 23.124,
  'G0': 24.499,
  'G#0': 25.956,
  'A0': 27.5,
  'A#0': 29.135,
  'B0': 30.868,
  'C1': 32.703,
  'C#1': 34.648,
  'D1': 36.708,
  'D#1': 38.891,
  'E1': 41.203,
  'F1': 43.654,
  'F#1': 46.249,
  'G1': 48.999,
  'G#1': 51.913,
  'A1': 55,
  'A#1': 58.27,
  'B1': 61.735,
  'C2': 65.406,
  'C#2': 69.296,
  'D2': 73.416,
  'D#2': 77.782,
  'E2': 82.407,
  'F2': 87.307,
  'F#2': 92.499,
  'G2': 97.999,
  'G#2': 103.826,
  'A2': 110,
  'A#2': 116.541,
  'B2': 123.471,
  'C3': 130.813,
  'C#3': 138.591,
  'D3': 146.832,
  'D#3': 155.563,
  'E3': 164.814,
  'F3': 174.614,
  'F#3': 184.997,
  'G3': 195.998,
  'G#3': 207.652,
  'A3': 220,
  'A#3': 233.082,
  'B3': 246.942,
  'C4': 261.626,
  'C#4': 277.183,
  'D4': 293.665,
  'D#4': 311.127,
  'E4': 329.628,
  'F4': 349.228,
  'F#4': 369.994,
  'G4': 391.995,
  'G#4': 415.305,
  'A4': 440,
  'A#4': 466.164,
  'B4': 493.883,
  'C5': 523.251,
  'C#5': 554.365,
  'D5': 587.33,
  'D#5': 622.254,
  'E5': 659.255,
  'F5': 698.456,
  'F#5': 739.989,
  'G5': 783.991,
  'G#5': 830.609,
  'A5': 880,
  'A#5': 932.328,
  'B5': 987.767,
  'C6': 1046.502,
  'C#6': 1108.731,
  'D6': 1174.659,
  'D#6': 1244.508,
  'E6': 1318.51,
  'F6': 1396.913,
  'F#6': 1479.978,
  'G6': 1567.982,
  'G#6': 1661.219,
  'A6': 1760,
  'A#6': 1864.655,
  'B6': 1975.533,
  'C7': 2093.005,
  'C#7': 2217.461,
  'D7': 2349.318,
  'D#7': 2489.016,
  'E7': 2637.021,
  'F7': 2793.826,
  'F#7': 2959.955,
  'G7': 3135.964,
  'G#7': 3322.438,
  'A7': 3520,
  'A#7': 3729.31,
  'B7': 3951.066,
  'C8': 4186.009,
  'C#8': 4434.922,
  'D8': 4698.636,
  'D#8': 4978.032,
  'E8': 5274.042,
  'F8': 5587.652,
  'F#8': 5919.91,
  'G8': 6271.928,
  'G#8': 6644.876,
  'A8': 7040,
  'A#8': 7458.62,
  'B8': 7902.132,
  'C9': 8372.018,
  'C#9': 8869.844,
  'D9': 9397.272,
  'D#9': 9956.064,
  'E9': 10548.084,
  'F9': 11175.304,
  'F#9': 11839.82,
  'G9': 12543.856,
  'G#9': 13289.752,
  'A9': 14080,
  'A#9': 14917.24,
  'B9': 15804.264
}
