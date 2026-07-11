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
/*  this._inputAnalyser = null;
  this._inputPcmData = null;
  this._outputAnalyser = null;
  this._outputPcmData = null;*/
 }
 /*
 get inputLevel() {
  if (!this._inputAnalyser) return 0;
  this._inputAnalyser.getFloatTimeDomainData(this._inputPcmData);
  let sumSquares = 0.0;
  for (const amplitude of this._inputPcmData) { sumSquares += amplitude * amplitude; }
  let value = Math.sqrt(sumSquares / this._inputPcmData.length) * 100;
  return value;
  
 }
  
  get outputLevel() {
   if (!this._outputAnalyser) return 0;
   this._outputAnalyser.getFloatTimeDomainData(this._outputPcmData);
   let sumSquares = 0.0;
   for (const amplitude of this._outputPcmData) { sumSquares += amplitude * amplitude; }
   let value = Math.sqrt(sumSquares / this._outputPcmData.length) * 100;
   return value;
  }
  */
 get Reduction() {
  if (!this._compressor) return 0;
  
  return this._compressor.reduction;
 }
 
 setupAudioGraph(audioContext, inputNode, outputNode) {
  let compressor = audioContext.createDynamicsCompressor();
  let makeupGain = audioContext.createGain();
  compressor.connect(makeupGain);
  this.connectFloatPropertyToAudioParam(compressor.threshold, "Threshold");
  this.connectFloatPropertyToAudioParam(compressor.ratio, "Ratio");
  this.connectFloatPropertyToAudioParam(compressor.knee, "Knee");
  this.connectFloatPropertyToAudioParam(compressor.attack, "Attack");
  this.connectFloatPropertyToAudioParam(compressor.release, "Release");
  this.connectFloatPropertyToAudioParam(makeupGain.gain, "Makeup");
  
  
  controlAutoUpdater.addAutoUpdateMeter(this, "Reduction", this.element.querySelector("canvas[name='reduction-meter']"));
  
  this._compressor = compressor;
  super.setupAudioGraph(audioContext, inputNode, outputNode, compressor, makeupGain);
 }
}