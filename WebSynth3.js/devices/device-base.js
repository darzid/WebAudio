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
    this._node = null;
    this._outputNode = null;
    this._output = null;

    this.registerPropertyInputElement("DeviceEnabled", ".DeviceTitle input[name='Enabled']");
  }


  setupAudioGraph(audioContext, audioNode) {

    this._context = audioContext;
    this._node = audioNode;
    this._outputNode = audioContext.createGain();
    this._outputNode.channelCount = 2;
    this._outputNode.channelCountMode = "max";

    this._output = audioContext.createGain();

    this._node.connect(this._outputNode);
    //let outputDryGain = audioContext.createGain();
    let outputGain = audioContext.createGain();
    //this._outputNode.connect(outputDryGain);
    this._outputNode.connect(outputGain);
    //outputDryGain.connect(this._output);
    outputGain.connect(this._output);
    this.connectBoolPropertyToAudioParam(outputGain.gain, "DeviceEnabled", boolToInt);

    let outputMeter = this.element.querySelector("canvas[name='device-output-meter']");
    if (outputMeter) {
      levelMeterManager.register(audioContext, this.output, outputMeter);
      consoleLog("Added outputmeter for " + this.name);
    }
  }

  get id() { return this.element.id; }
  get output() { return this._output; }
}

class AudioEffectDevice extends AudioDevice {
  constructor(element, elementClass, handlerRegistry, deviceName, deviceType) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    this._inputNode = null;
  }

  get input() { return this._inputNode; }

  setupAudioGraph(audioContext, audioNode) {
    super.setupAudioGraph(audioContext, audioNode);

    let hasDryWet = this.hasInputProperty(this._dryWetProperty);

    this._inputNode = audioContext.createGain({ channelCount: 2, channelCountMode: "max" });
    this._inputNode.connect(audioNode);
    
    //this._node.disconnect(this._outputNode);
    
    if (hasDryWet) {
      let outputDryGain = audioContext.createGain();
      this._outputNode.connect(outputDryGain);
      outputDryGain.connect(this._output);
      this.connectBoolPropertyToAudioParam(outputDryGain.gain, "DeviceEnabled", inverseBoolToInt);
    }

    let outputWetGain = audioContext.createGain();
    outputWetGain.gain.value = 1;
    this._outputNode.connect(outputWetGain);
    outputWetGain.connect(this._output);
    this.connectBoolPropertyToAudioParam(outputWetGain.gain, "DeviceEnabled", inverseBoolToInt);

    let outputGain = audioContext.createGain();
    //this._outputNode.connect(outputDryGain);
    this._outputNode.connect(outputGain);
    //outputDryGain.connect(this._output);
    outputGain.connect(this._output);
    this.connectBoolPropertyToAudioParam(outputGain.gain, "DeviceEnabled", boolToInt);
    
    let inputMeter = this.element.querySelector("canvas[name='device-input-meter']");
    if (inputMeter) {
      levelMeterManager.register(audioContext, this.input, inputMeter);
      consoleLog("Added inputmeter for " + this.name);
    }
  }
}