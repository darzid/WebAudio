import { Logger } from "../../lib-ts/logger";
import { Device } from "./device";

export class MidiDevice extends Device {
  constructor(element: HTMLElement, elementClass: string, deviceName: string) {
    super(element, elementClass, deviceName, "MidiDevice");
    Logger.log("MidiDevice constructor");
  }
}
