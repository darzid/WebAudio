import { Logger } from "../../lib-ts/logger";
import { Device } from "./device";
import { LevelMeterManager } from "../../level-meter";
//import * as Tone from "../../node_modules/tone/build/esm/index";

// export class AudioDeviceNew extends Channel {
//   private _elementHandler: ElementHandler;
//   name: string;
//   dryOutput: Tone.Volume | undefined;
//   wetOutput: Tone.Volume | undefined;

//   constructor(name: string, element: HTMLElement, elementClass: string) {
//     super(0, 0);
//     this._elementHandler = new ElementHandler(element, elementClass);
//     this.name = name;
//   }

//   get id() { return this._elementHandler.element.id; }

//   setupAudioGraph(): void {
//     this.dryOutput = new Tone.Volume();
//     this.wetOutput = new Tone.Volume();

//     let hasDryWet = this._elementHandler.hasInputProperty("DryWet");

//     if (hasDryWet) {
//       this.connectFloatPropertyToDecibelsParam(this.dryOutput!.volume, "DryWet", (value) => 1 - value);
//       this.connectFloatPropertyToDecibelsParam(this.wetOutput!.volume, "DryWet");
//     }
//     else {
//       this.dryOutput!.volume.value = 0;
//       this.wetOutput!.volume.value = 1;
//     }


//     let enableDisableFunction = () => {
//       if (this._elementHandler.getPropertyValue("DeviceEnabled")) {
//         console.log("Enable " + this.id);
//         this.wetOutput!.connect(this.output!);
//         if (!hasDryWet) {
//           this.dryOutput!.volume.value = 0;
//         }
//       }
//       else {
//         console.log("Disable " + this.id);
//         this.wetOutput!.disconnect(this.output!);
//         if (!hasDryWet) {
//           this.dryOutput!.volume.value = 1;
//         }
//       }
//     };
//     // this.subscribeToPropertyChange("DeviceEnabled", (e) => enableDisableFunction(e));
//     let enabledElement = this._elementHandler.getChildInputElement("DeviceEnabled");
//     //enabledElement.onclick = () => enableDisableFunction();
//     this.input!.connect(this.dryOutput!);
//     this.dryOutput!.connect(this.output!);
//     enableDisableFunction();

//     let inputMeter = this._elementHandler.element.querySelector("canvas[name='device-input-meter']") as HTMLCanvasElement;
//     if (inputMeter) {
//       LevelMeterManager.register(audioContext, this.input!, inputMeter);
//       Logger.log("Added inputmeter for " + this.name);
//     }


//     let outputMeter = this._elementHandler.element.querySelector("canvas[name='track-output-meter']") as HTMLCanvasElement | null;
//     if (!outputMeter)
//       outputMeter = this._elementHandler.element.querySelector("canvas[name='device-output-meter']");
//     if (outputMeter) {
//       LevelMeterManager.register(audioContext, this.output!, outputMeter);
//       Logger.log("Added outputmeter for " + this.name);
//     }
//   }

//   // connectFloatPropertyToDecibelsParam(audioParam: Tone.Param<"decibels">, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
//   //   //  let inputElement = this.getPropertyInputElement(propertyName);
//   //   let paramUpdater = () => {
//   //     let paramValue = propertyConverter ? propertyConverter(this._elementHandler.getPropertyValue(propertyName)) : this._elementHandler.getPropertyValue(propertyName);
//   //     audioParam.value = paramValue as number;
//   //     //Logger.log(`FloatProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
//   //   }
//   //   this._elementHandler.subscribeToPropertyChange(propertyName, () => paramUpdater());

//   //   //inputElement.oninput = () => paramUpdater();
//   //   paramUpdater();
//   // }

//   connectBoolPropertyToAudioParam(audioParam: AudioParam, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
//     /* let inputElement = this.getPropertyInputElement(propertyName);
//      if (!inputElement) {
//        throw "Cannot find input element for " + this.elementClass + "." + + propertyName;
//      }*/
//     let paramUpdater = () => {
//       let paramValue = propertyConverter ? propertyConverter(this._elementHandler.getPropertyValue(propertyName)) : this.getPropertyValue(propertyName);
//       audioParam.value = paramValue as number;
//       //Logger.log(`BoolProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
//     }
//     this._elementHandler.subscribeToPropertyChange(propertyName, () => paramUpdater());
//     //inputElement.onchange = () => paramUpdater();
//     paramUpdater();
//   }

// }

export class AudioDevice extends Device {
  input: Tone.InputNode | null;
  dryOutput: Tone.Channel | null;
  wetOutput: Tone.Channel | null;
  output: Tone.Channel | null;

  constructor(element: HTMLElement, elementClass: string, deviceName: string) {
    super(element, elementClass, deviceName, "AudioDevice");
    Logger.log("AudioDevice constructor");
    //this._context = null;
    this.input = null;
    this.dryOutput = null;
    this.wetOutput = null;
    this.output = null;

    this.registerPropertyInputElement("DeviceEnabled", ".DeviceTitle input[name='Enabled']");
  }

  //get id() { return this.element.id; }

  setupAudioGraph() {
    let hasDryWet = this.hasInputProperty("DryWet");

    this.input = new Tone.Volume();
    this.dryOutput = new Tone.Channel();
    this.wetOutput = new Tone.Channel();
    this.output = new Tone.Channel();

    if (hasDryWet) {
      this.connectFloatPropertyToDecibelsParam(this.dryOutput!.volume, "DryWet", (value) => 1 - value);
      this.connectFloatPropertyToDecibelsParam(this.wetOutput!.volume, "DryWet");
    }
    else {
      this.dryOutput!.volume.value = 0;
      this.wetOutput!.volume.value = 1;
    }


    let enableDisableFunction = () => {
      if (this.getPropertyValue("DeviceEnabled")) {
        console.log("Enable " + this.id);
        this.wetOutput!.connect(this.output!);
        if (!hasDryWet) {
          this.dryOutput!.volume.value = 0;
        }
      }
      else {
        console.log("Disable " + this.id);
        this.wetOutput!.disconnect(this.output!);
        if (!hasDryWet) {
          this.dryOutput!.volume.value = 1;
        }
      }
    };
    // this.subscribeToPropertyChange("DeviceEnabled", (e) => enableDisableFunction(e));
    let enabledElement = this.getChildInputElement("DeviceEnabled");
    //enabledElement.onclick = () => enableDisableFunction();
    this.input!.connect(this.dryOutput!);
    this.dryOutput!.connect(this.output!);
    enableDisableFunction();

    let inputMeter = this.element.querySelector("canvas[name='device-input-meter']") as HTMLCanvasElement;
    if (inputMeter) {
      LevelMeterManager.register(this.input!, inputMeter);
      Logger.log("Added inputmeter for " + this.name);
    }

    let outputMeter = this.element.querySelector("canvas[name='track-output-meter']") as HTMLCanvasElement | null;
    if (!outputMeter)
      outputMeter = this.element.querySelector("canvas[name='device-output-meter']");
    if (outputMeter) {
      LevelMeterManager.register(this.output!, outputMeter);
      Logger.log("Added outputmeter for " + this.name);
    }
  }
}
