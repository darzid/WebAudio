class Effector extends AudioEffectDevice {
  _reverbModule = null;
  constructor(element, elementClass, handlerRegistry) {
    super(element, elementClass, handlerRegistry, "Effector", "AudioEffect");
    // consoleLog("Create Synth for element", element);
    
    this._reverbModule = new ReverbModule(this);
    this._delayModule = new DelayModule(this);
    this._compressorModule = new CompressorModule(this);
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }

  setupAudioGraph(audioContext) {
    // consoleLog("Effector.setupAudioGraph");
    super.setupAudioGraph(audioContext, new GainNode(audioContext, { gain: 1.0, channelCount: 2 }));
    
    this._reverbModule.setupAudioGraph(audioContext, this._inputNode, this._node);
    this._delayModule.setupAudioGraph(audioContext, this._inputNode, this._node);
    this._compressorModule.setupAudioGraph(audioContext, this._inputNode, this._node);
  }
}



