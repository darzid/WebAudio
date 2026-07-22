import { Logger } from "../logger";

export class MidiClock {
  static _tempo: number;
  static _isRunning = false;
  static _currentStep = -1;
  static _currentMeasure = -1;
  static _lastLogTime = -1;

  static get tempo() { return this._tempo; }
  static set tempo(value) {
    this._tempo = value;
    document.dispatchEvent(new CustomEvent("TempoChanged", { detail: { bpm: value } }));
  }

  static get secondsPerStep() { return this.secondsPerBeat / 4; }
  static get secondsPerBeat() { return 60.0 / this.tempo; }
  static get secondsPerMeasure() { return this.secondsPerBeat * 4; }

  static get stepInterval() { return this.secondsPerStep * 1000; }
  static get measureInterval() { return this.secondsPerMeasure * 1000; }

  static get isRunning() { return this._isRunning; }

  static get currentStep() { return this._currentStep; }
  static get currentMeasure() { return this._currentMeasure; }

  static initialize(beatsPerMinute: number) {
    this._tempo = beatsPerMinute;
  }

  static getBeatTimings(tempo: number, timeSignature: string) {
    let beatTimings = {
      tempo: tempo,
      timeSignature: timeSignature,
      stepsPerBeat: MidiClock.getStepsPerMeasure(timeSignature) / 4,
      secondsPerBeat: 60.0 / tempo,
      secondsPerStep: 0
    };
    beatTimings.secondsPerStep = beatTimings.secondsPerBeat / beatTimings.stepsPerBeat;
    return beatTimings;
  }
  
  static getStepsPerMeasure(timeSignature: string): number {
    if (timeSignature == "-") {
      return 0;
    }

    let parts = timeSignature.split("/");
    let beatsPerMeasure = parseInt(parts[0]);
    let stepsPerBeatString: string = parts[1];
    let triplet = stepsPerBeatString.endsWith('t');
    let stepsPerBeat = 0;
    if (triplet) {
      stepsPerBeat = parseFloat(stepsPerBeatString.replace('t', '')) * 1.5;
    }
    else {
      stepsPerBeat = parseFloat(stepsPerBeatString);
    }
    let stepsPerMeasure = stepsPerBeat * beatsPerMeasure;
  //  Logger.log("Midiclock.")
    return stepsPerMeasure;
  }

  static convertTimeSignatureToStepDuration(timeSignature: string) {
    if (timeSignature == "-")
      return 0;

    if (! timeSignature)
      timeSignature = "1/16";

    let stepsPerMeasure = MidiClock.getStepsPerMeasure(timeSignature);
   // Logger.log("Midiclock.convert " + stepsPerMeasure, timeSignature)
    return MidiClock.secondsPerMeasure / stepsPerMeasure;
  }
}

