class LevelMeterManager {
  meters = [];

  register(audioContext, audioNode, meterCanvasElement) {
    consoleLog("Register " + meterCanvasElement.getAttribute("name"), meterCanvasElement.parentElement.parentElement);
    if (!meterCanvasElement.width) {
      consoleError("Element doesnt have width");
    }

    let vuMeter = new VuMeter(meterCanvasElement, {
      "boxCount": 15,
      "boxGapFraction": 0.1,
      "max": 100,
    });
    let levelMeter = new LevelMeter(audioContext, audioNode, meterCanvasElement, vuMeter);
    this.meters.push(levelMeter);
    
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
  constructor(audioContext, audioNode, meterCanvasElement, vuMeter) {
    this.context = audioContext;
    this.audioNode = audioNode;
    this.meterCanvasElement = meterCanvasElement;
    this.vuMeter = vuMeter;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this._pcmData = new Float32Array(this.analyser.fftSize);
    audioNode.connect(this.analyser);
  }

  update() {
    if (!this.isVisible()) {
      // consoleLog("Skipping collapsed meter", this.meterCanvasElement);
      return;
    }

    this.analyser.getFloatTimeDomainData(this._pcmData);
    let sumSquares = 0.0;
    for (const amplitude of this._pcmData) { sumSquares += amplitude * amplitude; }
    let value = Math.sqrt(sumSquares / this._pcmData.length) * 100;
    value = Math.abs(Math.round(value * 1000) / 1000);
    if (parseFloat(this.meterCanvasElement.getAttribute("data-val")) != value) {
      this.meterCanvasElement.setAttribute("data-val", value);
      this.vuMeter.draw();
    }

    let peak = value;
    if (this.meterCanvasElement.getAttribute("data-peak")) {
      let peakTime = this.meterCanvasElement.getAttribute("data-peaktime");
      if (this.context.currentTime - peakTime < 10) {
        let lastPeak = parseFloat(this.meterCanvasElement.getAttribute("data-peak"));
        if (peak < lastPeak) {
          peak = lastPeak;
        } else {
          this.meterCanvasElement.setAttribute("data-peak", peak);
          this.meterCanvasElement.setAttribute("data-peaktime", this.context.currentTime);
        }
      }
    }
    else {
      this.meterCanvasElement.setAttribute("data-peak", peak);
      this.meterCanvasElement.setAttribute("data-peaktime", this.context.currentTime);
    }
    this.meterCanvasElement.title = `Peak=${peak}, Value=${value}`;
  }

  isVisible() {
    if (this.meterCanvasElement.offsetParent != null)
      return true;
    else {
      //consoleLog("not visible", this.meterCanvasElement)
      return false;
    }

    let ancestor = this.meterCanvasElement.parentElement;
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