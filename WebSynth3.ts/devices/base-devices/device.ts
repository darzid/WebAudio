import { ElementHandler } from "../../lib-ts/element-handler-registry/element-handler";
import { Logger } from "../../lib-ts/logger";

export class Device extends ElementHandler {
  name: string;
  type: string;
  constructor(element: HTMLElement, elementClass: string, deviceName: string, deviceType: string) {
    super(element, elementClass);

    Logger.log("Device constructor");
    this.name = deviceName;
    this.type = deviceType;
  }

  //get id() { return this.element.id; }

  /*  connectFloatPropertyToDecibelsParam(audioParam: Tone.Param<"decibels">, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
      //  let inputElement = this.getPropertyInputElement(propertyName);
      let paramUpdater = () => {
        let paramValue = propertyConverter ? propertyConverter(this.getPropertyValue(propertyName)) : this.getPropertyValue(propertyName);
        let currentValue = audioParam.value;
        audioParam.value = paramValue;
        
      //  Logger.log(`Property ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
      }
      this.subscribeToPropertyChange(propertyName, () => paramUpdater());
  
      //inputElement.oninput = () => paramUpdater();
      paramUpdater();
    }
    */

  connectPropertyToParam(owner: any, audioParam: any, propertyPath: string, propertyConverter: ((value: any) => any) | null = null) {
    //  let inputElement = this.getPropertyInputElement(propertyName);
    // let paramUpdater = () =>
    // {
    //   let rawValue = this.getPropertyValue(propertyPath);
    //   let paramValue = propertyConverter ? 
    //     propertyConverter(rawValue) : 
    //     rawValue;
    //   if (paramValue == null && audioParam.value) {
    //     Logger.log(`Property ${propertyPath} clearing from '${audioParam.value}'`, audioParam);
    //     return;
    //   }


    //   if (audioParam.value) {
    //     let currentValue = audioParam.value;
    //     if (audioParam.value != paramValue) {
    //       audioParam.value = paramValue;
    //       Logger.log(`Property ${propertyPath} updated from ${currentValue} to ${paramValue}`, audioParam);
    //     }
    //   }
    //   else {
    //     Logger.log(`AudioParam for property ${propertyPath} doesnt have a value`);
    //     audioParam = paramValue;
    //   }
    // }

    let paramUpdater2 = (rawValue: any) => {
      Logger.log("Input Element " + propertyPath + " changed to " + rawValue);
      let paramValue = propertyConverter ?
        propertyConverter(rawValue) :
        rawValue;
      if (paramValue == null && audioParam.value) {
        Logger.log(`Property ${propertyPath} clearing from '${audioParam.value}'`, audioParam);
        return;
      }

      if (typeof audioParam != "object") {
        let currentValue = audioParam;
        if (audioParam != parseFloat(paramValue)) {
          audioParam = parseFloat(paramValue);
          Logger.log(`Property ${propertyPath} updated from ${currentValue} to ${audioParam}`, audioParam);
        }
      }
      else {
        let currentValue = audioParam.value;
        let parsedTargetValue = parseFloat(paramValue);
        if (audioParam.value != parsedTargetValue) {
          audioParam.value = parsedTargetValue;
          if (audioParam.value != parsedTargetValue) {
            Logger.warn(`Property ${propertyPath} not updated from ${currentValue} to ${parsedTargetValue}`, audioParam);
            let units = audioParam.input.units;
            if (units == "frequency") {
              audioParam.setValueAtTime(parsedTargetValue, Tone.now());
              //audioParam.value = Tone.Frequency(parsedTargetValue);
              // audioParam.set(frequency);
              //audioParam.set(valueWrapper);

            }

          }
          Logger.log(`Property ${propertyPath} updated from ${currentValue} to ${audioParam.value}`, audioParam);
        }
      }
    }

    let inputElement = this.getChildInputElement(propertyPath);
    if (!inputElement) {
      throw "Could not find inputElement for " + propertyPath;
    }
    // inputElement.min = audioParam.min;
    // inputElement.max = audioParam.max;
  
    if (typeof audioParam == "object" && inputElement.type == "range") {
      if (inputElement.value != audioParam.value.toString()) {
        inputElement.value = audioParam.value;
        Logger.log("InputElement " + inputElement.name + " set to " + audioParam.value);
        var evnt = inputElement["oninput"];
        if (evnt)
          evnt.call(inputElement, new InputEvent("input"));
      }
    }

    inputElement.onchange = () => paramUpdater2(inputElement.value);
    // this.subscribeToPropertyChange(propertyPath, () => paramUpdater2(inputElement.value));

  //inputElement.oninput = () => paramUpdater();
  paramUpdater2(inputElement.value);
}

  /*  connectFloatPropertyToAudioParam(audioParam: AudioParam, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
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
  */
  /*
  connectBoolPropertyToAudioParam(audioParam: AudioParam, propertyName: string, propertyConverter: ((value: any) => number) | null = null) {
    let paramUpdater = () => {
      let paramValue = propertyConverter ? propertyConverter(this.getPropertyValue(propertyName)) : this.getPropertyValue(propertyName);
      audioParam.value = paramValue as number;
      //Logger.log(`BoolProperty ${propertyName} updated AudioParam to ${audioParam.value}`, audioParam);
    }
    this.subscribeToPropertyChange(propertyName, () => paramUpdater());
    //inputElement.onchange = () => paramUpdater();
    paramUpdater();
  }*/
}


