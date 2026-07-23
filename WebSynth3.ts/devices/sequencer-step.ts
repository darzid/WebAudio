import { Device } from "./base-devices/device";


export class SequencerStep extends Device {
  constructor(element: HTMLElement, elementClass: string, deviceName: string) {
    super(element, elementClass, deviceName, "MidiDevice");
  }

  get isPlaying() { return this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value); }

    play(time: number, stepIndex: number) {
    }
}
