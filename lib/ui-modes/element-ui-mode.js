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
    document.addEventListener(activationEvent, (e) => this.processActivationEvent(e));
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
      
    document.removeEventListener(this.activationEvent, (e) => this.processActivationEvent(e));
    
    consoleLog("Activate mode " + this.name, this.modeDisabledCssClass, this.element);
    this.element.classList.add(this.modeCssClass);
    
    this.activate(e);
    
    if (this.deactivationEvent)
      document.addEventListener(this.deactivationEvent, (e) => this.processDeativationEvent(e));
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
      document.removeEventListener(this.deactivationEvent, (e) => this.processDeativationEvent(e));
    
    consoleLog("Deactivate mode " + this.name);
    this.element.classList.remove(this.modeCssClass);
    document.addEventListener(this.activationEvent, (e) => this.processActivationEvent(e));
  }
}

