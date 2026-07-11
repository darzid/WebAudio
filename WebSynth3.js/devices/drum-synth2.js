/**
 * DrumSynth
 * Oscillator-only 4-voice drum synth: Kick, Snare, ClosedHat, OpenHat.
 * No samples/buffers anywhere - snare "rattle" and hat "metal" are both
 * built from clusters of detuned square oscillators (same trick already
 * used in your hihat work), per Joe Sullivan's hi-hat synthesis technique.
 *
 * Triggering: listens to the same "PlayNote" document event your Synth
 * class uses (dispatched by BruteSequencer), filtered by track.id, then
 * routes by GM-style drum note name (matches your existing NOTE_FREQUENCIES
 * table and "notes" datalist, so no new note infrastructure is needed):
 *   C1 -> Kick, D1 -> Snare, F#1 -> ClosedHat, A#1 -> OpenHat
 *
 * Expected template structure (mirrors synth-template):
 * <div data-class="DrumSynth AudioDevice Device">
 *   <span class="DeviceTitle" data-template="toggle-title-template-h3"></span>
 *   <div class="ParameterGroup Kick">
 *     <input name="Pitch" type="range" data-template="knob-template" ...>
 *     <input name="Decay" type="range" data-template="knob-template" ...>
 *     <input name="Click" type="range" data-template="knob-template" ...>  <!-- Sound Design tab -->
 *   </div>
 *   <div class="ParameterGroup Snare">  Pitch, Decay, ToneMix
 *   <div class="ParameterGroup ClosedHat">  Pitch, Decay, Resonance
 *   <div class="ParameterGroup OpenHat">  Pitch, Decay, Resonance
 * (Pitch/Decay live on the main tab; Click/ToneMix/Resonance on the
 * Sound Design tab - tabs are just two sibling containers toggled by a
 * button, same display-toggle mechanism as your .collapser pattern.)
 */
class DrumSynth extends AudioDevice {

  static DRUM_NOTE_MAP = {
    "C1": "kick",
    "D1": "snare",
    "F#1": "closedHat",
    "A#1": "openHat"
  };

  // Detuned square-oscillator ratios used for both the hi-hat cluster and
  // the snare's noise-substitute rattle - same set you already tuned for
  // your 909-style hihat.
  static METAL_RATIOS = [263, 400, 421, 474, 587, 845];

  // exponentialRampToValueAtTime requires both its start value and its end
  // value to be > 0, and its endTime to be strictly after the previous
  // automation event. These guards prevent RangeError when a knob is
  // dragged to 0 (Decay) or a quiet hit/ToneMix produces a 0 start value.
  static MIN_DECAY = 0.02;
  static MIN_RAMP_START = 0.0001;

  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "DrumSynth", "DrumKit");

    this.registerPropertyInputElement("KickPitch", ".Kick input[name='Pitch']");
    this.registerPropertyInputElement("KickDecay", ".Kick input[name='Decay']");
    this.registerPropertyInputElement("KickClick", ".Kick input[name='Click']");

    this.registerPropertyInputElement("SnarePitch", ".Snare input[name='Pitch']");
    this.registerPropertyInputElement("SnareDecay", ".Snare input[name='Decay']");
    this.registerPropertyInputElement("SnareToneMix", ".Snare input[name='ToneMix']");

    this.registerPropertyInputElement("ClosedHatPitch", ".ClosedHat input[name='Pitch']");
    this.registerPropertyInputElement("ClosedHatDecay", ".ClosedHat input[name='Decay']");
    this.registerPropertyInputElement("ClosedHatResonance", ".ClosedHat input[name='Resonance']");

    this.registerPropertyInputElement("OpenHatPitch", ".OpenHat input[name='Pitch']");
    this.registerPropertyInputElement("OpenHatDecay", ".OpenHat input[name='Decay']");
    this.registerPropertyInputElement("OpenHatResonance", ".OpenHat input[name='Resonance']");

    this._openHatGain = null; // currently-ringing open hat, for choke

    document.addEventListener("PlayNote", (eventInfo) => {
      if (eventInfo.detail.track !== this.track.id) return;
      let voice = DrumSynth.DRUM_NOTE_MAP[eventInfo.detail.note];
      if (voice) this.playNote(voice, eventInfo);
    });
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }

  setupAudioGraph(audioContext) {
    super.setupAudioGraph(audioContext, new GainNode(audioContext, { channelCount: 2, channelCountMode: "max" }));
  }

  playNote(voice, eventInfo) {
    if (!this.getBoolPropertyValue("DeviceEnabled")) return;

    let time = eventInfo.detail.time;
    let velocity = eventInfo.detail.velocity / 127;

    this.audioApp.logAudioEvent(time, this.track.id, "DrumSynth", `Trigger ${voice}`);

    switch (voice) {
      case "kick": this._playKick(time, velocity); break;
      case "snare": this._playSnare(time, velocity); break;
      case "closedHat": this._playClosedHat(time, velocity); break;
      case "openHat": this._playOpenHat(time, velocity); break;
    }
  }

  // ---- Kick: pitch-swept sine + optional transient click ----
  _playKick(time, velocity) {
    let ctx = this._context;
    let pitch = this.getFloatPropertyValue("KickPitch");
    let decay = Math.max(this.getFloatPropertyValue("KickDecay"), DrumSynth.MIN_DECAY);
    let click = this.getFloatPropertyValue("KickClick");
    let startGain = Math.max(velocity, DrumSynth.MIN_RAMP_START);

    let connectedNodes = [];

    let osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch * 4, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(pitch, 1), time + decay * 0.3);

    let gain = ctx.createGain();
    gain.gain.setValueAtTime(startGain, time);
    gain.gain.exponentialRampToValueAtTime(DrumSynth.MIN_RAMP_START, time + decay);

    osc.connect(gain);
    gain.connect(this.output);
    connectedNodes.push(osc, gain);

    osc.start(time);
    osc.stop(time + decay + 0.05);
    osc.onended = () => connectedNodes.forEach(node => node.disconnect());

    if (click > 0) {
      let clickNodes = [];
      let clickOsc = ctx.createOscillator();
      clickOsc.type = "square";
      clickOsc.frequency.value = pitch * 8;

      let clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(Math.max(click * velocity, DrumSynth.MIN_RAMP_START), time);
      clickGain.gain.exponentialRampToValueAtTime(DrumSynth.MIN_RAMP_START, time + 0.02);

      clickOsc.connect(clickGain);
      clickGain.connect(this.output);
      clickNodes.push(clickOsc, clickGain);

      clickOsc.start(time);
      clickOsc.stop(time + 0.03);
      clickOsc.onended = () => clickNodes.forEach(node => node.disconnect());
    }
  }

  // ---- Snare: two detuned triangle "body" oscillators + square-cluster "rattle" ----
  _playSnare(time, velocity) {
    let ctx = this._context;
    let pitch = this.getFloatPropertyValue("SnarePitch");
    let decay = Math.max(this.getFloatPropertyValue("SnareDecay"), DrumSynth.MIN_DECAY);
    let toneMix = this.getFloatPropertyValue("SnareToneMix"); // 0 = all rattle, 1 = all body
    let bodyDecay = decay * 0.5;

    let bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(Math.max(velocity * toneMix, DrumSynth.MIN_RAMP_START), time);
    bodyGain.gain.exponentialRampToValueAtTime(DrumSynth.MIN_RAMP_START, time + bodyDecay);
    bodyGain.connect(this.output);

    let bodyOscillators = [pitch, pitch * 1.78].map(freq => {
      let osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.connect(bodyGain);
      osc.start(time);
      osc.stop(time + bodyDecay + 0.02);
      return osc;
    });
    bodyOscillators[bodyOscillators.length - 1].onended = () => {
      bodyOscillators.forEach(node => node.disconnect());
      bodyGain.disconnect();
    };

    let rattleGain = ctx.createGain();
    rattleGain.gain.setValueAtTime(Math.max(velocity * (1 - toneMix * 0.5), DrumSynth.MIN_RAMP_START), time);
    rattleGain.gain.exponentialRampToValueAtTime(DrumSynth.MIN_RAMP_START, time + decay);

    let highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 1000;
    highpass.connect(rattleGain);
    rattleGain.connect(this.output);

    let rattleOscillators = DrumSynth.METAL_RATIOS.map(ratio => {
      let osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = ratio * 1.4;
      osc.connect(highpass);
      osc.start(time);
      osc.stop(time + decay + 0.02);
      return osc;
    });
    rattleOscillators[rattleOscillators.length - 1].onended = () => {
      rattleOscillators.forEach(node => node.disconnect());
      highpass.disconnect();
      rattleGain.disconnect();
    };
  }

  // ---- Shared hi-hat cluster: 6 detuned squares -> bandpass -> 2x highpass ----
  _playHihatCluster(time, decay, resonance, velocity) {
    let ctx = this._context;
    decay = Math.max(decay, DrumSynth.MIN_DECAY);

    let bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 10000;
    bandpass.Q.value = resonance;

    let highpass1 = ctx.createBiquadFilter();
    highpass1.type = "highpass";
    highpass1.frequency.value = 7000;

    let highpass2 = ctx.createBiquadFilter();
    highpass2.type = "highpass";
    highpass2.frequency.value = 7000;

    let gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(velocity, DrumSynth.MIN_RAMP_START), time);
    gain.gain.exponentialRampToValueAtTime(DrumSynth.MIN_RAMP_START, time + decay);

    bandpass.connect(highpass1);
    highpass1.connect(highpass2);
    highpass2.connect(gain);
    gain.connect(this.output);

    let oscillators = DrumSynth.METAL_RATIOS.map(freq => {
      let osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      osc.connect(bandpass);
      osc.start(time);
      osc.stop(time + decay + 0.02);
      return osc;
    });
    oscillators[oscillators.length - 1].onended = () => {
      oscillators.forEach(node => node.disconnect());
      bandpass.disconnect();
      highpass1.disconnect();
      highpass2.disconnect();
      // gain is left connected briefly so the choke ramp (if any) still has
      // somewhere to land; disconnect it once its own envelope has settled.
      gain.disconnect();
    };

    return gain;
  }

  // Closed hat chokes (silences) any still-ringing open hat - real 909/hardware behavior.
  _chokeOpenHat(time) {
    if (!this._openHatGain) return;
    this._openHatGain.gain.cancelScheduledValues(time);
    this._openHatGain.gain.setValueAtTime(this._openHatGain.gain.value, time);
    this._openHatGain.gain.linearRampToValueAtTime(DrumSynth.MIN_RAMP_START, time + 0.005);
    this._openHatGain = null;
  }

  _playClosedHat(time, velocity) {
    this._chokeOpenHat(time);
    let decay = this.getFloatPropertyValue("ClosedHatDecay");
    let resonance = this.getFloatPropertyValue("ClosedHatResonance");
    this._playHihatCluster(time, decay, resonance, velocity);
  }

  _playOpenHat(time, velocity) {
    this._chokeOpenHat(time);
    let decay = this.getFloatPropertyValue("OpenHatDecay");
    let resonance = this.getFloatPropertyValue("OpenHatResonance");
    this._openHatGain = this._playHihatCluster(time, decay, resonance, velocity);
  }
}
