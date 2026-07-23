import { Logger } from "../lib-ts/logger";
import { toggleNextSiblingVisibility } from "../main.ts";
import { BruteSequencerStep } from "./brute-sequencer-step.ts";
import { SequencerBase } from "./sequencer-base";

export class BruteSequencer extends SequencerBase {
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "BruteSequencer", "Step");
    Logger.log("Create BruteSequencer for element", element);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle")!);
  }
}

