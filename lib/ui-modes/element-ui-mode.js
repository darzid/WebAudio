class ElementUIMode {
  constructor(element, name, activationEvent, deactivationEvent, initialState, currentState) {
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
  
  processActivationEvent(e) {
    if (e.detail.element != this.element) 
      return;
    if (this.isDisabled)
      return;
      
    if (this.isActive)
      return;
      
    document.removeEventListener(this.activationEvent, this._activationEventHandler);
    
    consoleLog("Activate mode " + this.name, this.modeDisabledCssClass, this.element);
    this.element.classList.add(this.modeCssClass);
    
    this.activate(e);
    
    if (this.deactivationEvent)
      document.addEventListener(this.deactivationEvent, this._deactivationEventHandler);
  }
  
  activate(e) {

  }
  
  processDeativationEvent(e) {
    consoleLog("processDeativationEvent", e)
    if (e.detail.element != this.element)
      return;
    
    this.deactivate();
  }
  
  deactivate() {
    if (!this.isActive)
      return;
      
    if (this.deactivationEvent)
      document.removeEventListener(this.deactivationEvent, this._deactivationEventHandler);
    
    consoleLog("Deactivate mode " + this.name);
    this.element.classList.remove(this.modeCssClass);
    document.addEventListener(this.activationEvent, this._activationEventHandler);
  }
}

