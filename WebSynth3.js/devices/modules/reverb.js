

class ReverbModule extends DeviceModule  {
  _sizeProperty = "Size";
  _decaytimeProperty = "Decay";
  _dryWetProperty = "DryWet";

  constructor(device) {
    super(device, "Reverb");
    
    this.registerInputProperty(this._sizeProperty);
    this.registerInputProperty(this._decaytimeProperty);
    this.registerInputProperty(this._dryWetProperty);
  }
  
  setupAudioGraph(audioContext, inputNode, outputNode) {
    let convolver = audioContext.createConvolver();
    this.updateBuffer(audioContext, convolver);
    
    this.getPropertyInputElement(this._sizeProperty).oninput = () => this.updateBuffer(audioContext, convolver);
    this.getPropertyInputElement(this._decaytimeProperty).oninput = () => this.updateBuffer(audioContext, convolver);
    
    super.setupAudioGraph(audioContext, inputNode, outputNode, convolver);
  }
  
  updateBuffer(audioContext, convolver) {
    convolver.buffer = this.createImpulseResponse(audioContext, this.getFloatPropertyValue(this._sizeProperty), this.getFloatPropertyValue(this._decaytimeProperty));
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
