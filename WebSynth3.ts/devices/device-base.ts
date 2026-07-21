import { ElementHandler } from "../../lib-ts/element-handler-registry/element-handler";
import { ElementHandlerRegistry } from "../../lib-ts/element-handler-registry/element-handler-registry";
import { Logger } from "../../lib-ts/logger";
import { LevelMeterManager } from "../../lib-ts/web-audio/level-meter";

export class Device extends ElementHandler {
  name: string;
  type: string;
  constructor(element: HTMLElement, elementClass: string, handlerRegistry: ElementHandlerRegistry, deviceName: string, deviceType: string) {
    super(element, elementClass, handlerRegistry);
    
    Logger.log("Device constructor");
    this.name = deviceName;
    this.type = deviceType;
  }


  connectFloatPropertyToAudioParam(audioParam: AudioParam, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {

    //  let inputElement = this.getPropertyInputElement(propertyName);
    let paramUpdater = () => {
      let paramValue = propertyConverter ? propertyConverter(this.getPropertyValue(propertyName)) : this.getPropertyValue(propertyName);
      audioParam.value = paramValue as number;
      //Logger.log(`FloatProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
    }
    this.subscribeToPropertyChange(propertyName, () => paramUpdater());

    //inputElement.oninput = () => paramUpdater();
    paramUpdater();
  }

  connectBoolPropertyToAudioParam(audioParam: AudioParam, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
    /* let inputElement = this.getPropertyInputElement(propertyName);
     if (!inputElement) {
       throw "Cannot find input element for " + this.elementClass + "." + + propertyName;
     }*/
    let paramUpdater = () => {
      let paramValue = propertyConverter ? propertyConverter(this.getPropertyValue(propertyName)) : this.getPropertyValue(propertyName);
      audioParam.value = paramValue as number;
      //Logger.log(`BoolProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
    }
    this.subscribeToPropertyChange(propertyName, () => paramUpdater());
    //inputElement.onchange = () => paramUpdater();
    paramUpdater();
  }
}

export class MidiDevice extends Device {
  constructor(element: HTMLElement, elementClass: string, handlerRegistry: ElementHandlerRegistry, deviceName: string, deviceType: string) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    Logger.log("MidiDevice constructor");
  }
}

export class AudioDevice extends Device {
  _context: BaseAudioContext | null;
  _inputNode: GainNode | null;
  _dryOutputNode: GainNode | null;
  _wetOutputNode: GainNode | null;
  _outputNode: GainNode | null;

  constructor(element: HTMLElement, elementClass: string, handlerRegistry: ElementHandlerRegistry, deviceName: string, deviceType: string) {
    super(element, elementClass, handlerRegistry, deviceName, deviceType);
    Logger.log("AudioDevice constructor");
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

  setupAudioGraph(audioContext: BaseAudioContext) {
    this._context = audioContext;

    let hasDryWet = this.hasInputProperty("DryWet");

    this._inputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    this._dryOutputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    this._wetOutputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });
    this._outputNode = new GainNode(audioContext, { gain: 1.0, channelCount: 2 });

    if (hasDryWet) {
      this.connectFloatPropertyToAudioParam(this.dryOutput!.gain, "DryWet", (value) => 1 - value);
      this.connectFloatPropertyToAudioParam(this.wetOutput!.gain, "DryWet");
    }
    else {
      this.dryOutput!.gain.value = 0;
      this.wetOutput!.gain.value = 1;
    }


    let enableDisableFunction = () => {

      if (this.getPropertyValue("DeviceEnabled")) {
        console.log("Enable " + this.id)
        this.wetOutput!.connect(this.output!);
        if (!hasDryWet) {
          this.dryOutput!.gain.value = 0;
        }
      }
      else {
        console.log("Disable " + this.id)
        this.wetOutput!.disconnect(this.output!);
        if (!hasDryWet) {
          this.dryOutput!.gain.value = 1;
        }
      }
    }
    // this.subscribeToPropertyChange("DeviceEnabled", (e) => enableDisableFunction(e));
    let enabledElement = this.getChildInputElement("DeviceEnabled");
    //enabledElement.onclick = () => enableDisableFunction();

    this.input!.connect(this.dryOutput!);
    this.dryOutput!.connect(this.output!);
    enableDisableFunction();

    let inputMeter = this.element.querySelector("canvas[name='device-input-meter']") as HTMLCanvasElement;
    if (inputMeter) {
      LevelMeterManager.register(audioContext, this.input!, inputMeter);
      Logger.log("Added inputmeter for " + this.name);
    }


    let outputMeter = this.element.querySelector("canvas[name='track-output-meter']") as HTMLCanvasElement | null;
    if (!outputMeter)
      outputMeter = this.element.querySelector("canvas[name='device-output-meter']");
    if (outputMeter) {
      LevelMeterManager.register(audioContext, this.output!, outputMeter);
      Logger.log("Added outputmeter for " + this.name);
    }
  }
}
