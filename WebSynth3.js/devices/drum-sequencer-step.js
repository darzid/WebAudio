class DrumSequencerStep extends ElementHandler {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry);
    
    consoleLog("Create DrumSequencerStep for element", element);
    const voiceNames = ["CH", "OH", "SD", "BD"];
    this.voices = [];
    voiceNames.forEach(voiceName => this.voices.push(new DrumVoice(voiceName, this)));
    this._context = null;
    
    element.id = element.getAttribute("name");
    
    consoleLog("Created DrumSequencerStep for element");
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }
  get sequencer() { return this.getParentElementHandler("DrumSequencer"); }
  
  get stepInterval() { return MidiClock.stepInterval; }
  get renderTime() { return this.audioApp.renderTime; }

  get isPlaying() { return this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value);}

  setupAudioGraph(audioContext) {
   this._context = audioContext;
  }
  
  play(time, stepIndex) {
    this.isPlaying = true;
    
    if (this.sequencer.getPropertyValue("Enabled")) {
      this.voices.forEach(voice => {
          if (voice.isOn) {
            this.audioApp.logMidiEvent(time, this.track.id, stepIndex, voice.noteText);
            document.dispatchEvent(new CustomEvent("PlayNote", { detail: { 
              time: time, 
              track: this.track.id, 
              note: voice.noteText, 
              gate: voice.gate, 
              velocity: voice.velocity, 
              pressure: voice.pressure, 
              stepDuration: this.stepInterval } }));
          }
        });
    }
  }
}

class DrumVoice {
  constructor(name, step) {
    this.name = name;
    this.step = step;
    
    step.registerPropertyInputElement(name + "Note", `.${name} input[name='Note']`);
    step.registerPropertyInputElement(name + "Velocity", `.${name} input[name='Velocity']`);
    step.registerPropertyInputElement(name + "Gate", `.${name} input[name='Gate']`);
    step.registerPropertyInputElement(name + "Pressure", `.${name} input[name='Pressure']`);
    step.registerPropertyInputElement(name + "OnOff", `.${name} input[name='OnOff']`);
  }
  
  get noteText() { return this.step.getPropertyInputElement(this.name + "Note").dataset.optionValue; }
  get note() { return this.step.getPropertyValue(this.name + "Note"); }
  get velocity() { return this.step.getPropertyValue(this.name + "Velocity"); }
  get gate() { return this.step.getPropertyValue(this.name + "Gate"); }
  get isOn() { return this.step.getPropertyValue(this.name + "OnOff"); }
}