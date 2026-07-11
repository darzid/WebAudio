class LevelMeterManager {
  meters = [];

  register(audioContext, audioNode, meter) {
    consoleLog("Register " + meter.getAttribute("name"), meter.parentElement.parentElement);
    if (!meter.width) {
      consoleError("Element doesnt have width");
    }

    let levelMeter = new LevelMeter(audioContext, audioNode, meter);
    this.meters.push(levelMeter);
    vumeter(meter, {
      "boxCount": 15,
      "boxGapFraction": 0.1,
      "max": 100,
    });

    if (this.meters.length == 1) {
      this.updateMeters();
    }

    return levelMeter.analyser;
  }

  updateMeters() {
    this.meters.forEach((meter) => meter.update());
    window.requestAnimationFrame(() => this.updateMeters());
  }
}

const levelMeterManager = new LevelMeterManager();

class LevelMeter {
  constructor(audioContext, audioNode, meter) {
    this.context = audioContext;
    this.audioNode = audioNode;
    this.meter = meter;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this._pcmData = new Float32Array(this.analyser.fftSize);
    audioNode.connect(this.analyser);
  }

  update() {
    if (!this.isVisible()) {
      // consoleLog("Skipping collapsed meter", this.meter);
      return;
    }


    this.analyser.getFloatTimeDomainData(this._pcmData);
    let sumSquares = 0.0;
    for (const amplitude of this._pcmData) { sumSquares += amplitude * amplitude; }
    let value = Math.sqrt(sumSquares / this._pcmData.length) * 100;
    value = Math.abs(Math.round(value * 1000) / 1000);
    if (parseFloat(this.meter.getAttribute("data-val")) != value) {
      this.meter.setAttribute("data-val", value);
    }

    let peak = value;
    if (this.meter.getAttribute("data-peak")) {
      let peakTime = this.meter.getAttribute("data-peaktime");
      if (this.context.currentTime - peakTime < 10) {
        let lastPeak = parseFloat(this.meter.getAttribute("data-peak"));
        if (peak < lastPeak) {
          peak = lastPeak;
        } else {
          this.meter.setAttribute("data-peak", peak);
          this.meter.setAttribute("data-peaktime", this.context.currentTime);
        }
      }
    }
    else {
      this.meter.setAttribute("data-peak", peak);
      this.meter.setAttribute("data-peaktime", this.context.currentTime);
    }
    this.meter.title = `Peak=${peak}, Value=${value}`;
  }

  isVisible() {
    if (this.meter.offsetParent != null)
      return true;
    else {
      //consoleLog("not visible", this.meter)
      return false;
    }

    let ancestor = this.meter.parentElement;
    while (ancestor) {
      if (ancestor.classList.contains("collapsed"))
        return false;
      if (!ancestor.classList.contains("Track"))
        ancestor = ancestor.parentElement;
      else {
        return true;
      }
    }

    return true;
  }
}