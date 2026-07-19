class KickModule extends DeviceModule {
  _moduleClass = "Kick";
  waveshaper;
  bodyEnv;
  clickEnv;
  
  constructor(device) {
    super(device, "Kick");
    
    this.registerInputProperty("Decay");
    this.registerInputProperty("Tone");
    this.registerInputProperty("Click");
    this.registerInputProperty("Drive");
    this.registerInputProperty("Volume");
    
    this.setPropertyValue("Enabled", true);
  }
  
  setupAudioGraph(audioContext, inputNode) {
    super.setupAudioGraph(audioContext, inputNode);
    
    this.waveshaper = this._context.createWaveShaper();
    this.generateWaveshaperCurve();
    this.subscribeToPropertyChange("Drive", (e) => this.generateWaveshaperCurve(e.value));
  
    /*this.getPropertyInputElement("Drive").oninput =
      () => this.generateWaveshaperCurve();*/

    this.bodyEnv = this._context.createGain();

    this.waveshaper.connect(this.bodyEnv);
    this.bodyEnv.connect(this.wetOutput);

    this.clickEnv = this._context.createGain();
    this.clickEnv.connect(this.wetOutput);
  }
  
  generateWaveshaperCurve(drive) {
    this.waveshaper.curve = WaveshaperCurveGenerator.makeDriveCurve(drive);
  }
  
  play(startTime, velocity) {
    console.log(`Play kick on ${startTime} at ${velocity}`);
    let startFreq = this.getPropertyValue("Tone");
    // Body: sine oscillator dropping pitch fast, like a real kick shell.
    let endFreq = Math.max(startFreq * 0.18, 30);
    
    let bodyOsc = this._context.createOscillator();
    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(startFreq, startTime);
    bodyOsc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.05);
    bodyOsc.connect(this.waveshaper);
    
    let volume = this.getPropertyValue("Volume") * velocity;
    let decay = this.getPropertyValue("Decay");
    this.bodyEnv.gain.setValueAtTime(volume, startTime);
    this.bodyEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
    
    bodyOsc.start(startTime);
    bodyOsc.stop(startTime + decay + 0.05);
    
    let clickLevel = this.getPropertyValue("Click");
    //if (clickLevel > 0) {
      this.clickEnv.gain.setValueAtTime(volume * clickLevel, startTime);
      this.clickEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.012);
    
      // Click: brief high oscillator burst standing in for the beater attack
      // a pure pitch-dropped sine can't otherwise produce.
      let clickOsc = this._context.createOscillator();
      clickOsc.type = "square";
      clickOsc.connect(this.clickEnv);
      
      clickOsc.start(startTime);
      clickOsc.stop(startTime + 0.02);
   // }
  }
}