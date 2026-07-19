class DrumSequencer extends SequencerBase {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "DrumSequencer", "MidiSequencer", "DrumStep");
    consoleLog("Create DrumSequencer for element", element);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));
    
    this.setPropertyValue("LoopLength", 4)
  }
}

