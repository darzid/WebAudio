class Effector extends AudioDevice {
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "Effector", "AudioEffect");
    
    this._delayModule = new DelayModule(this);
    this._reverbModule = new ReverbModule(this);
    this._compressorModule = new CompressorModule(this);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
	get delay() { return this._delayModule; }
	get reverb() { return this._reverbModule; }
	get compressor() { return this._compressorModule; }
	
  setupAudioGraph(audioContext) {
    consoleLog("Effector.setupAudioGraph");
    super.setupAudioGraph(audioContext);
    
    this.delay.setupAudioGraph(audioContext, this.input);
    this.reverb.setupAudioGraph(audioContext, this.delay.output);
    this.compressor.setupAudioGraph(audioContext, this.reverb.output);
    this.compressor.output.connect(this.wetOutput);
  }
}



