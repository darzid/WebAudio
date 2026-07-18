class SequencerBase extends MidiDevice {
  _stepLength = 0;
  _nextStep = 0;
  _nextStepTime = 0;
  
  constructor(element, elementClass, handlerRegistry, deviceName, deviceType, stepCssClass) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    consoleLog("Create SequencerBase for element", element);
    this.registerPropertyInputElement("Enabled", "input[name='Enabled']");
    this.registerPropertyInputElement("StepLength", "input[name='StepLength']");
    this.registerPropertyInputElement("LoopLength", "input[name='LoopLength']");
    this.registerChildElementHandler("Steps", stepCssClass);
    this._stepCssClass = stepCssClass;

    this._isPlaying = false;

    this._sequenceStartTime = null;
    this._expectedSequenceDuration = null;
    this._expectedSequenceEndTime = null;
    this._playStepCallsSinceSequenceStart = null;
    this._context = null;
    
    let loopLengthChanged = () => {
      let loopLength = this.getFloatPropertyValue("LoopLength");
      if (this.playingStep) {
        if (loopLength > this.steps.indexOf(this.playingStep))
          this.setPlayingStep(0, 0);
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
    
    /*let stepLengthChanged = () => { 
      this._stepLength = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText) 
    };
    let stepLengthElement = this.getPropertyInputElement("StepLength");
    stepLengthElement.oninput = () => {
      stepLengthChanged();
    }
    stepLengthChanged();*/
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }
  get steps() { return this.findChildElementHandlers(this._stepCssClass); }

  get stepLengthText() { return this.getPropertyInputElement("StepLength").dataset.optionValue; }

  get playingStep() { return this.steps.find(step => step.isPlaying); }

  get currentStepIndex() { return this.playingStep != undefined ? this.steps.indexOf(this.playingStep) : -1; }

  get stepInterval() { return MidiClock.stepInterval; }
  get measureInterval() { return MidiClock.measureInterval; }

  
  get loopLength() { return this.getFloatPropertyValue("LoopLength"); }
  get stepLength() { return MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText); }
  
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
  
  /*
  changeLoopLength(value) {
    if (this.playingStep) {
      if (value > this.steps.indexOf(this.playingStep))
        this.setPlayingStep(0, 0);
    }
    for (let stepIndex = 0; stepIndex < this.steps.length; stepIndex++) {
      this.steps[stepIndex].element.style.display = (stepIndex < value) ? "flex" : "none";
    }
  }
  */
  
  restart_old(time) {
    this.setPlayingStep(time, -1);
    this._isPlaying = true;
  }
  
  renderSequence_old(startTime, endTime) {
    let time = startTime;

    let timeSignature = this.stepLengthText;
    let sequencerStepDuration = MidiClock.convertTimeSignatureToStepDuration(timeSignature);
    if (this.currentStepIndex == this.getFloatPropertyValue("LoopLength") - 1) {
      this.setPlayingStep(time, -1);
    } else {
      let keepPlaying = true;
      while (keepPlaying && time < endTime) {
        time = time + sequencerStepDuration;
        keepPlaying = this.nextStep(time);
        if (!keepPlaying) {
          this.setPlayingStep(time, -1);
          keepPlaying = true;
        }
      }
    }
  }

  playStep_old(time) {
    if (isNaN(time)) {
      throw `Time "${time}" is not a number`
    }

    if (this.audioApp.stopTime && this.audioApp.stopTime <= time) {
      this.audioApp.stop();
      return;
    }

    if (!this._isPlaying)
      return;
      
    let timeSignature = this.stepLengthText;
    let sequencerStepDuration = MidiClock.convertTimeSignatureToStepDuration(timeSignature);
    // consoleLog("Playstep", this.stepLengthText, sequencerStepDuration)
    let timeDifference = 0;
    if (this.currentStepIndex == -1) {
      this._sequenceStartTime = time;
      this._expectedSequenceDuration = sequencerStepDuration * this.getFloatPropertyValue("LoopLength");
      this._expectedSequenceEndTime = this._sequenceStartTime + this._expectedSequenceDuration;
      this._playStepCallsSinceSequenceStart = 0;
    } else {
      this._playStepCallsSinceSequenceStart++;
    }

    let nextStepTime = time + sequencerStepDuration;
    let isPlaying = this.nextStep(nextStepTime);
    if (isPlaying && !this.audioApp.stopPlaying) {
      if (!this.audioApp.rendering) {
        let intervalToNextExpectedStep = (nextStepTime - this._context.currentTime) * 1000;
        // consoleLog(`nextStep: stepIndex: ${this.currentStepIndex}, next step interval: ${intervalToNextExpectedStep}`);
        window.setTimeout(() => this.playStep(nextStepTime), intervalToNextExpectedStep);
      }
      else {
        this.playStep(nextStepTime);
      }
    }
    else if (this.audioApp.stopPlaying) {
      this.audioApp.stop();
      return;
    }
  }

  nextStep_old(time) {
    if (!this._isPlaying)
      return false;
      
    let currentStep = this.playingStep ? this.steps.indexOf(this.playingStep) : -1;
    let newStep = (currentStep < this.getFloatPropertyValue("LoopLength") - 1) ? currentStep + 1 : 0;
    this.setPlayingStep(time, newStep);
    return newStep > -1;
  }
  
  setPlayingStep_old(time, value) {
    if (this.playingStep)
      this.playingStep.isPlaying = false;
    if (value > -1)
      this.steps[value].play(time, value);
  }

  stop_old(time) {
    this._isPlaying = false;
    this.setPlayingStep(time, -1);
  }
}

