import { Logger } from "../logger";
import { ElementHandler } from "./element-handler";


// Create a dynamic class
// type ElementHandlerConstructor = new (element: Element, cssClass: string) => ElementHandler;

export class ElementHandlerRegistry {
  static handlerClasses: { [key: string]: string } = {};
  static handlers: ElementHandler[] = [];

  static get handlerCssClasses(): string[] { return Object.keys(this.handlerClasses); }

  static registerHandler(elementClass: string, handlerClass: string) {
    this.handlerClasses[elementClass] = handlerClass;
    Logger.log("Registered handler for " + elementClass)
  }

  static processAll(factory: IDeviceFactory) {
    let start: number = new Date().getTime();

    this.handlerCssClasses.forEach(cls => this.processCssClass(cls, factory));

    let end: number = new Date().getTime();
    let duration = end - start;
    Logger.log(`processAll took ${duration} ms`);
  }

  static processCssClass(cssClass: string, factory: IDeviceFactory) {
    let elements: NodeListOf<HTMLElement> = document.querySelectorAll("." + cssClass);
    elements.forEach((element: HTMLElement) => {
      Logger.log("processCssClass " + cssClass, element)
      if (!this.findElementHandler(element)) {
        let typeName = this.handlerClasses[cssClass];
        // let constructorString = `new ${typeName}(element, cssClass)`;
        // let handler = eval(constructorString);
        let handler = factory.create(typeName, element, cssClass);
        this.handlers.push(handler);
      }
    });
  }

  static findElementHandler(element: HTMLElement) {
    Logger.log("HandlerRegistry.handlers", this.handlers);
    return this.handlers.find(handler => handler.element === element);
  }

  static findElementHandlers(elements: HTMLElement[]) {
    if (!elements) {
      return;
    }
    return Array.from(elements).map(element => this.findElementHandler(element));
  }
}

export interface IDeviceFactory {
  create(typename: string, element: HTMLElement, cssClass: string) : any;
}

function boolToInt(value: boolean): number { return value ? 1 : 0; }

function inverseBoolToInt(value: boolean): number { return 1 - boolToInt(value); }

function inverseFloat(value: number): number { return 1 - value; }
