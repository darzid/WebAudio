

class ReverbModule extends DeviceModule  {
  _sizeProperty = "Size";
  _decaytimeProperty = "Decay";
  _dryWetProperty = "DryWet";

  constructor(device) {
    super(device, "Reverb");
    
    this.registerInputProperty(this._sizeProperty);
    this.registerInputProperty(this._decaytimeProperty);
    this.registerInputProperty(this._dryWetProperty);
    
    this.setPropertyValue("Enabled", false);
  }
  
  setupAudioGraph(audioContext, inputNode) {
  	super.setupAudioGraph(audioContext, inputNode);
  	
    let convolver = audioContext.createConvolver();
    this.updateBuffer(audioContext, convolver);
    
    this.subscribeToPropertyChange("Size", (e) => this.updateBuffer(audioContext, convolver));
    this.subscribeToPropertyChange("Decay", (e) => this.updateBuffer(audioContext, convolver));
  //  this.getPropertyInputElement(this._sizeProperty).oninput = () => this.updateBuffer(audioContext, convolver);
    //this.getPropertyInputElement(this._decaytimeProperty).oninput = () => this.updateBuffer(audioContext, convolver);
    
    this.input.connect(convolver);
    convolver.connect(this.wetOutput);
  }
  
  updateBuffer(audioContext, convolver) {
    convolver.buffer = this.createImpulseResponse(audioContext, this.getPropertyValue(this._sizeProperty), this.getPropertyValue(this._decaytimeProperty));
  }
  
  createImpulseResponse(audioContext, reverbSize, reverbDecayTime) {
    let reverbType = "log";
    let reverbDecayDirection = "forward";
    
    return ConvolutionGenerator.createImpulseResponse(
      audioContext, 
      reverbSize, 
      reverbType, 
      reverbDecayTime,
      reverbDecayDirection);
  }
}
