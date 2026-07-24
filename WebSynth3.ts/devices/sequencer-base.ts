import type { ElementHandler } from "../lib-ts/element-handler-registry/element-handler";
import { Logger } from "../lib-ts/logger";
import { MidiClock } from "../lib-ts/web-audio/midi-clock";
import { MidiDevice } from "./base-devices/midi-device";
import type { BruteSequencerStep } from "./brute-sequencer-step";
import { DrumSequencerStep } from "./drum-sequencer-step";

export interface ISequencerStep {
  isPlaying: boolean;
  play(time: number, stepIndex: number): void;
  element: HTMLElement;
}

export class SequencerBase extends MidiDevice {
  _stepLength: number = 0;
  _nextStep : number = 0;
  _nextStepTime: number = 0;
  _stepLengthElement: HTMLInputElement;
  private _stepCssClass: string;
  private _isPlaying: boolean;
  private _steps: ISequencerStep[] = [];
  
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
        this.steps[stepIndex]!.element.style.display = (stepIndex < loopLength) ? "flex" : "none";
      }
    };
    this.subscribeToPropertyChange("LoopLength", () => loopLengthChanged());
    loopLengthChanged();
    
    this.subscribeToPropertyChange("StepLength", () => this._stepLength = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText));
    this._stepLengthElement = this.getPropertyInputElement("StepLength") as HTMLInputElement;
  }

  get stepLengthText() { return this._stepLengthElement.dataset.optionValue!; }

  get steps(): ISequencerStep[] { return this.findChildElementHandlers("Step") as unknown as ISequencerStep[];}

  get playingStep() : ISequencerStep { 
    return this.steps.find(step => step.isPlaying)!; 
  }

  get currentStepIndex() { 
    return this.playingStep != undefined ? this.steps.indexOf(this.playingStep) : -1; }

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
    let playingStep = this.steps.find(step => step.isPlaying); 
    if (playingStep) {
      this.playingStep.isPlaying = false;
    //  Logger.log("prev step")
    }
   // else
 //     Logger.log("no prev step")
    
    
    let nextStep = this.steps[this._nextStep]!;
    //Logger.log("schedule next step", steps, nextStep, this._nextStepTime, MidiClock.tempo, this.stepLengthText)
    nextStep.play(this._nextStepTime, this._nextStep);
    
    let stepLength : number = MidiClock.convertTimeSignatureToStepDuration(this.stepLengthText) as number;
    this._nextStepTime = this._nextStepTime + stepLength;
   // Logger.log("schedule next step time", this._nextStepTime, stepLength)
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

