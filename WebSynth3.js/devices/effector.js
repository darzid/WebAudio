class Effector extends AudioDevice {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "Effector", "AudioEffect");
    
    this._distortionModule = new DistortionModule(this);
    this._delayModule = new DelayModule(this);
    this._reverbModule = new ReverbModule(this);
    this._compressorModule = new CompressorModule(this);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get distortion() { return this._distortionModule; }
	get delay() { return this._delayModule; }
	get reverb() { return this._reverbModule; }
	get compressor() { return this._compressorModule; }
	
  setupAudioGraph(audioContext) {
    consoleLog("Effector.setupAudioGraph");
    super.setupAudioGraph(audioContext);
    
    this.distortion.setupAudioGraph(audioContext, this.input);
    this.delay.setupAudioGraph(audioContext, this.distortion.output);
    this.reverb.setupAudioGraph(audioContext, this.delay.output);
    this.compressor.setupAudioGraph(audioContext, this.reverb.output);
    this.compressor.output.connect(this.wetOutput);
  }
}



