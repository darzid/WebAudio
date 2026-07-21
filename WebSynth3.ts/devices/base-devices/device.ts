import { ElementHandler } from "../../lib-ts/element-handler-registry/element-handler";
import { Logger } from "../../lib-ts/logger";
import * as Tone from "tone";

export class Device extends ElementHandler {
  name: string;
  type: string;
  constructor(element: HTMLElement, elementClass: string, deviceName: string, deviceType: string) {
    super(element, elementClass);

    Logger.log("Device constructor");
    this.name = deviceName;
    this.type = deviceType;
  }

  connectFloatPropertyToDecibelsParam(audioParam: Tone.Param<"decibels">, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
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


