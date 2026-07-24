import { Logger } from "../logger";
import { ElementUIMode } from "../ui-modes/element-ui-mode";

export function setupKnob(knob: HTMLElement) {
  const initialWobbleModeState = {
    startValue: 0,
    framesPerSecond: 0
  };
  const currentWobbleModeState = {
    wobbleDepth: 0,
    wobbleRate: 0,
    wobbleRange: 0,
    wobbleValue: 0,
    currentRadian: 0,
    radianStepPerFrame: 0
  };


  class WobbleMode extends ElementUIMode<typeof initialWobbleModeState, typeof currentWobbleModeState> {
    _processWobbleChangeEventHandler: (e: CustomEvent) => void;
    constructor(knob: HTMLElement) {
      super(knob, "wobble", "DoubleTap", "DoubleTap",
        {
          framesPerSecond: 100,
          startValue: 0
        },
        {
          wobbleDepth: 0,
          wobbleRate: 0,
          radianStepPerFrame: 0,
          wobbleRange: 0,
          wobbleValue: 0,
          currentRadian: 0
        });
      this._processWobbleChangeEventHandler = (e: CustomEvent) => this.processWobbleChangeEvent(e);
    }

    activate(e: CustomEvent) {
      if (knobUIModes.wobbleConfigMode.isActive)
        return;

      super.activate(e);

      const initialState = this.initialState as { startValue?: number; framesPerSecond?: number;[key: string]: any };
      const currentState = this.currentState as { wobbleDepth?: number; wobbleRate?: number;[key: string]: any };

      initialState["startValue"] = parseFloat(knobInput.value);
      currentState["wobbleRate"] = parseFloat(this.element.dataset.wobbleRate!);
      currentState.wobbleDepth = parseFloat(this.element.dataset.wobbleDepth!);

      this.calculateWobble();
      document.addEventListener("WobbleChange", (e: Event) => this._processWobbleChangeEventHandler(e as CustomEvent));

      Logger.log(`Start wobbling:`, this.initialState, this.currentState);

      window.setTimeout(() => this.wobbleValue(), 1000 / this.initialState.framesPerSecond!);
    }

    processWobbleChangeEvent(e: CustomEvent) {
      if (e.detail.element == this.element) {
        this.currentState.wobbleDepth = e.detail.wobbleDepth;
        this.currentState.wobbleRate = e.detail.wobbleRate;
        this.calculateWobble();
        Logger.log("WobbleChange", this.currentState)
      }
    }

    calculateWobble() {
      this.currentState.wobbleRange = (knobDefinition.valueRange / 2) * this.currentState.wobbleDepth;
      this.currentState.currentRadian = 0;
      this.currentState.radianStepPerFrame = ((2 * Math.PI) * this.currentState.wobbleRate) / this.initialState.framesPerSecond;
    }

    wobbleValue() {
      if (this.isActive) {
        let valueWobble = this.initialState.startValue + Math.sin(this.currentState.currentRadian) * this.currentState.wobbleRange;
        this.currentState.wobbleValue = parseFloat(valueWobble.toFixed(knobDefinition.valueDecimals));
        setKnobValue(this.currentState.wobbleValue);
        this.currentState.currentRadian += this.currentState.radianStepPerFrame;

        window.setTimeout(() => this.wobbleValue(), 1000 / this.initialState.framesPerSecond);
      }
    }

    deactivate() {
      if (knobUIModes.wobbleConfigMode.isActive)
        return;
      document.removeEventListener("WobbleChange", (e: Event) => this._processWobbleChangeEventHandler(e as CustomEvent));
      setKnobValue(this.initialState.startValue);
      super.deactivate();
    }
  }

  const initialWobbleConfigModeState = {
    x: 0,
    y: 0,
    framesPerSecond: 0,
    wobbleDepth: 0,
    wobbleRate: 0,
    startValue: 0,
    targetRectangle: new DOMRect()
  };
  const currentWobbleConfigModeState = {
    x: 0,
    y: 0,
    wobbleDepth: 0,
    wobbleRate: 0,
    wobbleRange: 0,
    currentRadian: 0,
    radianStepPerFrame: 0,
    deltaX: 0,
    deltaY: 0
  };

  class WobbleConfigMode extends ElementUIMode<typeof initialWobbleConfigModeState, typeof currentWobbleConfigModeState> {
    noMovementTimer: any;
    noMovementDuration = 5000;

    constructor(knob: HTMLInputElement) {
      super(knob, "wobble-config", "", "DoubleTap",
        {
          framesPerSecond: 100,
          x: 0,
          y: 0,
          wobbleDepth: 0,
          wobbleRate: 0,
          startValue: 0,
          targetRectangle: knob.getBoundingClientRect()
        },
        {
          x: 0,
          y: 0,
          wobbleDepth: 0,
          wobbleRate: 0,
          wobbleRange: 0,
          currentRadian: 0,
          radianStepPerFrame: 0,
          deltaX: 0,
          deltaY: 0
        });
    }

    get isDisabled() { return knobUIModes.wobbleMode.isDisabled; }

    activate(e: CustomEvent<any>) {
      super.activate(e);
      Logger.log(e.toString());

      //document.dispatchEvent(new CustomEvent("WobbleConfigStarted", { detail: {element: knob }}));

      this.initialState.wobbleDepth = parseFloat(this.element.dataset.wobbleDepth!);
      this.initialState.wobbleRate = parseFloat(this.element.dataset.wobbleRate!);
      this.currentState.wobbleDepth = this.initialState.wobbleDepth;
      this.currentState.wobbleRate = this.initialState.wobbleRate;

      this.initialState.x = e.detail.event.clientX - this.initialState.targetRectangle.left;
      this.initialState.y = e.detail.event.clientY - this.initialState.targetRectangle.top;

      this.initialState.startValue = parseFloat(knobInput.value);
      this.currentState.wobbleRange = (knobDefinition.valueRange / 2) * this.currentState.wobbleDepth;
      this.currentState.currentRadian = 0;
      this.currentState.radianStepPerFrame = ((2 * Math.PI) * this.currentState.wobbleRate) / this.initialState.framesPerSecond;
      this.element.addEventListener("touchmove", (e) => this.pointerMove(e));
      //this.noMovementTimer = setTimeout(() => this.noMovementDetected(), this.noMovementDuration);
      Logger.log(`Start wobble config:`, this.initialState, this.currentState);
    }

    pointerMove(e: TouchEvent) {
      //Logger.log("PointerMoved", e)
      if (this.isActive) {
        var position = getEventElementPosition(e);
        this.currentState.deltaX = position.x - this.initialState.x;
        this.currentState.deltaY = 0 - (position.y - this.initialState.y);
        let deltaXToWidthRatio = this.currentState.deltaX / this.initialState.targetRectangle.width;
        let deltaYToHeightRatio = this.currentState.deltaY / this.initialState.targetRectangle.height;

        this.currentState.wobbleDepth = this.initialState.wobbleDepth + (deltaYToHeightRatio * this.initialState.wobbleDepth);
        this.currentState.wobbleRate = this.initialState.wobbleRate + (deltaXToWidthRatio * this.initialState.wobbleRate);

        document.dispatchEvent(new CustomEvent("WobbleChange", { detail: { element: knob, wobbleDepth: this.currentState.wobbleDepth, wobbleRate: this.currentState.wobbleRate } }));

        // clearTimeout(() => this.noMovementTimer);
        //this.noMovementTimer = setTimeout(() => this.noMovementDetected(), this.noMovementDuration);
        Logger.log("Move", this.initialState, this.currentState)
        //Logger.log(`X=${position.x}, Y=${position.y}, DX=${_wobbleConfigDeltaX}, DY=${_wobbleConfigDeltaY}, XR=${deltaXToWidthRatio}, YR=${deltaYToHeightRatio}, WCD=${_wobbleConfigNewDepth}, WCR=${_wobbleConfigNewRate}`);
      }
    }

    noMovementDetected() {
      Logger.log(`No movement detected for ${this.name}`);
      super.deactivate();
      Logger.log(`Called super.deactivate for ${this.name}`);
    }
  }

  /*    deactivate() {
        //this.element.dataset.wobbleDepth = this.currentState.wobbleDepth;
       // this.element.dataset.wobbleRate = this.currentState.wobbleRate;
        //document.dispatchEvent(new CustomEvent("WobbleChange", { detail: {element: knob, wobbleDepth: this.currentState.wobbleDepth, wobbleRate: this.currentState.wobbleRate}}));
        super.deactivate();
      }*/


  let knobInput: HTMLInputElement = (knob.nodeName == "INPUT") ? knob as HTMLInputElement : knob.querySelector("input")!;
  if (!knobInput) {
    Logger.error("Knob input element not found", knob);
    return;
  }

  //Logger.log("Knob...")

  let knobSvg = knob.querySelector("svg");
  let knobValueLabel = knob.querySelector(".value-label");
  let dial: HTMLElement = knob.querySelector(".dial") as HTMLElement;
  let line: HTMLElement = knob.querySelector(".position-line") as HTMLElement;

  // if (isNaN(parseFloat(knobInput.min))) {
  //   Logger.error("Knob value is not a number", knobInput);
  //   return;
  // }

  // Logger.log("Setup knob " + knobInput.name, knob);

  let knobMin = knobInput.min ? parseFloat(knobInput.getAttribute("min")!) : 0;
  let knobMax = knobInput.max ? parseFloat(knobInput.max) : 100;
  let stepSize = knobInput.step ? parseFloat(knobInput.step) : 1;
  let knobDefinition = {
    minAngle: -135,
    maxAngle: 135,
    angleRange: 0,
    stepAngle: 0,
    tickAngle: 0,
    steps: 1 + (knobMax - knobMin),
    min: knobMin,
    max: knobMax,
    valueRange: knobMax - knobMin,
    stepSize: stepSize,
    valueDecimals: stepSize.toString().split(".")[1]?.length || 0,
    largeStepSize: stepSize * 10,
    ticks: 1 + (knobMax - knobMin) / stepSize
  }
  if (knobDefinition.largeStepSize > knobDefinition.valueRange) {
    knobDefinition.largeStepSize = knobDefinition.stepSize;
  }

  knobDefinition.angleRange = knobDefinition.maxAngle - knobDefinition.minAngle;
  knobDefinition.stepAngle = knobDefinition.angleRange / (knobDefinition.steps - 1);
  knobDefinition.tickAngle = knobDefinition.angleRange / (knobDefinition.ticks - 1);

  if (knobMin < 0) {
    //Logger.log("min knob", knob)
  }
  if (stepSize == 1) {
    //    Logger.log("Knob " + knob.getAttribute("name"), knobDefinition)
  }

  knob.dataset.wobbleRate = "0.25";
  knob.dataset.wobbleDepth = "0.25";


  setKnobValue(parseFloat(knobInput.value));

  let knobUIModes = {
    wobbleMode: new WobbleMode(knob),
    wobbleConfigMode: new WobbleConfigMode(knob as HTMLInputElement)
  };
  let mouseDown = false;
  let mouseY = 0;
  let pointerType: string = "";

  let newAngle = 0;
  let angle = 0;

  //Logger.log("Knob settings done", knob);

  function setKnobValue(value: number, previousAngle?: number | null) {
    if (parseFloat(knobInput.value) === value)
      return;

    if (value < knobDefinition.min) {
      value = knobDefinition.min;
    } else if (value > knobDefinition.max) {
      value = knobDefinition.max;
    }

    //if (! angle)
    angle = knobDefinition.minAngle + ((value - knobDefinition.min) * knobDefinition.stepAngle);

    if (dial)
      dial.style.rotate = angle + "deg";
    if (line)
      line.style.rotate = angle + "deg";

    knobInput.value = value.toString();
    knobInput.dataset.value = value.toString();
    if (knobValueLabel) {
      let listName = knobInput.getAttribute("list");
      if (listName) {
        let list = document.getElementById(listName);
        if (!list) {
          Logger.error("List " + listName + " not found for knob input", knobInput);
          knobValueLabel.innerHTML = value.toString();
          return;
        }
        let option = list.querySelector("option[value='" + value + "']");
        if (option) {
          knobValueLabel.innerHTML = option.innerHTML.trim().substring(0, 7);
          knobInput.dataset.optionValue = option.innerHTML;
        }
        else {
          knobValueLabel.innerHTML = floatToFixed(value, knobDefinition.valueDecimals).toString();
        }
      }
      else {
        knobValueLabel.innerHTML = floatToFixed(value, knobDefinition.valueDecimals).toString();
      }
    }

    var evnt = knobInput["oninput"];
    if (evnt)
      evnt.call(knobInput, new InputEvent("input"));

    function floatToFixed(value: number, digits: number) {
      if (Math.round(value) != value) {
        let text = value.toFixed(digits);
        if (text.indexOf(".") > -1) {
          while (text.substring(text.length - 1) == "0") {
            text = text.substring(0, text.length - 1);
          }
          value = parseFloat(text);
        }

      }
      return value;
    }
  }

  knob.onkeydown = (e) => keyDownHandler(e);
  knob.onwheel = (e) => wheelHandler(e);

  knob.onpointerdown = (e) => pointerDownHandler(e);
  knob.onpointermove = (e) => pointerMoveHandler(e);
  knob.onpointerup = (e) => pointerUpHandler(e);
  knob.onpointerleave = (e) => pointerLeaveHandler(e);

  //Logger.log("Knob events done", knob);

  knobInput.onchange = () => {
    setKnobValue(parseFloat(knobInput.value));
  }

  function keyDownHandler(e: KeyboardEvent) {
    let valueStep = !e.shiftKey ? knobDefinition.stepSize : knobDefinition.largeStepSize;
    switch (e.key) {
      case "ArrowDown":
        decreaseValue(valueStep);
        e.preventDefault();
        e.stopPropagation();
        break;
      case "ArrowUp":
        increaseValue(valueStep);
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  }

  function wheelHandler(e: WheelEvent) {
    if (e.deltaY == 0)
      return;

    let valueStep = !e.shiftKey ? knobDefinition.stepSize : knobDefinition.largeStepSize;

    if (e.deltaY > 0)
      decreaseValue(valueStep);
    else if (e.deltaY < 0)
      increaseValue(valueStep);
    e.preventDefault();
    e.stopPropagation();
  }

  function pointerDownHandler(e: PointerEvent) {
    mouseDown = true;

    if (_doubleTapTimer) {
      doubleTap();
      stopLongTouchTimer();
      return;
    }
    else {
      startLongTouchTimer();
      startDoubleTapTimer();
    }


    // if (knobUIModes.wobbleConfigMode.isActive)
    // return;

    mouseY = e.y;
    angle = knobInput.dataset.angle ? parseFloat(knobInput.dataset.angle) : 0;
    pointerType = e.pointerType;
  }

  function pointerMoveHandler(e: PointerEvent) {
    document.dispatchEvent(new CustomEvent("PointerMoved", { detail: { element: knob, event: window.event } }));

    if (knobUIModes.wobbleConfigMode.isActive)
      return;

    if (!mouseDown) return;

    let verticalPointerMovement = mouseY - e.y;
    let multiplier = (pointerType == "mouse") ? 180 : 90;
    let circleMovement = (verticalPointerMovement / knob.clientHeight) * multiplier;

    newAngle = angle + circleMovement
    if (newAngle < -135)
      newAngle = -135;
    else if (newAngle > 135)
      newAngle = 135;

    let angleOffset = newAngle - knobDefinition.minAngle;
    let angleRatio = angleOffset / knobDefinition.angleRange;
    let ticks = Math.round(angleRatio * (knobDefinition.ticks - 1));
    let value = knobDefinition.min + (ticks * knobDefinition.stepSize);
    //let value = knobDefinition.min + Math.round(angleRatio * (knobDefinition.steps - 1));
    setKnobValue(value, newAngle);
  }

  function pointerUpHandler(e: PointerEvent) {
    if (_longTouchTimer) {
      stopLongTouchTimer();
    }
    if (knobUIModes.wobbleConfigMode.isActive)
      return;

    mouseDown = false;
    knobInput.dataset.angle = newAngle.toString();
  }

  function pointerLeaveHandler(e: PointerEvent) {
    if (!mouseDown)
      return;

    document.addEventListener("pointermove", pointerMoveHandler);
    document.addEventListener("pointerup", documentPointerUpHandler);
  }

  function documentPointerUpHandler(e: PointerEvent) {
    pointerUpHandler(e);
    document.removeEventListener("pointermove", pointerMoveHandler);
    document.removeEventListener("pointerup", documentPointerUpHandler);
  }

  let _longTouchTimer: number | null;
  let _longTouchDuration = 1000;

  let _doubleTapTimer: number | null;
  let _doubleTapDuration = 500;

  let _longTouchEvent;
  let _longTouchPosition;

  //  Logger.log("Long touch confife", knob);

  function startLongTouchTimer() {
    _longTouchTimer = setTimeout(longTouch, _longTouchDuration);
  }

  function longTouch() {
    if (!_longTouchTimer)
      return;

    stopLongTouchTimer();
  }

  function stopLongTouchTimer() {
    if (_longTouchTimer) {
      clearTimeout(_longTouchTimer);
      _longTouchTimer = null;
      // Logger.log("Cleared long touch timer");
    }
  }

  function startDoubleTapTimer() {
    _doubleTapTimer = setTimeout(doubleTapTimeElapsed, _doubleTapDuration);
    //Logger.log("Start double tap detection");
  }

  function stopDoubleTapTimer() {
    if (!_doubleTapTimer)
      return;
    //Logger.log(`Stop double tap timer for ${knobInput.name}`);
    clearTimeout(_doubleTapTimer);
    _doubleTapTimer = null;
  }

  function doubleTapTimeElapsed() {
    //Logger.log(`No double tap detected for ${knobInput.name} in ${_doubleTapDuration}`);
    stopDoubleTapTimer();
  }

  function doubleTap() {
    // Logger.log("Double tap detected for " + knobInput.name);
    clearTimeout(_doubleTapTimer!);
    _doubleTapTimer = null;
    document.dispatchEvent(new CustomEvent("DoubleTap", { detail: { element: knob } }));
  }

  function getEventElementPosition(e: TouchEvent) {
    let target: EventTarget = e.target ? e.target : e.touches[0]!.target;
    var rect = (target as HTMLElement).getBoundingClientRect();
    let clientX = e.touches ? e.touches[0]!.clientX : rect.x;
    let clientY = e.touches ? e.touches[0]!.clientY : rect.y;
    var position = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    return position;
  }

  function decreaseValue(valueToDecrease: number) {
    let newValue = parseFloat(knobInput.value) - valueToDecrease;
    setKnobValue(newValue);
    //Logger.log(`decreaseValue with ${valueToDecrease}`);
  }

  function increaseValue(valueToIncrease: number) {
    let newValue = parseFloat(knobInput.value) + valueToIncrease;
    setKnobValue(newValue);
  }
}

export function setupKnobs(className: string = "knob") {
  (document.querySelectorAll(`.${className}`) as NodeListOf<HTMLElement>).forEach(knob => setupKnob(knob));
}
