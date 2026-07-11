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

class ElementHandler {
 _longTouchTimer;
 _touchDuration = 800; //length of time we want the user to touch before we do something
  
 constructor(element, elementClass, handlerRegistry) {
  this.element = element;
  this.elementClass = elementClass;
  this.handlerRegistry = handlerRegistry;
  this.childElements = {};
  this.childHandlers = {};
 }
 
 getParentElementHandler(cssClass) {
  let parentElement = this.element.closest("." + cssClass);
  return this.handlerRegistry.findElementHandler(parentElement);
 }
 
 findChildElementHandlers(cssClass) {
  let childElements = this.element.querySelectorAll("." + cssClass);
  //consoleLog("findChildElementHandlers", childElements)
  return this.handlerRegistry.findElementHandlers(childElements);
 }
 
 findChildElementHandler(cssClass) {
  let childElement = this.element.querySelector("." + cssClass);
  //consoleLog("findChildElementHandlers", childElements)
  return this.handlerRegistry.findElementHandler(childElement);
 }
 
 hasPropertyInputElement(elementPath) {
  let childElement = this.element.querySelector(elementPath);
  return (childElement != null);
 }
 
 hasInputProperty(elementName) {
  return this.childElements[elementName] != null;
 }
 
 registerPropertyInputElement(elementName, elementPath) {
  let childElement = this.element.querySelector(elementPath);
  if (!childElement) {
   throw "Child element not found for element " + elementName + " and path " + elementPath;
  }
  this.childElements[elementName] = childElement;
/*
if (childElement.type == "range") {
   childElement.parentElement.ontouchstart = () => this.touchStartHandler();
   childElement.parentElement.ontouchend = () => this.touchEndHandler();
   childElement.parentElement.ontouchmove = () => this.touchMoveHandler();
  }*/
 }
 
/* touchStartHandler() {
  this._longTouchTimer = setTimeout(this.longTouch, this._touchDuration); 
 }*/
  
/* touchEndHandler() {
  if (this._longTouchTimer) {
   clearTimeout(this._longTouchTimer);
   this._longTouchTimer = null;
  }
 }*/
 /*
 touchMoveHandler() {
  this.touchEndHandler();
 }*/
 /*
  longTouch() {
   consoleLog("Long touch ");
  }
  */
 registerChildElementHandler(propertyName, cssClass) {
  this.childHandlers[propertyName] = cssClass;
 }
 
 getPropertyInputElement(elementName) {
  return this.childElements[elementName];
 }
 
 getChildInputElements() {
  return this.childElements.filter(element => element.nodeName == "INPUT");
 }
 
 getChildInputElement(elementName) {
  let childElement = this.getPropertyInputElement(elementName);
  if (!childElement.nodeName == "input") {
   throw "Child element is not an Input element";
  }
  return childElement;
 }
 
 getFloatPropertyValue(elementName) {
  return parseFloat(this.getChildInputElement(elementName).value);
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
 
 getBoolPropertyValue(elementName) {
  return this.getChildInputElement(elementName).checked;
 }
 setBoolPropertyValue(elementName, value) {
  this.getChildInputElement(elementName).checked = value;
  var evnt = inputElement["onchange"];
  if (evnt)
   evnt.call(inputElement);
 }
 
 
 hasState(name) {
  return this.element.classList.contains(name);
 }
 
 setState(name, active) {
  //consoleLog("set state " + name + " to " + active, this.element.id);
  if (active)
   this.activateState(name);
  else
   this.clearState(name);
 }
 
 activateState(name) {
  // this.element.setAttribute("data-" + name, true);
  this.element.classList.add(name);
  //consoleLog("activate state " + name, this.element.id);
 }
 
 clearState(name) {
  //this.element.setAttribute("data-" + name, false);
  this.element.classList.remove(name);
  //consoleLog("clear state " + name, this.element.id);
 }
 
 getPreset() {
  let preset = {};
  let elementNames = Object.keys(this.childElements);
  elementNames.forEach(name => {
   let inputElement = this.childElements[name];
   if (inputElement.nodeName == "INPUT") {
    if (inputElement.type == "range" || inputElement.type == "number")
     preset[name] = inputElement.value;
    else if (inputElement.type == "checkbox"){
     preset[name] = inputElement.checked;
    // consoleLog("checked ", inputElement)
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
 
 setPreset(preset) {
  let presetNames = Object.keys(preset);
  presetNames.forEach(name => {
   let inputElement = this.childElements[name];
   if (inputElement)  {
    //consoleLog("setPreset:" + name, inputElement)
    if (inputElement.nodeName == "INPUT") {
     if (inputElement.type == "range" || inputElement.type == "number")
      inputElement.value = parseFloat(preset[name]);
     else if (inputElement.type == "checkbox")
      inputElement.checked = preset[name];
     var evnt = inputElement["onchange"];
     if (evnt)
      evnt.call(inputElement);
    }
   } else {
    if (this.childHandlers[name])
    {
     let childElementHandlers = this.findChildElementHandlers(this.childHandlers[name]);
     for (let childIndex = 0; childIndex < preset[name].length; childIndex++) {
      childElementHandlers[childIndex].setPreset(preset[name][childIndex]);
     }
    }
    /*Object.keys(this.childHandlers).forEach(name => {
   preset[name] = [];
   let childElementHandlers = this.findChildElementHandlers(this.childHandlers[name]);
   childElementHandlers.forEach(handler => preset[name].push(handler.getPreset()));
  });*/
   }
  });
  consoleLog("setPreset", preset)
 }
}

function boolToInt(value) { return value ? 1 : 0; }
 
function inverseBoolToInt(value) { return 1 - boolToInt(value); }
 