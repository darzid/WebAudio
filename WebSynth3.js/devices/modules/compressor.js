class CompressorModule extends DeviceModule {
 constructor(device) {
  super(device, "Compressor");
  
  super.registerInputProperty("Threshold");
  super.registerInputProperty("Ratio");
  super.registerInputProperty("Knee");
  super.registerInputProperty("Attack");
  super.registerInputProperty("Release");
  super.registerInputProperty("Makeup");
  
  this._compressor = null;
  
  this.setBoolPropertyValue("Enabled", false);
 }
 
 get Reduction() {
  if (!this._compressor) return 0;
  
  return this._compressor.reduction;
 }
 
 setupAudioGraph(audioContext, inputNode) {
 	super.setupAudioGraph(audioContext, inputNode);
 	
  let compressor = audioContext.createDynamicsCompressor();
  let makeupGain = audioContext.createGain();
  compressor.connect(makeupGain);
  this.connectFloatPropertyToAudioParam(compressor.threshold, "Threshold");
  this.connectFloatPropertyToAudioParam(compressor.ratio, "Ratio");
  this.connectFloatPropertyToAudioParam(compressor.knee, "Knee");
  this.connectFloatPropertyToAudioParam(compressor.attack, "Attack");
  this.connectFloatPropertyToAudioParam(compressor.release, "Release");
  this.connectFloatPropertyToAudioParam(makeupGain.gain, "Makeup");
  
  this.input.connect(compressor);
  compressor.connect(this.wetOutput);
  controlAutoUpdater.addAutoUpdateMeter(this, "Reduction", this.element.querySelector("canvas[name='reduction-meter']"));
  
  this._compressor = compressor;
 }
}