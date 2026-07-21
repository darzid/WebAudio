import { ElementHandler } from "./element-handler";

type ElementHandlerConstructor = new (element: Element, cssClass: string, registry: ElementHandlerRegistry) => ElementHandler;

export class ElementHandlerRegistry {
 handlerClasses: { [key: string]: ElementHandlerConstructor };
 handlers: ElementHandler[];
 constructor() {
  this.handlerClasses = {};
  this.handlers = [];
 }
 
 get handlerCssClasses() : string[] { return Object.keys(this.handlerClasses); }
 
 registerHandler(elementClass: string, handlerClass: ElementHandlerConstructor) {
  this.handlerClasses[elementClass] = handlerClass;
  consoleLog("Registered handler for " + elementClass)
 }
 
 processAll() {
  let start: number = new Date().getTime();
  
  this.handlerCssClasses.forEach(cls => this.processCssClass(cls));
  
  let end: number = new Date().getTime();
  let duration = end - start;
  consoleLog(`processAll took ${duration} ms`);
 }
 
 processCssClass(cssClass: string) {
  let elements: NodeListOf<HTMLElement> = document.querySelectorAll("." + cssClass);
  elements.forEach((element: HTMLElement) => {
   consoleLog("processCssClass " + cssClass)
   if (!this.findElementHandler(element))
   {
    let handler = new this.handlerClasses[cssClass](element, cssClass, this);
    this.handlers.push(handler);
   }
   });
 }
 
 findElementHandler(element: HTMLElement) {
  return this.handlers.find(handler => handler.element === element);
 }
 
 findElementHandlers(elements: HTMLElement[]) {
  if (!elements) {
   return;
  }
  return Array.from(elements).map(element => this.findElementHandler(element));
 } 
}


function boolToInt(value: boolean) : number { return value ? 1 : 0; }
 
function inverseBoolToInt(value: boolean): number { return 1 - boolToInt(value); }

function inverseFloat(value: number): number { return 1 - value; }
 