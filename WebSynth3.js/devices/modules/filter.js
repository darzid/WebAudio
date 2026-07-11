class Filter extends DeviceModule {
  _qTypes = ["lowpass", "highpass", "bandpass", "notch", "peaking", "allpass"];
  _gainTypes = ["lowshelf", "highshelf", "peaking"];

  constructor(device, moduleClass) {
    super(device, moduleClass);
    this.registerInputProperty("Type");
    this.registerInputProperty("Frequency");
    //  this.registerInputProperty(`FmRate`, `input[name='FmRate']`);
    //  this.registerInputProperty(`FmAmount`, `input[name='FmAmount']);
    this.registerInputProperty("Q");
    this.registerInputProperty("Gain");
    this.setupControlVisibilityEvents();
  }

  get filterType() { return this.getPropertyInputElement("Type").dataset.optionValue; }

  setupControlVisibilityEvents() {
    //consoleLog(`setupControlVisibilityEvents for `);
    let filterId = this._moduleClass;
    this.getPropertyInputElement("Type").oninput = () => this.updateControlVisibility();
    this.updateControlVisibility();
  }

  updateControlVisibility() {
    try {
      let filterId = this._moduleClass;
      let filterQElement = this.getPropertyInputElement("Q");
      let filterGainElement = this.getPropertyInputElement("Gain");

      let type = this.filterType ? this.filterType : "lowpass";
      filterQElement.parentElement.style.display = this._qTypes.includes(type) ? "block" : "none";
      filterGainElement.parentElement.style.display = this._gainTypes.includes(type) ? "block" : "none";
      //consoleLog(`updated ControlVisibility for ${this._moduleClass} on track ${this.device.track.id} based on type ${type}`);
    }
    catch (error) {
      consoleError("Error while updating control visibilty", error)
    }
  }

  setupAudioGraph(audioContext, inputNode, outputNode, startTime, duration, pressure, connectedNodes) {
    let filterRampDuration = duration * ((pressure / 127));
    let filter = audioContext.createBiquadFilter();
    filter.type = this.filterType;
    filter.Q.value = this.getFloatPropertyValue("Q");
    filter.gain.value = this.getFloatPropertyValue("Gain");

    filter.frequency.linearRampToValueAtTime(10, startTime);
    filter.frequency.linearRampToValueAtTime(this.getFloatPropertyValue("Frequency"), startTime + filterRampDuration);

    this.getPropertyInputElement("Type").oninput = () => {
      filter.type = this.filterType;
      this.updateControlVisibility();
    };
    this.getPropertyInputElement("Frequency").oninput = () => filter.frequency.linearRampToValueAtTime(this.getFloatPropertyValue("Frequency"), startTime + filterRampDuration);
    this.getPropertyInputElement("Q").oninput = () => filter.Q.value = this.getFloatPropertyValue("Q");
    this.getPropertyInputElement("Gain").oninput = () => filter.gain.value = this.getFloatPropertyValue("Gain");
    /* let fmRate = this.getFloatPropertyValue("FmRate");
     let fmAmount = 1 - this.getFloatPropertyValue("FmAmount");
     if (fmRate > 0 && fmAmount > 0) {
      let fmLfo = this._context.createOscillator({frequency: fmRate});
      let fmLfoGain = this.device._context.createOscillator({gain: fmAmount});
      fmLfo.connect(fmLfoGain);
      fmLfoGain.connect(filter.frequency);
      fmLfo.start();
      
      this.getPropertyInputElement("FmRate").oninput = () => fmLfo.frequency.value = this.getFloatPropertyValue("FmRate");
      this.getPropertyInputElement("FmAmount").oninput = () => fmLfoGain.gain.value = this.getFloatPropertyValue("FmAmount");
     }*/
    connectedNodes.push(filter);

    super.setupAudioGraph(audioContext, inputNode, outputNode, filter);
  }
}