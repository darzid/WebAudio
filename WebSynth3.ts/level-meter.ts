import { Logger } from "./lib-ts/logger";
import { VuMeter } from "./lib-ts/vu-meter";
//import * as Tone from "tone";

export class LevelMeterManager {
  static meters: LevelMeter[]  = [];

  static register(audioNode: Tone.ToneAudioNode, meterCanvasElement: HTMLCanvasElement) {
    Logger.log("Register " + meterCanvasElement.getAttribute("name"), meterCanvasElement.parentElement!.parentElement!);
    if (!meterCanvasElement.width) {
      Logger.error("Element doesnt have width");
    }

    let vuMeter = new VuMeter(meterCanvasElement, {
      "boxCount": 15,
      "boxGapFraction": 0.1,
      "max": 100,
    });
    let levelMeter = new LevelMeter(audioNode, meterCanvasElement, vuMeter);
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
  analyser: Tone.Analyser;
  audioNode: Tone.ToneAudioNode;
  meterCanvasElement: HTMLCanvasElement;
  vuMeter: VuMeter;
  _pcmData: Float32Array<ArrayBufferLike>;
  constructor(audioNode: Tone.ToneAudioNode, meterCanvasElement: HTMLCanvasElement, vuMeter: VuMeter) {
    this.audioNode = audioNode;
    this.meterCanvasElement = meterCanvasElement;
    this.vuMeter = vuMeter;
    this.analyser = new Tone.Analyser("waveform", 256);
    this._pcmData = new Float32Array(this.analyser.size);
    audioNode.connect(this.analyser);
  }

  update() {
    if (!this.isVisible()) {
      // consoleLog("Skipping collapsed meter", this.meterCanvasElement);
      return;
    }

    this._pcmData = this.analyser.getValue() as Float32Array<ArrayBufferLike>;
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
      if (Tone.now() - peakTime < 10) {
        let lastPeak: number = parseFloat(this.meterCanvasElement.getAttribute("data-peak")!);
        if (peak < lastPeak) {
          peak = lastPeak;
        } else {
          this.meterCanvasElement.setAttribute("data-peak", peak.toString());
          this.meterCanvasElement.setAttribute("data-peaktime", Tone.now.toString());
        }
      }
    }
    else {
      this.meterCanvasElement.setAttribute("data-peak", peak.toString());
      this.meterCanvasElement.setAttribute("data-peaktime", Tone.now.toString());
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