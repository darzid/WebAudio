class AudioApp extends AudioDevice {
  _rec;
  mediaRecorder;
  chunks;
  _useLimiter = false;
  
  _lookahead = 25.0;        // How frequently to call scheduling function 
                             //(in milliseconds)
  _scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
                             // This is calculated from lookahead, and overlaps 
                             // with next interval (in case the timer is late)
  _timerWorker = null;      // The Web Worker used to fire timer messages

  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "AudioApp", "MasterOut");
    this._initialized = false;
    consoleLog("AudioApp constructor");

    this.registerPropertyInputElement("Tempo", "input[name='Tempo']");
    this.getChildInputElement("Tempo").oninput = () => { 
      MidiClock.tempo = this.getFloatPropertyValue("Tempo");
      this._updateBpmText();
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
    this._updateBpmText();
    this.registerChildElementHandler("Tracks", "Track");

    this.log = "";
    this.logStart = 0;
    this.chunks = [];
    this.init();
  }

  get BPM() { return MidiClock.tempo; }
  get beatInterval() { return (60.0 / this.BPM) * 1000; }
  get measureInterval() { return this.beatInterval * 4; }
  get stepInterval() { return this.beatInterval / 4; }
  get microStepInterval() { return this.measureInterval / 128; }

  get renderTime() { return 0.05; }

  get tracks() { return this.findChildElementHandlers("Track"); }

  get isPlaying() { return this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value); }

  get rendering() { return this._rendering; }
  get renderEndTime() { return this._renderEndTime; }
  get isRendering() { return this.renderEndTime; }

  get stopPlaying() {
    return this.isPlaying && this.stopTime && this.stopTime <= this._context.currentTime;
  }

  get volume() { return this.output.gain.value; }
  set volume(value) { this.output.gain.value = value; }
  
  get scheduleAheadTime() { return this._scheduleAheadTime; }
  /*addSynthTrack() {
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
  }*/
  
  init() {
    this._timerWorker = new Worker("../../lib/web-audio/timer-worker.js");

    this._timerWorker.onmessage = (e) => {
      if (e.data == "tick") {
        //console.log("tick!");
        this._scheduler();
      }
      else
        console.log("message: " + e.data);
    };
    this._timerWorker.postMessage({"interval":this._lookahead});
  }
  
  setupAudioGraph(audioContext) {
    if (this._context) {
      this.output.disconnect();
    }
    super.setupAudioGraph(audioContext);

    this.tracks.forEach(track => track.setupAudioGraph(audioContext));
    
    if (this._useLimiter) {
      let compressor = new DynamicsCompressorNode(audioContext);
      compressor.threshold.value = -100;
      compressor.knee.value = 40;
      compressor.ratio.value = 20;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
  
      this.output.connect(compressor);
      compressor.connect(audioContext.destination);
    }
    else {
      this.output.connect(audioContext.destination);
    }
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
    let recordingstream = this._context.createMediaStreamDestination();
    this.mediaRecorder = new MediaRecorder(recordingstream.stream);
    this.output.connect(recordingstream);
    
    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.onstop = (e) => {
        consoleLog("data available after MediaRecorder.stop() called.");
        const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
        const audioURL = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = audioURL;
        a.download = 'Recording.ogg';
        a.innerText = "download";
        a.click();
      }
    
    this.mediaRecorder.start();
    this.play();
  }
  
  play() {
    if (this.isPlaying)
      return;
    this.isPlaying = true;
    
    this.tracks.forEach(track => track.sequencer.start(this._context.currentTime));
    this._timerWorker.postMessage("start");
    
    //this.tracks.forEach(track => track.startSequencer(this._context.currentTime + (10 * this.renderTime)));
    //this.isPlaying = true;
  }
  
  stop() {
    let time = this._context.currentTime;
    this.isPlaying = false;
    this._timerWorker.postMessage("stop");
    this.tracks.forEach(track => track.sequencer.stop());
    consoleLog(this.log.split("\n").sort().join("\n"));
    
    if (this._recording) {
      this.mediaRecorder.stop();
      
      consoleLog(this.mediaRecorder.state);
      consoleLog("recorder stopped");
      this._recording = false;
    }
  }
  
  increaseScheduleAheadTime() {
    this._scheduleAheadTime += 0.05;
  }
  
  lowerBpm() {
    MidiClock.tempo--;
    this.setFloatPropertyValue("Tempo", MidiClock.tempo);
    this._updateBpmText();
  }

  higherBpm() {
    MidiClock.tempo++;
    this.setFloatPropertyValue("Tempo", MidiClock.tempo);
    this._updateBpmText();
  }

  _updateBpmText() {
    document.querySelector(".bpm-text").innerHTML = MidiClock.tempo + " BPM";
    document.querySelector(".bpm-text").title = MidiClock.tempo + " BPM";
  }
  
  _scheduler() {
    this.tracks.forEach(track => {
      while (track.sequencer.nextStepTime <= this._context.currentTime + this._scheduleAheadTime) {
        track.sequencer.scheduleNextStep();
      }
    });
  }
  
 /* _scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    if ( (noteResolution==1) && (beatNumber%2))
        return; // we're not playing non-8th 16th notes
    if ( (noteResolution==2) && (beatNumber%4))
        return; // we're not playing non-quarter 8th notes

    // create an oscillator
    var osc = audioContext.createOscillator();
    osc.connect( audioContext.destination );
    if (beatNumber % 16 === 0)    // beat 0 == high pitch
        osc.frequency.value = 880.0;
    else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
        osc.frequency.value = 440.0;
    else                        // other 16th notes = low pitch
        osc.frequency.value = 220.0;

    osc.start( time );
    osc.stop( time + noteLength );
  }
  
  _nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / this.BPM;   // Notice this picks up the CURRENT 
                                            // tempo value to calculate beat length.
    this._nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
  }*/
}