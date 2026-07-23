import { Logger } from "../lib-ts/logger";
import { MidiClock } from "../lib-ts/web-audio/midi-clock";
import { PresetBrowser } from "../preset-browser";
import { AudioDevice } from "./base-devices/audio-device";
import { Track } from "./track";
// import * as Tone from "tone";

export class AudioApp extends AudioDevice {
  // #### SETTINGS ####
  private _useLimiter = false;

  private _showStatistics = true;

  private _lookahead = 25.0;        // How frequently to call scheduling function 
  //(in milliseconds)
  private _scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  // This is calculated from lookahead, and overlaps 
  // with next interval (in case the timer is late)

  private _timerWorker: Worker | null = null;      // The Web Worker used to fire timer messages


  // Recording related fields
  private _mediaRecorder: MediaRecorder | null = null;
  private _chunks: any[] | undefined;


  private _underrunEvents = 0;
  private _underrunIncreaseTime = null;
  private _monitor: Element | null = null;
  private _initialized: boolean;
  private _logStart: number;
  private _log: string;
  private _rendering: boolean;
  private _renderEndTime: null;
  private _recording: boolean = false;
  private _presetBrowser: PresetBrowser;
  stopTime: null;

  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "AudioApp");
    this._initialized = false;
    Logger.log("AudioApp constructor");

    this.registerPropertyInputElement("Tempo", "input[name='Tempo']");
    this.subscribeToPropertyChange("Tempo", () => {
      MidiClock.tempo = this.getPropertyValue("Tempo") as number;
      this.updateBpmText();
    });

    this.stopTime = null;
    this._renderEndTime = null;
    this._rendering = false;
    this._presetBrowser = new PresetBrowser(this);

    MidiClock.initialize(this.getPropertyValue("Tempo") as number);
    if (MidiClock.stepInterval != this.stepInterval) {
      throw `Seconds per step mismatch, tempo: ${this.getPropertyValue("Tempo")}, clock: ${MidiClock.stepInterval}, this: ${this.stepInterval}`;
    }
    this.updateBpmText();
    this.registerChildElementHandler("Tracks", "Track");

    this._log = "";
    this._logStart = 0;
    this._chunks = [];
    this.init();
  }

  get scheduleAheadTime() { return this._scheduleAheadTime; }
  get BPM() { return MidiClock.tempo; }
  get beatInterval() { return (60.0 / this.BPM) * 1000; }
  get measureInterval() { return this.beatInterval * 4; }
  get stepInterval() { return this.beatInterval / 4; }
  get microStepInterval() { return this.measureInterval / 128; }
  get renderTime() { return 0.05; }
  get tracks() { return this.findChildElementHandlers("Track") as Track[]; }
  get isPlaying() { return this.hasState("is-playing"); }
  set isPlaying(value) { this.setState("is-playing", value); }
  get rendering() { return this._rendering; }
  get renderEndTime() { return this._renderEndTime; }
  get isRendering() { return this.renderEndTime; }
  // get stopPlaying() { return this.isPlaying && this.stopTime && this.stopTime <= Tone.now(); }
  get volume() { return this.output!.volume.value; }
  set volume(value) { this.output!.volume.value = value; }

  setupAudioGraph() {
    
    // if (this._context) {
    //   this.output!.disconnect();
    // }
    super.setupAudioGraph();

    this.tracks.forEach(track => track.setupAudioGraph());

    if (this._useLimiter) {
      // let compressor = new Tone.Compressor(-30, 10);
      // compressor.knee.value = 40;
      // compressor.attack.value = 0.003;
      // compressor.release.value = 0.25;

      // this.output!.connect(compressor);
      // compressor.toDestination();
    }
    else {
      if (!this.output) {
        Logger.warn("No output om audioapp")
      }
      this.output!.toDestination();
    }
  }

  logMidiEvent(time: number, track: any, step: any, note: any) {
    this._log += `\r\n${time - this._logStart}\t${track}\tStep ${step}\tPlay note ${note}`;
  }

  logAudioEvent(time: any, track: any, device: any, message: any) {
    // Logger.log(`\r\n${time - this.logStart}\t${track}\t${device}\t${message}`);
    //this.log += `\r\n${time - this.logStart}\t${track}\t${device}\t${message}`;
  }

  async play() {
    if (!this._initialized) {
      await this.init();
    }

    if (this.isPlaying)
      return;
    this.isPlaying = true;

    this.tracks.forEach(track => track.sequencer.start(Tone.now() + this._scheduleAheadTime));
    this._timerWorker!.postMessage("start");

    //this.tracks.forEach(track => track.startSequencer(Tone.now() + (10 * this.renderTime)));
    //this.isPlaying = true;
    Logger.log("Started")
  }

  async record() {
    // this._recording = true;
    // this._chunks = [];
    // let recordingstream = (this._context! as AudioContext).createMediaStreamDestination();
    // this._mediaRecorder = new MediaRecorder(recordingstream.stream);
    // this.output!.connect(recordingstream);

    // this._mediaRecorder!.ondataavailable = (e: { data: any; }) => this._chunks!.push(e.data);
    // this._mediaRecorder!.onstop = (e: any) => {
    //   Logger.log("data available after MediaRecorder.stop() called.");
    //   const blob = new Blob(this._chunks, { type: "audio/ogg; codecs=opus" });
    //   const audioURL = window.URL.createObjectURL(blob);

    //   const a = document.createElement('a');
    //   a.href = audioURL;
    //   a.download = 'Recording.ogg';
    //   a.innerText = "download";
    //   a.click();
    // }

    // this._mediaRecorder!.start();
    // this.play();
  }

  async stop() {
    Logger.log("Stopping")
    // let time = Tone.now();
    this.isPlaying = false;
    this._timerWorker!.postMessage("stop");
    //this.tracks.forEach(track => track.sequencer.stop());
    Logger.log(this._log.split("\n").sort().join("\n"));

    if (this._recording) {
      this._mediaRecorder!.stop();

      Logger.log(this._mediaRecorder!.state);
      Logger.log("recorder stopped");
      this._recording = false;
    }
    Logger.log("stopped");
  }

  lowerBpm() {
    MidiClock.tempo--;
    this.setPropertyValue("Tempo", MidiClock.tempo);
    this.updateBpmText();
  }

  higherBpm() {
    MidiClock.tempo++;
    this.setPropertyValue("Tempo", MidiClock.tempo);
    this.updateBpmText();
  }

  private updateBpmText() {
    (document.querySelector(".bpm-text") as HTMLElement).innerHTML = MidiClock.tempo + " BPM";
    (document.querySelector(".bpm-text") as HTMLElement).title = MidiClock.tempo + " BPM";
  }

  public async init() {
    Logger.log("AudioApp.init(): Starting Tone")
    await Tone.start();

    this._monitor = document.querySelector(".monitor");
    this._timerWorker = new Worker("../../lib/web-audio/timer-worker.js");

    this._timerWorker!.onmessage = (e: { data: string; }) => {
      if (e.data == "tick") {
        this.scheduler();
      }
      else
        Logger.log("message: " + e.data);
    };
    Logger.log("AudioApp.init(): Starting timer worker")
    this._timerWorker!.postMessage({ "interval": this._lookahead });
  }

  private scheduler() {
    this.tracks.forEach(track => {
      let steps = 0;
      while (track.sequencer.nextStepTime <= Tone.now()  + this._scheduleAheadTime) {
         track.sequencer.scheduleNextStep();
         steps++;
      }
     // Logger.log("Scheduled steps " + steps, Tone.now());
    });
    this.monitorAudioContext();
  }

  private monitorAudioContext() {
    if (this._showStatistics == false)
      return;

    // let audioContext: AudioContext = this._context! as AudioContext;

    // if (audioContext.playbackStats.underrunEvents > this._underrunEvents)
    // {
    //   this._underrunEvents = audioContext.playbackStats.underrunEvents;
    //   this._underrunIncreaseTime = audioContext.currentTime;
    //   this._monitor.style.color = "red";
    // } else {
    //   if (this._underrunIncreaseTime && audioContext.currentTime - this._underrunIncreaseTime > 10) {
    //     this._monitor.style.color = "black";
    //     this._underrunIncreaseTime = null;
    //   }
    // }
    // let results = `BL=${audioContext.baseLatency},OL=${audioContext.outputLatency},AL=${audioContext.playbackStats.averageLatency},ML=${audioContext.playbackStats.maximumLatency},URD=${audioContext.playbackStats.underrunDuration},URE=${audioContext.playbackStats.underrunEvents}`;
    // this._monitor.innerHTML = results;
  }
}