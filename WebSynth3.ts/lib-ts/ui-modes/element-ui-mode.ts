import { Logger } from "../logger";

export class ElementUIMode {
  _activationEventHandler: (e: any) => void;
  _deactivationEventHandler: (e: any) => void;
  element: HTMLElement;
  name: string;
  initialState: string;
  currentState: string;
  modeCssClass: string;
  modeDisabledCssClass: string;
  activationEvent: string;
  deactivationEvent: string;
  constructor(element: HTMLElement, name: string, activationEvent: string, deactivationEvent: string, initialState: string, currentState: string) {
    this.element = element;
    this.name = name;
    this.initialState = initialState;
    this.currentState = currentState;
    this.modeCssClass = `${name.replace(" ", "-").toLowerCase()}-mode`;
    this.modeDisabledCssClass = `${this.modeCssClass}-disabled`;
    this.activationEvent = activationEvent;
    this.deactivationEvent = deactivationEvent;
    
    this._activationEventHandler = (e) => this.processActivationEvent(e);
    this._deactivationEventHandler = (e) => this.processDeativationEvent(e);
    document.addEventListener(activationEvent, this._activationEventHandler);
  }

  get isActive() { return this.element.classList.contains(this.modeCssClass); }
  get isDisabled() { return this.element.classList.contains(this.modeDisabledCssClass); }
  //this.element.querySelector(`input.${this.modeDisabledCssClass}`) != null; }
  
  processActivationEvent(e: { detail: { element: HTMLElement; }; }) {
    if (e.detail.element != this.element) 
      return;
    if (this.isDisabled)
      return;
      
    if (this.isActive)
      return;
      
    document.removeEventListener(this.activationEvent, this._activationEventHandler);
    
    Logger.log("Activate mode " + this.name, this.modeDisabledCssClass, this.element);
    this.element.classList.add(this.modeCssClass);
    
    this.activate(e);
    
    if (this.deactivationEvent)
      document.addEventListener(this.deactivationEvent, this._deactivationEventHandler);
  }
  
  activate(e: { detail: { element: HTMLElement; }; }) {

  }
  
  processDeativationEvent(e: { detail: { element: HTMLElement; }; }) {
    Logger.log("processDeativationEvent", e)
    if (e.detail.element != this.element)
      return;
    
    this.deactivate();
  }
  
  deactivate() {
    if (!this.isActive)
      return;
      
    if (this.deactivationEvent)
      document.removeEventListener(this.deactivationEvent, this._deactivationEventHandler);
    
    Logger.log("Deactivate mode " + this.name);
    this.element.classList.remove(this.modeCssClass);
    document.addEventListener(this.activationEvent, this._activationEventHandler);
  }
}

