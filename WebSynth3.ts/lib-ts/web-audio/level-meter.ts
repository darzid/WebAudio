import { Logger } from "../../../lib-ts/logger";
import { VuMeter } from "../../../lib-ts/vu-meter";
import "tone"; 
export class LevelMeterManager {
  static meters: LevelMeter[]  = [];

  static register(audioContext: BaseAudioContext, audioNode: AudioNode, meterCanvasElement: HTMLCanvasElement) {
    Logger.log("Register " + meterCanvasElement.getAttribute("name"), meterCanvasElement.parentElement!.parentElement!);
    if (!meterCanvasElement.width) {
      Logger.error("Element doesnt have width");
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

  static updateMeters() {
    this.meters.forEach((meter) => meter.update());
    window.requestAnimationFrame(() => this.updateMeters());
  }
}

class LevelMeter {
  analyser: any;
  context: BaseAudioContext;
  audioNode: AudioNode;
  meterCanvasElement: HTMLCanvasElement;
  vuMeter: VuMeter;
  _pcmData: Float32Array<any>;
  constructor(audioContext: BaseAudioContext, audioNode: AudioNode, meterCanvasElement: HTMLCanvasElement, vuMeter: VuMeter) {
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
    let value: number = Math.sqrt(sumSquares / this._pcmData.length) * 100;
    value = Math.abs(Math.round(value * 1000) / 1000);
    if (parseFloat(this.meterCanvasElement.getAttribute("data-val")!) != value) {
      this.meterCanvasElement.setAttribute("data-val", value.toString());
      this.vuMeter.draw();
    }

    let peak = value;
    if (this.meterCanvasElement.getAttribute("data-peak")) {
      let peakTime: number = parseFloat(this.meterCanvasElement.getAttribute("data-peaktime")!);
      if (this.context.currentTime - peakTime < 10) {
        let lastPeak: number = parseFloat(this.meterCanvasElement.getAttribute("data-peak")!);
        if (peak < lastPeak) {
          peak = lastPeak;
        } else {
          this.meterCanvasElement.setAttribute("data-peak", peak.toString());
          this.meterCanvasElement.setAttribute("data-peaktime", this.context.currentTime.toString());
        }
      }
    }
    else {
      this.meterCanvasElement.setAttribute("data-peak", peak.toString());
      this.meterCanvasElement.setAttribute("data-peaktime", this.context.currentTime.toString());
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
  }
}