class Track extends AudioDevice {
  _outputAnalyser;
  _outputPcmData;

  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "Track", "AudioChannel");
    //  consoleLog("Create Track for element", element);

    this.registerChildElementHandler("BruteSequencer", "BruteSequencer");
    this.registerChildElementHandler("DrumSequencer", "DrumSequencer");
    this.registerChildElementHandler("AudioDevices", "AudioDevice");

    this._isPlaying = false;
  }

  get id() { return this.element.id; }
  get audioApp() { return this.getParentElementHandler("AudioApp"); }

  get volume() { return this.output.gain.value; }
  set volume(value) { this.output.gain.value = value; }

  get bruteSequencer() { return this.findChildElementHandler("BruteSequencer"); }
  get drumSequencer() { return this.findChildElementHandler("DrumSequencer"); }
  get sequencer() {
    if (this.bruteSequencer)
      return this.bruteSequencer;
    else if (this.drumSequencer)
      return this.drumSequencer;
    else {
      throw "No sequencer found";
    }
  }
  get audioDevices() { return this.findChildElementHandlers("AudioDevice"); }

  get currentOutputLevel() {
    this._outputAnalyser.getFloatTimeDomainData(this._outputPcmData);
    let sumSquares = 0.0;
    for (const amplitude of this._outputPcmData) { sumSquares += amplitude * amplitude; }
    let value = Math.sqrt(sumSquares / this._outputPcmData.length) * 100;
    return value;
  }

  setupAudioGraph(audioContext) {
    //consoleLog("Track.setupAudioGraph");

    if (this._context) {
      this.wetOutput.disconnect();
      this.audioDevices.forEach(device => device.output.disconnect());
    }

    super.setupAudioGraph(audioContext);

    this.sequencer.setupAudioGraph(audioContext);

    this.audioDevices.forEach(audioDevice => audioDevice.setupAudioGraph(audioContext));

    consoleLog("Connecting audio devices for track " + this.id);
    for (let deviceIndex = 0; deviceIndex < this.audioDevices.length - 1; deviceIndex++) {
      consoleLog(`Connecting audio device ${this.audioDevices[deviceIndex].name} for track ${this.id}`);
      this.audioDevices[deviceIndex].output.connect(this.audioDevices[deviceIndex + 1].input);
    }
    if (this.audioDevices.length > 0)
      this.audioDevices[this.audioDevices.length - 1].output.connect(this.wetOutput);

    let outputMeter = this.element.querySelector("canvas[name='TrackMeter']");
    if (outputMeter) {
      let analyser = levelMeterManager.register(audioContext, this.output, outputMeter);
      analyser.connect(this.audioApp.output);
    } else {
      this.output.connect(this.audioApp.input);
    }
  }

  startSequencer(time) {
    if (isNaN(time)) {
      throw `Track.startSequencer: Time "${time}" is not a number`
    }

    this._isPlaying = true;
    this.sequencer.restart(time);
    this.sequencer.playStep(time);
  }

  stopSequencer(time) {
    this._isPlaying = false;
    this.sequencer.stop(time);
  }
}