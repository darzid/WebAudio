class BruteSequencer extends SequencerBase {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "BruteSequencer", "MidiSequencer", "Step");
    consoleLog("Create BruteSequencer for element", element);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));
  }
}

