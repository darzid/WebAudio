class SequencerBase extends MidiDevice {
  _stepLength = null;
  _nextStep = 0;
  _nextStepTime = 0;
  _stepLengthElement;
  
  constructor(element, elementClass, handlerRegistry, deviceName, deviceType, stepCssClass) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    consoleLog("Create SequencerBase for element", element);
    this.registerPropertyInputElement("Enabled", "input[name='Enabled']");
    this.registerPropertyInputElement("StepLength", "input[name='StepLength']");
    this.registerPropertyInputElement("LoopLength", "input[name='LoopLength']");
    this.registerChildElementHandler("Steps", stepCssClass);
    this._stepCssClass = stepCssClass;

    this._isPlaying = false;
    this._context = null;
    
    let loopLengthChanged = () => {
      let loopLength = this.getFloatPropertyValue("LoopLength");
      if (this.playingStep) {
        if (loopLength > this.steps.indexOf(this.playingStep))
          this._nextStep = 0;
      }
      for (let stepIndex = 0; stepIndex < this.steps.length; stepIndex++) {
        this.steps[stepIndex].element.style.display = (stepIndex < loopLength) ? "flex" : "none";
      }
    };
    let loopLengthElement = this.getPropertyInputElement("LoopLength");
    loopLengthElement.oninput = () => {
      loopLengthChanged();
    }
    loopLengthChanged();
    
    this._stepLengthElement = this.getPropertyInputElement("StepLength");
    this._stepLengthElement.oninput = () => {
      this._stepLength = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText);
    }
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }
  get steps() { return this.findChildElementHandlers(this._stepCssClass); }

  get stepLengthText() { return this._stepLengthElement.dataset.optionValue; }

  get playingStep() { return this.steps.find(step => step.isPlaying); }

  get currentStepIndex() { return this.playingStep != undefined ? this.steps.indexOf(this.playingStep) : -1; }

  get stepInterval() { return MidiClock.stepInterval; }
  get measureInterval() { return MidiClock.measureInterval; }

  
  get loopLength() { return this.getFloatPropertyValue("LoopLength"); }
  get stepLength() { 
    if (! this._stepLength) {
      this._stepLength = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText);
    }
    return this._stepLength;
  }
  
  get nextStepTime() { return this._nextStepTime; }

  setupAudioGraph(audioContext) {
    this._context = audioContext;
    this.steps.forEach(step => step.setupAudioGraph(audioContext));
  }

  // New start method
  start(time) {
    this._nextStep = 0;
    this._nextStepTime = time;
  }
  
  // New scheduler method
  scheduleNextStep() {
    if (this.playingStep)
      this.playingStep.isPlaying = false;
      
    this.steps[this._nextStep].play(this._nextStepTime, this._nextStep);
    
    this._nextStepTime += this.stepLength;
    this._nextStep++;
    if (this._nextStep == this.loopLength)
      this._nextStep = 0;
  }

  // New stop method
  stop() {
    if (this.playingStep)
      this.playingStep.isPlaying = false;
    this._isPlaying = false;
  }
}

