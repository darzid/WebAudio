import { ElementHandler } from "../lib-ts/element-handler-registry/element-handler";
import { Logger } from "./../lib-ts/logger";
import { MidiClock } from "./../lib-ts/web-audio/midi-clock";
import { AudioApp } from "./audio-app";
import { BruteSequencer } from "./brute-sequencer";
import { Track } from "./track";

export class BruteSequencerStep extends ElementHandler {
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass);
    
  //  Logger.log("Create BruteSequencerStep for element", element);
    this.registerPropertyInputElement("Note", "input[name='Note']");
    this.registerPropertyInputElement("Velocity", "input[name='Velocity']");
    this.registerPropertyInputElement("Gate", "input[name='Gate']");
    this.registerPropertyInputElement("Pressure", "input[name='Pressure']");
    this.registerPropertyInputElement("OnOff", "input[name='OnOff']");

    this.element.id = element.getAttribute("name")!;
   // let buttons = element.querySelectorAll("button");
   // buttons.forEach(button => button.onclick = () => button.dataset.isOn = !button.dataset.isOn);
    
    Logger.log("Created BruteSequencerStep for element");
  }

  get audioApp(): AudioApp { return this.getParentElementHandler("AudioApp") as AudioApp; }
  get track(): Track { return this.getParentElementHandler("Track") as Track; }
  get sequencer(): BruteSequencer { return this.getParentElementHandler("BruteSequencer") as BruteSequencer; }

  get stepInterval() { return MidiClock.stepInterval; }
  get renderTime() { return this.audioApp.renderTime; }
  
  get noteText() { return this.getPropertyInputElement("Note").dataset.optionValue; }

  get note() { return this.getPropertyValue("Note"); }
  get velocity() { return this.getPropertyValue("Velocity"); }
  get gate() { return this.getPropertyValue("Gate"); }
  get pressure() { return this.getPropertyValue("Pressure"); }
  get isOn() { return this.getPropertyValue("OnOff"); }

  get isPlaying() { return this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value); }

  setupAudioGraph() {
  }
  
  play(time: number, stepIndex: number) {
    this.isPlaying = true;
    
    if (this.isOn && this.sequencer.getPropertyValue("Enabled")) {
      this.audioApp.logMidiEvent(time, this.track.id, stepIndex, this.noteText);
      document.dispatchEvent(new CustomEvent("PlayNote", { detail: { 
            time: time, 
            track: this.track.id, 
            note: this.noteText, 
            gate: this.gate, 
            velocity: this.velocity, 
            pressure: this.pressure, 
            stepDuration: this.stepInterval } }));
    }
    else {
      console.log(`${this.track.id}: NOT playing step ${stepIndex}`, this.isOn);
    }
  }
}

