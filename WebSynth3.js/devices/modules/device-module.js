class DeviceModule {
  _enabledProperty = "Enabled";
  _dryWetProperty = "DryWet";

  constructor(device, moduleClass) {
    this.device = device;
    this.moduleClass = moduleClass;
    this.element = this.device.element.querySelector("." + moduleClass);

    this.registerInputProperty(this._enabledProperty);
    
    this._context = null;
    this._inputNode = null;
    this._dryOutputNode = null;
    this._wetOutputNode = null;
    this._outputNode = null;
  }

	get input() { return this._inputNode; }
  get dryOutput() { return this._dryOutputNode; }
  get wetOutput() { return this._wetOutputNode; }
  get output() { return this._outputNode; }
  
  setupAudioGraph(audioContext, input) {
  	this._context = audioContext;
  	
    let hasDryWet = this.hasInputProperty(this._dryWetProperty);
    if (hasDryWet) {
      this.registerInputProperty(this._dryWetProperty);
    }

    this._inputNode = input;
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
      if (this.getBoolPropertyValue(this._enabledProperty)) {
        this.wetOutput.connect(this.output);
        if (!hasDryWet) {
          this.dryOutput.gain.value = 0;
        }
      }
      else {
        this.wetOutput.disconnect();
        if (!hasDryWet) {
          this.dryOutput.gain.value = 1;
        }
      }
    }
    
    let enabledElement = this.getPropertyInputElement(this._enabledProperty);
    enabledElement.onchange = () => enableDisableFunction();
    
    this.input.connect(this.dryOutput);
    this.dryOutput.connect(this.output);
    enableDisableFunction();

    let inputMeter = this.element.querySelector("canvas[name='input-meter']");
   // if (inputMeter)
   //   levelMeterManager.register(audioContext, this.input, inputMeter);

    let outputMeter = this.element.querySelector("canvas[name='output-meter']");
   // if (outputMeter)
   //   levelMeterManager.register(audioContext, this.output, outputMeter);
  }
  
  registerPropertyInputElement(name, elementPath) {
    let propertyName = this.moduleClass + name;
    elementPath = "." + this.moduleClass + " " + elementPath;
    //  consoleLog(`${this.moduleClass}.registerPropertyInputElement('${propertyName}', '${elementPath)')`);
    this.device.registerPropertyInputElement(propertyName, elementPath);
  }

  registerInputProperty(name) {
    // consoleLog(`${this.moduleClass}.registerInputProperty(${name})`);
    this.registerPropertyInputElement(name, `input[name='${name}']`);
  }

  hasInputProperty(elementName) {
    return this.device.hasInputProperty(this.moduleClass + elementName);
  }

  hasPropertyInputElement(elementPath) {
    return this.device.hasPropertyInputElement(`.${this.moduleClass} ${elementPath}`);
  }

  getPropertyInputElement(elementName) {
    return this.device.getPropertyInputElement(this.moduleClass + elementName);
  }

  getFloatPropertyValue(name) {
    return this.device.getFloatPropertyValue(this.moduleClass + name);
  }
  setFloatPropertyValue(name, value) {
    this.device.setFloatPropertyValue(this.moduleClass + name, value);
  }

	getBoolPropertyValue(name) {
    return this.device.getBoolPropertyValue(this.moduleClass + name);
  }
  setBoolPropertyValue(name, value) {
    this.device.setBoolPropertyValue(this.moduleClass + name, value);
  }
  
  connectFloatPropertyToAudioParam(audioParam, name, propertyConverter = null) {
    this.device.connectFloatPropertyToAudioParam(audioParam, this.moduleClass + name, propertyConverter);
  }

  connectBoolPropertyToAudioParam(audioParam, name, propertyConverter = null) {
    this.device.connectBoolPropertyToAudioParam(audioParam, this.moduleClass + name, propertyConverter);
  }
}