class DelayModule extends DeviceModule {
 _moduleClass = "Delay";
 
 constructor(device) {
  super(device, "Delay");
  
  super.registerInputProperty("StepsLeft");
  super.registerInputProperty("TimeLeft");
  super.registerInputProperty("StepsRight");
  super.registerInputProperty("TimeRight");
  super.registerInputProperty("Feedback");
  super.registerInputProperty("Drive");
  super.registerInputProperty("DryWet");

  this.subscribeToPropertyChange("StepsLeft", () => this.updateDelayTimes());
  this.subscribeToPropertyChange("StepsRight", () => this.updateDelayTimes());
  
  this.updateDelayTimes();
  
  this.setPropertyValue("Enabled", false);
  
  document.addEventListener("TempoChanged", (eventInfo) => {
   this.updateDelayTimes();
  });
 }
 
 get stepInterval() { return MidiClock.stepInterval; }
 
 updateDelayTimes() {
  this.setPropertyValue("TimeLeft", this.getPropertyValue("StepsLeft") * this.stepInterval);
  this.setPropertyValue("TimeRight", this.getPropertyValue("StepsRight") * this.stepInterval);
  consoleLog("updatedDelayTimes", this.getPropertyValue("TimeLeft"), this.getPropertyValue("TimeRight"));
 }
 
 setupAudioGraph(audioContext, inputNode) {
 	super.setupAudioGraph(audioContext, inputNode);
 	
  let moduleClass = this._moduleClass;
  
  let drive = audioContext.createWaveShaper();
  drive.curve = WaveshaperCurveGenerator.makeDriveCurve(this.getPropertyValue("Drive") * 5);
  this.subscribeToPropertyChange("Drive", () => drive.curve = WaveshaperCurveGenerator.makeDriveCurve(this.getPropertyValue("Drive") * 5));
  
  let driveGain = new GainNode(audioContext, { gain: 1 });
  
  let delayFeedbackNode = new GainNode(audioContext, { channelCount: 2 });
  this.connectFloatPropertyToAudioParam(delayFeedbackNode.gain, "Feedback");
  
  this.updateDelayTimes();
  let delayLeftNode = new DelayNode(audioContext, { maxDelayTime: 5 });
  this.connectFloatPropertyToAudioParam(delayLeftNode.delayTime, "TimeLeft", (value) => value / 1000);
  
  let delayRightNode = new DelayNode(audioContext, { maxDelayTime: 5 });
  this.connectFloatPropertyToAudioParam(delayRightNode.delayTime, "TimeRight", (value) => value / 1000);
  
  let mergerNode = audioContext.createChannelMerger(2);
  
  this.input.connect(drive);
  drive.connect(driveGain);
  driveGain.connect(delayLeftNode);
  driveGain.connect(delayRightNode);
  delayLeftNode.connect(mergerNode, 0, 0);
  delayRightNode.connect(mergerNode, 0, 1);
  mergerNode.connect(this.wetOutput);
 }
}