import { Logger } from "../lib-ts/logger";
import { toggleNextSiblingVisibility } from "../main";
import { SequencerBase } from "./sequencer-base";

export class BruteSequencer extends SequencerBase {
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "BruteSequencer", "Step");
    Logger.log("Create BruteSequencer for element", element);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle")!);
  }
}

