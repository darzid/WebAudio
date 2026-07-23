import { Logger } from "../logger";
import { ElementHandler } from "./element-handler";
import { DeviceFactory } from "./device-factory";

export class ElementHandlerRegistry {
  static handlerClasses: { [key: string]: string } = {};
  static handlers: ElementHandler[] = [];

  static get handlerCssClasses(): string[] { return Object.keys(this.handlerClasses); }

  static registerHandler(elementClass: string, handlerClass: string) {
    this.handlerClasses[elementClass] = handlerClass;
    Logger.log("Registered handler for " + elementClass)
  }

  static processAll(factory: DeviceFactory) {
    let start: number = new Date().getTime();

    this.handlerCssClasses.forEach(cls => this.processCssClass(cls, factory));

    let end: number = new Date().getTime();
    let duration = end - start;
    Logger.log(`processAll took ${duration} ms`);
  }

  static processCssClass(cssClass: string, factory: DeviceFactory) {
    let elements: NodeListOf<HTMLElement> = document.querySelectorAll("." + cssClass);
    elements.forEach((element: HTMLElement) => {
      Logger.log("processCssClass " + cssClass)
      if (!this.findElementHandler(element)) {
        let typeName = this.handlerClasses[cssClass];
        // let constructorString = `new ${typeName}(element, cssClass)`;
        // let handler = eval(constructorString);
        let handler = factory.create(typeName!, element, cssClass)!;
        this.handlers.push(handler);
      }
    });
  }

  static findElementHandler(element: HTMLElement) {
    return this.handlers.find(handler => handler.element === element);
  }

  static findElementHandlers(elements: HTMLElement[]) {
    if (!elements) {
      return;
    }
    return Array.from(elements).map(element => this.findElementHandler(element));
  }
}


function boolToInt(value: boolean): number { return value ? 1 : 0; }

// function inverseBoolToInt(value: boolean): number { return 1 - boolToInt(value); }

// function inverseFloat(value: number): number { return 1 - value; }
