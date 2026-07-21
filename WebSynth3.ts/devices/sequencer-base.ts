import { Logger } from "../lib-ts/logger";
import { MidiClock } from "../lib-ts/web-audio/midi-clock";
import { MidiDevice } from "./base-devices/midi-device";

export class SequencerBase extends MidiDevice {
  _stepLength: number = 0;
  _nextStep = 0;
  _nextStepTime = 0;
  _stepLengthElement;
  private _stepCssClass: string;
  private _isPlaying: boolean;
  private _steps: any[] = [];
  
  constructor(element: HTMLElement, elementClass: string, deviceName: string, stepCssClass: string) {
    super(element, elementClass, deviceName);
    Logger.log("Create SequencerBase for element", element);
    this.registerPropertyInputElement("Enabled", "input[name='Enabled']");
    this.registerPropertyInputElement("StepLength", "input[name='StepLength']");
    this.registerPropertyInputElement("LoopLength", "input[name='LoopLength']");
    this.registerChildElementHandler("Steps", stepCssClass);
    this._stepCssClass = stepCssClass;

    this._isPlaying = false;
    
    let loopLengthChanged = () => {
      
      let loopLength: number = this.getPropertyValue("LoopLength");
      Logger.log("LoopLength changed to " + loopLength);
      if (this.playingStep) {
        if (loopLength > this.steps.indexOf(this.playingStep))
          this._nextStep = 0;
      }
      for (let stepIndex = 0; stepIndex < this.steps.length; stepIndex++) {
        this.steps[stepIndex].element.style.display = (stepIndex < loopLength) ? "flex" : "none";
      }
    };
    this.subscribeToPropertyChange("LoopLength", () => loopLengthChanged());
    loopLengthChanged();
    
    this.subscribeToPropertyChange("StepLength", () => this._stepLength = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText));
    this._stepLengthElement = this.getPropertyInputElement("StepLength");
  }

  get steps() { 
    if (! this._steps) 
      this._steps = this.findChildElementHandlers(this._stepCssClass); 
    return this._steps;
  }

  get stepLengthText() { return this._stepLengthElement.dataset.optionValue!; }

  get playingStep() { return this.steps.find(step => step.isPlaying); }

  get currentStepIndex() { return this.playingStep != undefined ? this.steps.indexOf(this.playingStep) : -1; }

  get stepInterval() { return MidiClock.stepInterval; }
  get measureInterval() { return MidiClock.measureInterval; }

  get loopLength() { return this.getPropertyValue("LoopLength"); }
  get stepLength() { 
    if (! this._stepLength) {
      this._stepLength = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText);
    }
    return this._stepLength;
  }
  
  get nextStepTime() { return this._nextStepTime; }

  // New start method
  start(time: number) {
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

