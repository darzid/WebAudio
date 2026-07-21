import { ElementHandlerRegistry } from "../../lib-ts/element-handler-registry/element-handler-registry";
import { Logger } from "../logger";

export class ElementHandler {
  logAudioEvent(startTime: any, id: any, arg2: string, arg3: string) {
    throw new Error("Method not implemented.");
  }
  _propertyValues: { [key: string]: number | boolean } = {};
  element: HTMLElement;
  elementClass: string;
  childElements: { [key: string]: HTMLInputElement };
  childHandlers: { [key: string]: string };
  id: any;

  constructor(element: HTMLElement, elementClass: string) {
    this.element = element;
    this.elementClass = elementClass;
    this.childElements = {};
    this.childHandlers = {};
  }

  getParentElementHandler<T extends ElementHandler>(cssClass: string): T {
    let parentElement: HTMLElement | null = this.element.closest("." + cssClass);
    return ElementHandlerRegistry.findElementHandler(parentElement!)! as T;
  }

  findChildElementHandlers(cssClass: string): ElementHandler[] {
    // querySelectorAll returns a NodeList; convert to an array of HTMLElements
    let childNodeList = this.element.querySelectorAll("." + cssClass);
    // cast elements to HTMLElement and convert NodeList to Array
    let childElements: HTMLElement[] = Array.from(childNodeList).map(e => e as HTMLElement);
    const handlers = ElementHandlerRegistry.findElementHandlers(childElements) || [];
    return handlers.filter((handler): handler is ElementHandler => handler != null);
  }

  findChildElementHandler(cssClass: string) {
    let childElement = this.element.querySelector("." + cssClass) as HTMLElement | null;
    //Logger.log("findChildElementHandlers", childElements)
    return ElementHandlerRegistry.findElementHandler(childElement as HTMLElement);
  }

  hasPropertyInputElement(elementPath: string) {
    let childElement = this.element.querySelector(elementPath);
    return (childElement != null);
  }

  hasInputProperty(elementName: string) {
    return this.childElements[elementName] != null;
  }

  registerPropertyInputElement(elementName: string, elementPath: string) {
    let inputElement = this.element.querySelector(elementPath) as HTMLInputElement | null;

    if (!inputElement) throw "Child element not found for element " + elementName + " and path " + elementPath;
    if (inputElement.nodeName != "INPUT") throw "Child element is not an Input element";

    this.childElements[elementName] = inputElement;
    if (elementName == "OnOff") {
      console.log("registering onoff", this)
    }
    else if (elementName == "DeviceEnabled") {
      console.log("registering Enabled", this)
    }
    let storePropertyValue = () => {
      if (elementName == "OnOff") {
        console.log("Storing onoff", this)
      }
      if (elementName == "Enabled") {
        console.log("Storing enabled", this)
      }
      if (inputElement.type == "range" || inputElement.type == "number")
        this._propertyValues[elementName] = parseFloat(inputElement.value);
      else if (inputElement.type == "checkbox") {
        this._propertyValues[elementName] = inputElement.checked;
        console.log(`Checkbox ${elementName} changed`, this._propertyValues)
      }
      else
        throw "Unsupported INPUT type " + inputElement.type;
    };
    storePropertyValue();

    if (inputElement.type == "range" || inputElement.type == "number") {
      inputElement.oninput = () => {
        storePropertyValue();
        this._raisePropertyChanged(elementName, this._propertyValues[elementName]);
      };
    }
    else if (inputElement.type == "checkbox") {
      inputElement.onchange = () => {
        storePropertyValue();
        this._raisePropertyChanged(elementName, this._propertyValues[elementName]);
      };
    }
  }

  subscribeToPropertyChange(propertyName: string, callback: (arg0: any) => void) {
    document.addEventListener("PropertyChanged", (eventInfo: Event) => {
      const customEvent = eventInfo as CustomEvent;
      if (customEvent.detail.element == this.element && customEvent.detail.propertyName == propertyName)
        callback(customEvent.detail);
    });
  }

  getPropertyValue<T extends string | boolean | number>(propertyName: string): T {
    return this._propertyValues[propertyName] as T;
  }

  setPropertyValue(propertyName: string, value: number | boolean) {
    let inputElement: HTMLInputElement = this.getChildInputElement(propertyName);
    let isChange = false;

    if (inputElement.type == "range" || inputElement.type == "number") {
      isChange = (inputElement.value != value.toString());
      if (isChange)
        inputElement.value = value.toString();
    }
    else if (inputElement.type == "checkbox") {
      isChange = (inputElement.checked != value);
      if (isChange)
        inputElement.checked = value as boolean;
    }
    else
      throw "Unsupported INPUT type " + inputElement.type;

    if (isChange) {
      this._propertyValues[propertyName] = value;
      const evnt = inputElement.onchange;
      if (evnt)
        evnt.call(inputElement, new Event("change"));
    }
  }

  registerChildElementHandler(propertyName: string, cssClass: string) {
    this.childHandlers[propertyName] = cssClass;
  }

  getPropertyInputElement(elementName: string) {
    return this.childElements[elementName];
  }

  getChildInputElements() {
    return Object.values(this.childElements).filter(element => element.nodeName == "INPUT");
  }

  getChildInputElement(elementName: string) {
    let childElement: HTMLInputElement = this.getPropertyInputElement(elementName);
    if (!childElement) {
      throw "Child element not found";
    }
    if (childElement.nodeName.toUpperCase() != "INPUT") {
      throw "Child element is not an Input element";
    }
    return childElement;
  }



  /*
  getFloatPropertyValue(propertyName) {
    return this._propertyValues[propertyName];
   }
   setFloatPropertyValue(elementName, value) {
    let inputElement = this.getChildInputElement(elementName);
    if (inputElement.value == value.toString())
     return;
     
    inputElement.value = value;
    var evnt = inputElement["onchange"];
    if (evnt)
     evnt.call(inputElement);
   }
   */

  /* getBoolPropertyValue(elementName) {
    return this._propertyValues[propertyName];
    //_return this.getChildInputElement(elementName).checked;
   }
   setBoolPropertyValue(elementName, value) {
    let inputElement = this.getChildInputElement(elementName);
    inputElement.checked = value;
    var evnt = inputElement["onchange"];
    if (evnt)
     evnt.call(inputElement);
   }
   */

  hasState(name: string) {
    return this.element.classList.contains(name);
  }

  setState(name: string, active: boolean) {
    //Logger.log("set state " + name + " to " + active, this.element.id);
    if (active)
      this.activateState(name);
    else
      this.clearState(name);
  }

  activateState(name: string) {
    // this.element.setAttribute("data-" + name, true);
    this.element.classList.add(name);
    //Logger.log("activate state " + name, this.element.id);
  }

  clearState(name: string) {
    //this.element.setAttribute("data-" + name, false);
    this.element.classList.remove(name);
    //Logger.log("clear state " + name, this.element.id);
  }

  getPreset() {
    let preset: { [key: string]: any } = {};
    let elementNames = Object.keys(this.childElements);
    elementNames.forEach((name: string) => {
      let inputElement = this.childElements[name];
      if (inputElement.nodeName == "INPUT") {
        if (inputElement.type == "range" || inputElement.type == "number")
          preset[name] = inputElement.value;
        else if (inputElement.type == "checkbox") {
          preset[name] = inputElement.checked;
        }
      }
    });

    Object.keys(this.childHandlers).forEach(name => {
      preset[name] = [];
      let childElementHandlers = this.findChildElementHandlers(this.childHandlers[name]);
      childElementHandlers.forEach(handler => preset[name].push(handler.getPreset()));
    });
    return preset;
  }

  setPreset(preset: {[key: string]: any}) {
    let presetNames = Object.keys(preset);
    presetNames.forEach(name => {
      let inputElement = this.childElements[name];
      if (inputElement) {
        //Logger.log("setPreset:" + nameinputElement)
        if (inputElement.nodeName == "INPUT") {
          if (inputElement.type == "range" || inputElement.type == "number")
            inputElement.value = parseFloat(preset[name]).toString();
          else if (inputElement.type == "checkbox")
            inputElement.checked = preset[name].toString() == "true";
          const evnt = inputElement.onchange;
          if (evnt)
            evnt.call(inputElement, new Event("change"));
        }
      } else {
        if (this.childHandlers[name]) {
          let childElementHandlers = this.findChildElementHandlers(this.childHandlers[name]);
          for (let childIndex = 0; childIndex < preset[name].length; childIndex++) {
            let childPreset = preset[name][childIndex];
            childElementHandlers[childIndex].setPreset(childPreset);
          }
        }
      }
    });
    Logger.log("setPreset", preset)
  }

  _raisePropertyChanged(propertyName: string, value: number | boolean) {
    document.dispatchEvent(
      new CustomEvent("PropertyChanged", {
        detail: {
          element: this.element,
          elementClass: this.elementClass,
          propertyName: propertyName,
          value: value
        }
      }
      ));
  }
}

export class Preset {
  name: string = "";
  values: {[key: string]: any} = {};
}