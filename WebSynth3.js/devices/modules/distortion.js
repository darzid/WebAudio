class DistortionModule extends DeviceModule {
 _moduleClass = "Distortion";
 preGain;
 waveshaper;
 postGain;
 
 constructor(device) {
  super(device, "Distortion");
  
  super.registerInputProperty("Pre");
  super.registerInputProperty("Amount");
  super.registerInputProperty("Post");
  super.registerInputProperty("DryWet");
  
  this.setPropertyValue("Enabled", false);
 }
 
 setupAudioGraph(audioContext, inputNode) {
 	super.setupAudioGraph(audioContext, inputNode);
 	
 	this.preGain = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
 	this.connectFloatPropertyToAudioParam(this.preGain.gain, "Pre");
 	
  this.waveshaper = audioContext.createWaveShaper();
  this.generateWaveshaperCurve();
  this.subscribeToPropertyChange("Amount", () => this.generateWaveshaperCurve());
  
  this.postGain = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
  this.connectFloatPropertyToAudioParam(this.postGain.gain, "Post");
  
  this.input.connect(this.preGain);
  this.preGain.connect(this.waveshaper);
  this.waveshaper.connect(this.postGain);
  this.postGain.connect(this.wetOutput);
 }
 
 generateWaveshaperCurve() {
  this.waveshaper.curve = WaveshaperCurveGenerator.makeDriveCurve(this.getPropertyValue("Amount"));
 }
}