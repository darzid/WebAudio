class ElementHandlerRegistry {
 constructor() {
  this.handlerClasses = {};
  this.handlers = [];
 }
 
 get handlerCssClasses() { return Object.keys(this.handlerClasses); }
 
 registerHandler(elementClass, handlerClass) {
  this.handlerClasses[elementClass] = handlerClass;
  consoleLog("Registered handler for " + elementClass)
 }
 
 processAll() {
  let start = new Date();
  
  this.handlerCssClasses.forEach(cls => this.processCssClass(cls));
  
  let end = new Date();
  let duration = end - start;
  consoleLog(`processAll took ${duration} ms`);
 }
 
 processCssClass(cssClass) {
  let elements = document.querySelectorAll("." + cssClass);
  elements.forEach(element => {
   consoleLog("processCssClass " + cssClass)
   if (!this.findElementHandler(element))
   {
    let handler = new this.handlerClasses[cssClass](element, cssClass, this);
    this.handlers.push(handler);
   }
   });
 }
 
 findElementHandler(element) {
  return this.handlers.find(handler => handler.element === element);
 }
 
 findElementHandlers(elements) {
  if (!elements) {
   return;
  }
  return Array.from(elements).map(element => this.findElementHandler(element));
 } 
}


function boolToInt(value) { return value ? 1 : 0; }
 
function inverseBoolToInt(value) { return 1 - boolToInt(value); }

function inverseFloat(value) { return 1 - value; }
 