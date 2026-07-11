class MidiClock {
  static _tempo;
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
  static get secondsPerBeat() { return 60.0 / this._tempo; }
  static get secondsPerMeasure() { return this.secondsPerBeat * 4; }

  static get stepInterval() { return this.secondsPerStep * 1000; }
  static get measureInterval() { return this.secondsPerMeasure * 1000; }

  static get isRunning() { return this._isRunning; }

  static get currentStep() { return this._currentStep; }
  static get currentMeasure() { return this._currentMeasure; }

  static initialize(beatsPerMinute) {
    this._tempo = beatsPerMinute;
  }

  static getBeatTimings(tempo, timeSignature) {
    let beatTimings = {
      tempo: tempo,
      timeSignature: timeSignature,
      stepsPerBeat: MidiClock.getStepsPerMeasure(timeSignature) / 4,
      secondsPerBeat: 60.0 / tempo
    };
    beatTimings.secondsPerStep = beatTimings.secondsPerBeat / beatTimings.stepsPerBeat;
    return beatTimings;
  }
  
  static getStepsPerMeasure(timeSignature) {
    if (timeSignature == "-") {
      return 0;
    }

    let parts = timeSignature.split("/");
    let beatsPerMeasure = parseInt(parts[0]);
    let stepsPerBeat = parts[1];
    let triplet = stepsPerBeat.endsWith('t');
    if (triplet) {
      stepsPerBeat = parseFloat(stepsPerBeat.replace('t', '')) * 1.5;
    }
    let stepsPerMeasure = stepsPerBeat * beatsPerMeasure;
    return stepsPerMeasure;
  }

  static convertTimeSignatureToStepDuration(timeSignature) {
    if (timeSignature == "-") {
      return 0;
    }

    let stepsPerMeasure = MidiClock.getStepsPerMeasure(timeSignature);
    return MidiClock.secondsPerMeasure / stepsPerMeasure;
  }
}

