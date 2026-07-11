class AudioApp extends AudioEffectDevice {
  _rec;
  mediaRecorder;
  chunks;
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "AudioApp", "MasterOut");
    this._initialized = false;
    consoleLog("AudioApp constructor");

    this.registerPropertyInputElement("Tempo", "input[name='Tempo']");
    this.getChildInputElement("Tempo").oninput = () => { 
      MidiClock.tempo = this.getFloatPropertyValue("Tempo");
      this.updateBpmText();
    };

    this.stopTime = null;
    this._renderBuffer = null;
    this._renderEndTime = null;
    this._prevContext = null;
    this._rendering = false;
    this._offlineContext = null;
    this.browser = new PresetBrowser(this);

    MidiClock.initialize(this.getFloatPropertyValue("Tempo"));
    if (MidiClock.stepInterval != this.stepInterval) {
      throw "Seconds per step mismatch";
    }
    this.updateBpmText();
    this.registerChildElementHandler("Tracks", "Track");

    this.log = "";
    this.logStart = 0;
    this.chunks = [];
    
    
    
    //this.addSynthTrack();
  }

  get BPM() { return MidiClock.tempo; }
  get beatInterval() { return (60.0 / this.BPM) * 1000; }
  get measureInterval() { return this.beatInterval * 4; }
  get stepInterval() { return this.beatInterval / 4; }
  get microStepInterval() { return this.measureInterval / 128; }

  get renderTime() { return 0.01; }

  get tracks() { return this.findChildElementHandlers("Track"); }

  get isPlaying() { this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value); }

  get rendering() { return this._rendering; }
  get renderEndTime() { return this._renderEndTime; }
  get isRendering() { return this.renderEndTime; }

  get stopPlaying() {
    return this.isPlaying && this.stopTime && this.stopTime <= this._context.currentTime;
  }

  addSynthTrack() {
    let trackId = "track" + (this.tracks.length + 1);
    let trackHtml = `
    <div id="${trackId}" class="Track">
      <span class="TrackTitle DeviceTitle" title="Synth Track ${this.tracks.length + 1}" data-template="toggle-title-template-h3"></span>
      <div data-template="synth-track-devices-template"/>
    </div>`;
    let tracksElement = this.element.querySelector(".Tracks");
    tracksElement.innerHTML += trackHtml;
    let trackElement = document.getElementById(trackId);
    consoleLog(trackElement)
    applyTemplates();
    //elementHandlerRegistry.processAll();
  }
  
  setupAudioGraph(audioContext) {
    //  consoleLog("audioApp.setupAudioGraph");
    if (this._context) {
      this._outputNode.disconnect();
    }
    super.setupAudioGraph(audioContext, audioContext.createGain());

    this.tracks.forEach(track => track.setupAudioGraph(audioContext));
    let compressor = new DynamicsCompressorNode(audioContext);
    compressor.threshold.value = -100;
    compressor.knee.value = 40;
    compressor.ratio.value = 20;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    this.output.connect(compressor);
    compressor.connect(audioContext.destination);
  }

  logMidiEvent(time, track, step, note) {
   // this.log += `\r\n${time - this.logStart}\t${track}\tStep ${step}\tPlay note ${note}`;
  }

  logAudioEvent(time, track, device, message) {
   // consoleLog(`\r\n${time - this.logStart}\t${track}\t${device}\t${message}`);
    //this.log += `\r\n${time - this.logStart}\t${track}\t${device}\t${message}`;
  }

  record() {
    this._recording = true;
    this.chunks = [];
    let recordingstream = audioContext.createMediaStreamDestination();
    this.mediaRecorder = new MediaRecorder(recordingstream.stream);
    this.output.connect(recordingstream);
    
    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.onstop = (e) => {
        consoleLog("data available after MediaRecorder.stop() called.");
        const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
        const audioURL = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = audioURL;
        a.download = 'Recording.wav';
        a.innerText = "download";
        a.click();
        
       // document.querySelector(".app-buttons").appendChild(a);
      }
    
    this.mediaRecorder.start();
    this.play();
  }
  
  play() {
    this.tracks.forEach(track => track.startSequencer(this._context.currentTime + (10 * this.renderTime)));
    this.isPlaying = true;
  }
  
  stop() {
    let time = this._context.currentTime;
    this.isPlaying = false;
    this.tracks.forEach(track => track.stopSequencer(time));
    consoleLog(this.log.split("\n").sort().join("\n"));
    
    if (this._recording) {
      this.mediaRecorder.stop();
      this.output.disconnect(this.mediaRecorder);
      
      consoleLog(this.mediaRecorder.state);
      consoleLog("recorder stopped");
      this._recording = false;
    }
  }
  
  lowerBpm() {
    MidiClock.tempo--;
    this.setFloatPropertyValue("Tempo", MidiClock.tempo);
    this.updateBpmText();
  }

  higherBpm() {
    MidiClock.tempo++;
    this.setFloatPropertyValue("Tempo", MidiClock.tempo);
    this.updateBpmText();
  }

  updateBpmText() {
    document.querySelector(".bpm-text").innerHTML = MidiClock.tempo + " BPM";
    document.querySelector(".bpm-text").title = MidiClock.tempo + " BPM";
  }

}


