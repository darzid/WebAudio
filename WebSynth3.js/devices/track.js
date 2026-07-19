class Track extends AudioDevice {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "Track", "AudioChannel");

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

  setupAudioGraph(audioContext) {
    consoleLog("Track.setupAudioGraph");

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

    this.output.connect(this.audioApp.wetOutput);
  }
}