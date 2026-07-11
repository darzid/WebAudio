class BruteSequencerStep extends ElementHandler {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry);
    
  //  consoleLog("Create BruteSequencerStep for element", element);
    this.registerPropertyInputElement("Note", "input[name='Note']");
    this.registerPropertyInputElement("Velocity", "input[name='Velocity']");
    this.registerPropertyInputElement("Gate", "input[name='Gate']");
    this.registerPropertyInputElement("Pressure", "input[name='Pressure']");
    this.registerPropertyInputElement("OnOff", "input[name='OnOff']");

    this._context = null;
    
    element.id = element.getAttribute("name");
   // let buttons = element.querySelectorAll("button");
   // buttons.forEach(button => button.onclick = () => button.dataset.isOn = !button.dataset.isOn);
    
    consoleLog("Created BruteSequencerStep for element");
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }
  get sequencer() { return this.getParentElementHandler("BruteSequencer"); }

  get stepInterval() { return MidiClock.stepInterval; }
  get renderTime() { return this.audioApp.renderTime; }
  
  get noteText() { return this.getPropertyInputElement("Note").dataset.optionValue; }

  get note() { return this.getFloatPropertyValue("Note"); }
  get velocity() { return this.getFloatPropertyValue("Velocity"); }
  get gate() { return this.getFloatPropertyValue("Gate"); }
  get pressure() { return this.getFloatPropertyValue("Pressure"); }
  get isOn() { return this.getBoolPropertyValue("OnOff"); }

  get isPlaying() { return this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value); }

  setupAudioGraph(audioContext) {
   this._context = audioContext;
  }
  
  play(time, stepIndex) {
    this.isPlaying = true;
    
    if (this.isOn && this.sequencer.getBoolPropertyValue("Enabled")) {
        this.audioApp.logMidiEvent(time, this.track.id, stepIndex, this.noteText);
        document.dispatchEvent(
          new CustomEvent("PlayNote", { detail: { 
            time: time, 
            track: this.track.id, 
            note: this.noteText, 
            gate: this.gate, 
            velocity: this.velocity, 
            pressure: this.pressure, 
            stepDuration: this.stepInterval } }));
      }
  }
}

