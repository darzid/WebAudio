class DeviceModule {
  _enabledProperty = "Enabled";
  _dryWetProperty = "DryWet";

  constructor(device, moduleClass) {
    this.device = device;
    this.moduleClass = moduleClass;
    this.element = this.device.element.querySelector("." + moduleClass);

    this.registerInputProperty(this._enabledProperty);
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

  connectFloatPropertyToAudioParam(audioParam, name, propertyConverter = null) {
    this.device.connectFloatPropertyToAudioParam(audioParam, this.moduleClass + name, propertyConverter);
  }

  connectBoolPropertyToAudioParam(audioParam, name, propertyConverter = null) {
    this.device.connectBoolPropertyToAudioParam(audioParam, this.moduleClass + name, propertyConverter);
  }

  setupAudioGraph(audioContext, inputNode, outputNode, processingNode, processingEndNode = null) {
    let hasDryWet = this.hasInputProperty(this._dryWetProperty);
    if (hasDryWet) {
      this.registerInputProperty(this._dryWetProperty);
    }

    if (!processingEndNode) processingEndNode = processingNode;

    let dryOutputGain = audioContext.createGain();
    this.connectBoolPropertyToAudioParam(dryOutputGain.gain, this._enabledProperty);

    let wetOutputGain = audioContext.createGain();
    this.connectBoolPropertyToAudioParam(wetOutputGain.gain, this._enabledProperty);

    if (hasDryWet) {
      this.connectFloatPropertyToAudioParam(dryOutputGain.gain, this._dryWetProperty, (value) => 1 - value);
      this.connectFloatPropertyToAudioParam(wetOutputGain.gain, this._dryWetProperty);
    } else {
      dryOutputGain.gain.value = 0;
      wetOutputGain.gain.value = 1;
    }

    inputNode.connect(dryOutputGain);
    dryOutputGain.connect(outputNode);
    inputNode.connect(processingNode);
    processingEndNode.connect(wetOutputGain);
    wetOutputGain.connect(outputNode);

    let inputMeter = this.element.querySelector("canvas[name='input-meter']");
    if (inputMeter)
      levelMeterManager.register(audioContext, inputNode, inputMeter);

    let outputMeter = this.element.querySelector("canvas[name='output-meter']");
    if (outputMeter)
      levelMeterManager.register(audioContext, outputNode, outputMeter);
  }
}