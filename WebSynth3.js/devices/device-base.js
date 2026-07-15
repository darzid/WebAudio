class Device extends ElementHandler {
  constructor(element, elementClass, handlerRegistry, deviceName, deviceType) {
    super(element, elementClass, handlerRegistry);
    consoleLog("Device constructor");
    this.name = deviceName;
    this.type = deviceType;
  }


  connectFloatPropertyToAudioParam(audioParam, propertyName, propertyConverter = null) {
    let inputElement = this.getPropertyInputElement(propertyName);
    let paramUpdater = () => {
      audioParam.value = propertyConverter ? propertyConverter(this.getFloatPropertyValue(propertyName)) : this.getFloatPropertyValue(propertyName);
      //consoleLog(`FloatProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
    }
    inputElement.oninput = () => paramUpdater();
    paramUpdater();
  }

  connectBoolPropertyToAudioParam(audioParam, propertyName, propertyConverter = null) {
    let inputElement = this.getPropertyInputElement(propertyName);
    if (!inputElement) {
      throw "Cannot find input element for " + this.elementClass + "." + + propertyName;
    }
    let paramUpdater = () => {
      audioParam.value = propertyConverter ? propertyConverter(this.getBoolPropertyValue(propertyName)) : this.getBoolPropertyValue(propertyName);
      //consoleLog(`BoolProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
    }
    inputElement.onchange = () => paramUpdater();
    paramUpdater();
  }
}

class MidiDevice extends Device {
  constructor(element, elementClass, handlerRegistry, deviceName, deviceType) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    consoleLog("MidiDevice constructor");
  }
}

class AudioDevice extends Device {
  constructor(element, elementClass, handlerRegistry, deviceName, deviceType) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    consoleLog("AudioDevice constructor");
    this._context = null;
    this._inputNode = null;
    this._dryOutputNode = null;
    this._wetOutputNode = null;
    this._outputNode = null;

    this.registerPropertyInputElement("DeviceEnabled", ".DeviceTitle input[name='Enabled']");
  }

  get id() { return this.element.id; }
  get input() { return this._inputNode; }
  get dryOutput() { return this._dryOutputNode; }
  get wetOutput() { return this._wetOutputNode; }
  get output() { return this._outputNode; }
  
  setupAudioGraph(audioContext) {
    this._context = audioContext;
    
    let hasDryWet = this.hasInputProperty(this._dryWetProperty);

    this._inputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    this._dryOutputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    this._wetOutputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    this._outputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    
    if (hasDryWet) {
      this.connectFloatPropertyToAudioParam(this.dryOutput.gain, this._dryWetProperty, (value) => 1 - value);
      this.connectFloatPropertyToAudioParam(this.wetOutput.gain, this._dryWetProperty);
    }
    else {
      this.dryOutput.gain.value = 0;
      this.wetOutput.gain.value = 1;
    }
    
    let enableDisableFunction = () => {
      console.log("enable disable " + this.id)
      if (this.getBoolPropertyValue("DeviceEnabled")) {
        this.wetOutput.connect(this.output);
        if (!hasDryWet) {
          this.dryOutput.gain.value = 0;
        }
      }
      else {
        this.wetOutput.disconnect(this.output);
        if (!hasDryWet) {
          this.dryOutput.gain.value = 1;
        }
      }
    }
    
    let enabledElement = this.getChildInputElement("DeviceEnabled");
    enabledElement.onchange = () => enableDisableFunction();
    
    this.input.connect(this.dryOutput);
    this.dryOutput.connect(this.output);
    enableDisableFunction();
    
    let inputMeter = this.element.querySelector("canvas[name='device-input-meter']");
    if (inputMeter) {
     // levelMeterManager.register(audioContext, this.input, inputMeter);
      consoleLog("Added inputmeter for " + this.name);
    }
    
    let outputMeter = this.element.querySelector("canvas[name='device-output-meter']");
    if (outputMeter) {
     // levelMeterManager.register(audioContext, this.output, outputMeter);
      consoleLog("Added outputmeter for " + this.name);
    }
  }
}
