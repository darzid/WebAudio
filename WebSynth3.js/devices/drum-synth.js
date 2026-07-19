// Detuned square-wave clusters fake the inharmonic "noise" of metallic
// percussion the way analog drum machines did before sample playback.
// Approximation of the TR-909's six-oscillator hihat cluster — not exact
// schematic values (never officially published), but a known-good ratio
// set used widely in 909 emulations. Tune by ear from here if you want a
// different character.
const HIHAT_FREQS = [263, 400, 421, 474, 587, 845];
const SNARE_BUZZ_RATIOS = [1.10, 1.14, 1.15, 1.17, 1.19];

class DrumSynth extends AudioDevice {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "DrumSynth", "Instrument");
    consoleLog("Create DrumSynth for element", element);

    
    
    ["ClosedHihat", "OpenHihat", "Snare"].forEach(voice => {
      this.registerPropertyInputElement(`${voice}Enabled`, `.${voice} input[name='Enabled']`);
      this.registerPropertyInputElement(`${voice}Decay`, `.${voice} input[name='Decay']`);
      this.registerPropertyInputElement(`${voice}Tone`, `.${voice} input[name='Tone']`);
      this.registerPropertyInputElement(`${voice}Volume`, `.${voice} input[name='Volume']`);
    });

    ["ClosedHihat", "OpenHihat"].forEach(voice => {
      this.registerPropertyInputElement(`${voice}Q`, `.${voice} input[name='Q']`);
    });

    this.registerPropertyInputElement(`KickEnabled`, `.Kick input[name='Enabled']`);
    this.registerPropertyInputElement("KickTone", ".Kick input[name='Tone']");
    this.registerPropertyInputElement("KickDecay", ".Kick input[name='Decay']");
    this.registerPropertyInputElement("KickClick", ".Kick input[name='Click']");
    this.registerPropertyInputElement("KickDrive", ".Kick input[name='Drive']");
    this.registerPropertyInputElement("KickVolume", ".Kick input[name='Volume']");

    // Map sequencer note names to voices. Adjust freely — these just need
    // to match entries in the #notes datalist used by the step's Note knob.
    this._noteVoiceMap = { "C0": "Kick", "C1": "ClosedHihat", "D1": "OpenHihat", "E1": "Snare" };

    this._kickModule = new KickModule(this);
    this._openHihatGain = null;
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));

    document.addEventListener("PlayNote", (eventInfo) => {
      if (eventInfo.detail.track == this.track.id) this.playNote(eventInfo);
    });
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }

  setupAudioGraph(audioContext) {
    super.setupAudioGraph(audioContext);
    this._kickModule.setupAudioGraph(audioContext, this.input);
    this._kickModule.output.connect(this.wetOutput);
  }

  playNote(eventInfo) {
    if (!this.getPropertyValue("DeviceEnabled")) return;

    let voice = this._noteVoiceMap[eventInfo.detail.note];
    if (!voice) return;

    if (!this.getPropertyValue(voice + "Enabled"))
      return;
      
    let startTime = eventInfo.detail.time;
    let velocityGain = eventInfo.detail.velocity / 127;

    if (voice == "Kick") {
      this._kickModule.play(startTime, velocityGain);
    } else if (voice == "Snare") {
      this.playSnare(startTime, velocityGain);
    } else {
      this.playHihat(startTime, velocityGain, voice, voice == "OpenHihat");
    }
  }

  playHihat(startTime, velocityGain, voiceName, isOpen) {
    let decay = this.getPropertyValue(`${voiceName}Decay`);
    let toneFreq = this.getPropertyValue(`${voiceName}Tone`);
    let q = this.getPropertyValue(`${voiceName}Q`);
    let volume = this.getPropertyValue(`${voiceName}Volume`) * velocityGain;

    let chokeGain = null;
    
    // Closed hat chokes a still-ringing open hat, like a real hihat stack.
    if (!isOpen && this._openHihatGain) {
      chokeGain = this._openHihatGain;
      chokeGain.gain.cancelScheduledValues(startTime);
      chokeGain.gain.setValueAtTime(chokeGain.gain.value, startTime);
      chokeGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);
    }

    // Bandpass carves out the metallic "ring"; the cascaded highpasses
    // (12dB/oct each, 24dB/oct combined) strip the buzzy square-wave
    // fundamental that a single filter stage lets through.
    let mix = this._context.createGain();

    let bandpass = this._context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = toneFreq;
    bandpass.Q.value = q;

    let highpass1 = this._context.createBiquadFilter();
    highpass1.type = "highpass";
    highpass1.frequency.value = toneFreq * 0.6;

    let highpass2 = this._context.createBiquadFilter();
    highpass2.type = "highpass";
    highpass2.frequency.value = toneFreq * 0.6;

    mix.connect(bandpass);
    bandpass.connect(highpass1);
    highpass1.connect(highpass2);

    let env = this._context.createGain();
    env.gain.value = 0;
    highpass2.connect(env);
    env.connect(this.wetOutput);

    let hihatCount = HIHAT_FREQS.length;
    HIHAT_FREQS.forEach(freq => {
      let osc = this._context.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      osc.connect(mix);
      osc.onended = () => {
        osc.disconnect();
        hihatCount--;
        if (hihatCount == 0) {
          bandpass.disconnect();
          highpass1.disconnect();
          highpass2.disconnect();
          env.disconnect();
          mix.disconnect();
        }
      }
      osc.start(startTime);
      osc.stop(startTime + decay + 0.05);
    });

    // Two-stage decay: instant snap down to ~30% level, then a slower
    // tail to silence — closer to the 909's transient than one smooth ramp.
    env.gain.setValueAtTime(volume, startTime);
    env.gain.exponentialRampToValueAtTime(Math.max(volume * 0.3, 0.0001), startTime + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

    if (isOpen) this._openHihatGain = env;
  }

  playSnare(startTime, velocityGain) {
    let decay = this.getPropertyValue("SnareDecay");
    let toneFreq = this.getPropertyValue("SnareTone");
    let volume = this.getPropertyValue("SnareVolume") * velocityGain;

    // Body: short pitched thump, like a tuned drum shell.
    let bodyOsc = this._context.createOscillator();
    bodyOsc.type = "triangle";
    bodyOsc.frequency.setValueAtTime(toneFreq, startTime);
    bodyOsc.frequency.exponentialRampToValueAtTime(toneFreq * 0.45, startTime + 0.1);

    let bodyEnv = this._context.createGain();
    bodyEnv.gain.setValueAtTime(volume * 0.7, startTime);
    bodyEnv.gain.exponentialRampToValueAtTime(0.001, startTime + decay * 0.6);
    bodyOsc.connect(bodyEnv).connect(this.wetOutput);
    
    bodyOsc.onended = () => {
      bodyOsc.disconnect();
      bodyEnv.disconnect();
      bodyOsc = null;
      bodyEnv = null;
    }
    bodyOsc.start(startTime);
    bodyOsc.stop(startTime + decay + 0.1);

    // Buzz: detuned cluster through a bandpass, for the snare's rattle.
    let buzzFilter = this._context.createBiquadFilter();
    buzzFilter.type = "bandpass";
    buzzFilter.frequency.value = toneFreq * 11;
    buzzFilter.Q.value = 1;

    let buzzEnv = this._context.createGain();
    buzzEnv.gain.setValueAtTime(volume * 0.8, startTime);
    buzzEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
    buzzFilter.connect(buzzEnv).connect(this.wetOutput);

    let snareCount = SNARE_BUZZ_RATIOS.length;
    
    SNARE_BUZZ_RATIOS.forEach(ratio => {
      let osc = this._context.createOscillator();
      osc.type = "square";
      osc.frequency.value = toneFreq * ratio;
      osc.connect(buzzFilter);
      osc.onended = () => {
        snareCount--;
        
        osc.disconnect();
        
        if (snareCount == 0) {
          buzzEnv.disconnect();
          buzzFilter.disconnect();
          
          buzzEnv = null;
          buzzFilter = null;
        }
        
        osc = null;
      }
      osc.start(startTime);
      osc.stop(startTime + decay + 0.1);
    });
  }
/*
  playKick(startTime, velocityGain) {
    let startFreq = this.getPropertyValue("KickTone");
    let decay = this.getPropertyValue("KickDecay");
    let clickLevel = this.getPropertyValue("KickClick");
    let driveAmount = this.getPropertyValue("KickDrive");
    let volume = this.getPropertyValue("KickVolume") * velocityGain;

    // Body: sine oscillator dropping pitch fast, like a real kick shell.
    let endFreq = Math.max(startFreq * 0.18, 30);

    let bodyOsc = this._context.createOscillator();
    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(startFreq, startTime);
    bodyOsc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.05);

    let drive = this._context.createWaveShaper();
    drive.curve = WaveshaperCurveGenerator.makeDriveCurve(driveAmount * 5);

    let bodyEnv = this._context.createGain();
    bodyEnv.gain.setValueAtTime(volume, startTime);
    bodyEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

    bodyOsc.connect(drive);
    drive.connect(bodyEnv);
    bodyEnv.connect(this.wetOutput);

    bodyOsc.onended = () => {
      bodyOsc.disconnect();
      drive.disconnect();
      bodyEnv.disconnect();
      
      bodyOsc = null;
      drive = null;
      bodyEnv = null;
    }
    
    bodyOsc.start(startTime);
    bodyOsc.stop(startTime + decay + 0.05);

    // Click: brief high oscillator burst standing in for the beater attack
    // a pure pitch-dropped sine can't otherwise produce.
    if (clickLevel > 0) {
      let clickOsc = this._context.createOscillator();
      clickOsc.type = "square";
      clickOsc.frequency.value = startFreq * 8;

      let clickEnv = this._context.createGain();
      clickEnv.gain.setValueAtTime(volume * clickLevel, startTime);
      clickEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.012);

      clickOsc.connect(clickEnv).connect(this.wetOutput);
      
      clickOsc.onended = () => {
        clickOsc.disconnect();
        clickEnv.disconnect();
        
        clickOsc = null;
        clickEnv = null;
      }
      clickOsc.start(startTime);
      clickOsc.stop(startTime + 0.02);
    }
  } 
  */
}