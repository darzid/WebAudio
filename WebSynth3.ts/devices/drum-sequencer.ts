import { Logger } from "../lib-ts/logger";
import { toggleNextSiblingVisibility } from "../main";
import { SequencerBase } from "./sequencer-base";

export class DrumSequencer extends SequencerBase {
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "DrumSequencer", "DrumStep");
    Logger.log("Create DrumSequencer for element", element);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle")!);
    
    this.setPropertyValue("LoopLength", 4)
  }
}

