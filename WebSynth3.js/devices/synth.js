class Synth extends AudioDevice {
  
  
  fm1Lfo;
  fm1LfoGain;
  fm2Lfo;
  fm2LfoGain;
 constructor(element, elementClass, handlerRegistry) {
  super(element, elementClass, handlerRegistry, "Synth", "Instrument");
  
  consoleLog("Create Synth for element", element);
  this.registerPropertyInputElement("Enabled", ".SynthTitle input[name='Enabled']");
  
  this.registerPropertyInputElement("Osc1Enabled", ".Osc1 input[name='Enabled']");
  this.registerPropertyInputElement("Osc1Type", ".Osc1 input[name='Type']");
  this.registerPropertyInputElement("Osc1Octave", ".Osc1 input[name='Octave']");
  this.registerPropertyInputElement("Osc1Detune", ".Osc1 input[name='Detune']");
  this.registerPropertyInputElement("Osc1Volume", ".Osc1 input[name='Volume']");
  
  this.registerPropertyInputElement("Osc2Enabled", ".Osc2 input[name='Enabled']");
  this.registerPropertyInputElement("Osc2Type", ".Osc2 input[name='Type']");
  this.registerPropertyInputElement("Osc2Octave", ".Osc2 input[name='Octave']");
  this.registerPropertyInputElement("Osc2Detune", ".Osc2 input[name='Detune']");
  this.registerPropertyInputElement("Osc2Volume", ".Osc2 input[name='Volume']");
  
  this._filter1Module = new Filter(this, "Filter1");
  this._filter2Module = new Filter(this, "Filter2");
  
  this.registerPropertyInputElement("AmpEnvEnabled", ".AmpEnv input[name='Enabled']");
  this.registerPropertyInputElement("Attack", ".AmpEnv input[name='Attack']");
  this.registerPropertyInputElement("Decay", ".AmpEnv input[name='Decay']");
  this.registerPropertyInputElement("Sustain", ".AmpEnv input[name='Sustain']");
  this.registerPropertyInputElement("Release", ".AmpEnv input[name='Release']");
  this.registerPropertyInputElement("Volume", ".AmpEnv input[name='Volume']");
  
  toggleNextSiblingVisibility(element.querySelector(".DeviceTitle"));
  
  document.addEventListener("PlayNote", (eventInfo) => { 
    if (eventInfo.detail.track == this.track.id) this.playNote(eventInfo); 
  });
 }
 
 get audioApp() { return this.getParentElementHandler("AudioApp"); }
 get track() { return this.getParentElementHandler("Track"); }
 
 get osc1Type() { return this.getPropertyInputElement("Osc1Type").dataset.optionValue; }
 get osc2Type() { return this.getPropertyInputElement("Osc2Type").dataset.optionValue; }
 
 setupAudioGraph(audioContext) {
   super.setupAudioGraph(audioContext, audioContext.createGain({ channelCount: 2, channelCountMode: "max" }));
   
   /* FM 
   this.fm1Lfo = this._context.createOscillator({frequency: this.getFloatPropertyValue("Osc1FmRate")});
   this.fm1LfoGain = this._context.createGain({gain: this.getFloatPropertyValue("Osc1FmAmount")});
   this.fm1Lfo.connect(this.fm1LfoGain.gain);
   
   this.fm2Lfo = this._context.createOscillator({frequency: this.getFloatPropertyValue("Osc2FmRate")});
   this.fm2LfoGain = this._context.createGain({gain: this.getFloatPropertyValue("Osc2FmAmount")});
   this.fm2Lfo.connect(this.fm2LfoGain.gain);
   */
 }
  
 playNote(eventInfo) {
  if (!this.getBoolPropertyValue("Enabled"))
    return;
      
  //consoleLog("PlayNote", eventInfo);
  
  let startTime = eventInfo.detail.time;
  let duration = (eventInfo.detail.stepDuration / 500) * (eventInfo.detail.gate / 127);
  
  let frequency = NOTE_FREQUENCIES[eventInfo.detail.note];
  
  let connectedNodes = [];
  
  let osc1gain = this._context.createGain();
  let osc2gain = this._context.createGain();
  let oscsGain = this._context.createGain();
  osc1gain.connect(oscsGain);
  osc2gain.connect(oscsGain);
  
  connectedNodes.push(osc1gain);
  connectedNodes.push(osc2gain);
  
  let ampEnvGain = this._context.createGain();
  
  this.connectBoolPropertyToAudioParam(ampEnvGain.gain, "Enabled");
  
  let holdVolume = this.getFloatPropertyValue("Volume") * (eventInfo.detail.velocity / 127);
  let attackEndTime = eventInfo.detail.time + this.getFloatPropertyValue("Attack");
  let decayEndTime = attackEndTime + this.getFloatPropertyValue("Decay");
  let gateEndTime = startTime + duration;
  let releaseEndTime = gateEndTime + this.getFloatPropertyValue("Release");
  
  if (this.getBoolPropertyValue("Osc1Enabled")) {
   let oscillator1 = this._context.createOscillator();
   oscillator1.frequency.value = frequency;
   oscillator1.type = this.osc1Type;
   
   this._updateDetune(oscillator1, "Osc1");
   this.getPropertyInputElement("Osc1Octave").oninput = () => this._updateDetune(oscillator1, "Osc1");
   this.getPropertyInputElement("Osc1Detune").oninput = () => this._updateDetune(oscillator1, "Osc1");
   
   /*
   let fm1Rate = this.getFloatPropertyValue("Osc1FmRate");
   let fm1Amount = this.getFloatPropertyValue("Osc1FmAmount");
    if (fm1Amount > 0) {
     this.fm1LfoGain.connect(oscillator1.frequency);
     connectedNodes.push(this.fm1LfoGain);
     
     this.fm1Lfo.start();
    
     this.getPropertyInputElement("Osc1FmRate").oninput = () => fm1Lfo.frequency.value = this.getFloatPropertyValue("Osc1FmRate");
     this.getPropertyInputElement("Osc1FmAmount").oninput = () => fm1LfoGain.gain.value = this.getFloatPropertyValue("Osc1FmAmount");
    }
    */
   this.connectFloatPropertyToAudioParam(osc1gain.gain, "Osc1Volume");
   
   oscillator1.connect(osc1gain);
   connectedNodes.push(oscillator1);
   
   oscillator1.onended = () => {
    connectedNodes.forEach(node => {
      node.disconnect();
      connectedNodes.splice(connectedNodes.indexOf(node), 1);
     });
   }
   
   this.audioApp.logAudioEvent(startTime, this.track.id, "Synth", "Start oscillator1");
   oscillator1.start(startTime);
   oscillator1.stop(releaseEndTime);
   this.audioApp.logAudioEvent(releaseEndTime, this.track.id, "Synth", "Stop oscillator1");
  }
  
  if (this.getBoolPropertyValue("Osc2Enabled")) {
   let oscillator2 = this._context.createOscillator();
   oscillator2.frequency.value = frequency;
   oscillator2.type = this.osc2Type;
   
   this._updateDetune(oscillator2, "Osc2");
   this.getPropertyInputElement("Osc2Octave").oninput = () => this._updateDetune(oscillator2, "Osc2");
   this.getPropertyInputElement("Osc2Detune").oninput = () => this._updateDetune(oscillator2, "Osc2");
   
   this.connectFloatPropertyToAudioParam(osc2gain.gain, "Osc2Volume");
   oscillator2.connect(osc2gain);
   connectedNodes.push(oscillator2);
   
   oscillator2.onended = () => {
    connectedNodes.forEach(node => {
     node.disconnect();
     connectedNodes.splice(connectedNodes.indexOf(node), 1);
    });
   }
   
   this.audioApp.logAudioEvent(startTime, this.track.id, "Synth", "Start oscillator2");
   oscillator2.start(startTime);
   oscillator2.stop(releaseEndTime);
   this.audioApp.logAudioEvent(releaseEndTime, this.track.id, "Synth", "Stop oscillator2");
  }
  
  this._filter1Module.setupAudioGraph(this._context, oscsGain, ampEnvGain, startTime, duration, eventInfo.detail.pressure, connectedNodes);
  this._filter2Module.setupAudioGraph(this._context, oscsGain, ampEnvGain, startTime, duration, eventInfo.detail.pressure, connectedNodes);
  
  if (this.getBoolPropertyValue("AmpEnvEnabled")){
   if (this.getFloatPropertyValue("Attack") > 0) {
    ampEnvGain.gain.setValueAtTime(0, eventInfo.detail.time);
    ampEnvGain.gain.linearRampToValueAtTime(holdVolume, attackEndTime);
   }
   else
    ampEnvGain.gain.value = holdVolume;
   
   ampEnvGain.gain.linearRampToValueAtTime(this.getFloatPropertyValue("Sustain") * holdVolume, decayEndTime);
   if (this.release) {
    ampEnvGain.gain.linearRampToValueAtTime(this.getFloatPropertyValue("Sustain") * holdVolume, gateEndTime);
    ampEnvGain.gain.linearRampToValueAtTime(0, releaseEndTime);
   }
  }
  ampEnvGain.connect(this.output);
  connectedNodes.push(ampEnvGain);
 }
 
 _updateDetune(oscillator, oscillatorId) {
  oscillator.detune.value = (this.getFloatPropertyValue(oscillatorId + "Octave") * 1200) + this.getFloatPropertyValue(oscillatorId + "Detune");
 }
}