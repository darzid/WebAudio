// function setupKnob(knob: HTMLInputElement) {

//   class WobbleMode extends ElementUIMode {
//     constructor(knob: HTMLInputElement) {
//       super(knob, "wobble", "DoubleTap", "DoubleTap",
//         {
//           framesPerSecond: 100,
//           startValue: 0
//         },
//         {
//           wobbleDepth: 0,
//           wobbleRate: 0,
//           radianStepPerFrame: 0,
//           wobbleRange: 0,
//           wobbleValue: 0,
//           currentRadian: 0
//         });
//       this._processWobbleChangeEventHandler = (e) => this.processWobbleChangeEvent(e);
//     }

//     activate(e) {
//       if (knobUIModes.wobbleConfigMode.isActive)
//         return;

//       super.activate(e);
//       this.initialState.startValue = parseFloat(knobInput.value);
//       this.currentState.wobbleRate = parseFloat(this.element.dataset.wobbleRate);
//       this.currentState.wobbleDepth = parseFloat(this.element.dataset.wobbleDepth);

//       this.calculateWobble();
//       document.addEventListener("WobbleChange", this._processWobbleChangeEventHandler);

//       consoleLog(`Start wobbling:`, this.initialState, this.currentState);

//       window.setTimeout(() => this.wobbleValue(), 1000 / this.initialState.framesPerSecond);
//     }

//     processWobbleChangeEvent(e) {
//       if (e.detail.element == this.element) {
//         this.currentState.wobbleDepth = e.detail.wobbleDepth;
//         this.currentState.wobbleRate = e.detail.wobbleRate;
//         this.calculateWobble();
//         consoleLog("WobbleChange", this.currentState)
//       }
//     }

//     calculateWobble() {
//       this.currentState.wobbleRange = (knobDefinition.valueRange / 2) * this.currentState.wobbleDepth;
//       this.currentState.currentRadian = 0;
//       this.currentState.radianStepPerFrame = ((2 * Math.PI) * this.currentState.wobbleRate) / this.initialState.framesPerSecond;
//     }

//     wobbleValue() {
//       if (this.isActive) {
//         let valueWobble = this.initialState.startValue + Math.sin(this.currentState.currentRadian) * this.currentState.wobbleRange;
//         this.currentState.wobbleValue = valueWobble.toFixed(knobDefinition.valueDecimals);
//         setKnobValue(parseFloat(this.currentState.wobbleValue));
//         this.currentState.currentRadian += this.currentState.radianStepPerFrame;

//         window.setTimeout(() => this.wobbleValue(), 1000 / this.initialState.framesPerSecond);
//       }
//     }

//     deactivate() {
//       if (knobUIModes.wobbleConfigMode.isActive)
//         return;
//       document.removeEventListener("WobbleChange", this._processWobbleChangeEventHandler);
//       setKnobValue(this.initialState.startValue);
//       super.deactivate();
//     }
//   }

//   class WobbleConfigMode extends ElementUIMode {
//     noMovementTimer;
//     noMovementDuration = 5000;

//     constructor(knob) {
//       super(knob, "wobble-config", "", "DoubleTap",
//         {
//           framesPerSecond: 100,
//           x: 0,
//           y: 0,
//           wobbleDepth: 0,
//           wobbleRate: 0,
//           targetRectangle: knob.getBoundingClientRect()
//         },
//         {
//           wobbleDepth: 0,
//           wobbleRate: 0,
//           deltaX: 0,
//           deltaY: 0
//         });
//     }

//     get isDisabled() { return knobUIModes.wobbleMode.isDisabled; }

//     activate(e) {
//       super.activate(e);
//       consoleLog(e);

//       //document.dispatchEvent(new CustomEvent("WobbleConfigStarted", { detail: {element: knob }}));

//       this.initialState.wobbleDepth = parseFloat(this.element.dataset.wobbleDepth);
//       this.initialState.wobbleRate = parseFloat(this.element.dataset.wobbleRate);
//       this.currentState.wobbleDepth = this.initialState.wobbleDepth;
//       this.currentState.wobbleRate = this.initialState.wobbleRate;

//       this.initialState.x = e.detail.event.clientX - this.initialState.targetRectangle.left;
//       this.initialState.y = e.detail.event.clientY - this.initialState.targetRectangle.top;

//       this.initialState.startValue = parseFloat(knobInput.value);
//       this.currentState.wobbleRange = (knobDefinition.valueRange / 2) * this.currentState.wobbleDepth;
//       this.currentState.currentRadian = 0;
//       this.currentState.radianStepPerFrame = ((2 * Math.PI) * this.currentState.wobbleRate) / this.initialState.framesPerSecond;
//       this.element.addEventListener("touchmove", (e) => this.pointerMove(e));
//       //this.noMovementTimer = setTimeout(() => this.noMovementDetected(), this.noMovementDuration);
//       consoleLog(`Start wobble config:`, this.initialState, this.currentState);
//     }

//     pointerMove(e) {
//       //consoleLog("PointerMoved", e)
//       if (this.isActive) {
//         var position = getEventElementPosition(e);
//         this.currentState.deltaX = position.x - this.initialState.x;
//         this.currentState.deltaY = 0 - (position.y - this.initialState.y);
//         let deltaXToWidthRatio = this.currentState.deltaX / this.initialState.targetRectangle.width;
//         let deltaYToHeightRatio = this.currentState.deltaY / this.initialState.targetRectangle.height;

//         this.currentState.wobbleDepth = this.initialState.wobbleDepth + (deltaYToHeightRatio * this.initialState.wobbleDepth);
//         this.currentState.wobbleRate = this.initialState.wobbleRate + (deltaXToWidthRatio * this.initialState.wobbleRate);

//         document.dispatchEvent(new CustomEvent("WobbleChange", { detail: { element: knob, wobbleDepth: this.currentState.wobbleDepth, wobbleRate: this.currentState.wobbleRate } }));

//         // clearTimeout(() => this.noMovementTimer);
//         //this.noMovementTimer = setTimeout(() => this.noMovementDetected(), this.noMovementDuration);
//         consoleLog("Move", this.initialState, this.currentState)
//         //consoleLog(`X=${position.x}, Y=${position.y}, DX=${_wobbleConfigDeltaX}, DY=${_wobbleConfigDeltaY}, XR=${deltaXToWidthRatio}, YR=${deltaYToHeightRatio}, WCD=${_wobbleConfigNewDepth}, WCR=${_wobbleConfigNewRate}`);
//       }
//     }

//     noMovementDetected() {
//       consoleLog(`No movement detected for ${this.name}`);
//       super.deactivate();
//       consoleLog(`Called super.deactivate for ${this.name}`);
//     }

//     /*    deactivate() {
//           //this.element.dataset.wobbleDepth = this.currentState.wobbleDepth;
//          // this.element.dataset.wobbleRate = this.currentState.wobbleRate;
//           //document.dispatchEvent(new CustomEvent("WobbleChange", { detail: {element: knob, wobbleDepth: this.currentState.wobbleDepth, wobbleRate: this.currentState.wobbleRate}}));
//           super.deactivate();
//         }*/
//   }

//   let knobInput = (knob.nodeName == "INPUT") ? knob : knob.querySelector("input");
//   if (!knobInput) {
//     consoleError("Knob input element not found", knob);
//     return;
//   }

//   let knobSvg = knob.querySelector("svg");
//   let knobValueLabel = knob.querySelector(".value-label");
//   let dial = knob.querySelector(".dial");
//   let line = knob.querySelector(".position-line");

//   if (isNaN(knobInput.min)) {
//     consoleError("Knob value is not a number", knobInput);
//     return;
//   }

//   //consoleLog("Setup knob " + knob.name, knob);
//   let knobMin = knobInput.min ? parseFloat(knobInput.getAttribute("min")) : 0;
//   let knobMax = knobInput.max ? parseFloat(knobInput.max) : 100;
//   let stepSize = knobInput.step ? parseFloat(knobInput.step) : 1;
//   let knobDefinition = {
//     minAngle: -135,
//     maxAngle: 135,
//     steps: 1 + (knobMax - knobMin),
//     min: knobMin,
//     max: knobMax,
//     valueRange: knobMax - knobMin,
//     stepSize: stepSize,
//     valueDecimals: stepSize.toString().split(".")[1]?.length || 0,
//     largeStepSize: stepSize * 10,
//     ticks: 1 + (knobMax - knobMin) / stepSize
//   }
//   if (knobDefinition.largeStepSize > knobDefinition.valueRange) {
//     knobDefinition.largeStepSize = knobDefinition.stepSize;
//   }

//   knobDefinition.angleRange = knobDefinition.maxAngle - knobDefinition.minAngle;
//   knobDefinition.stepAngle = knobDefinition.angleRange / (knobDefinition.steps - 1);
//   knobDefinition.tickAngle = knobDefinition.angleRange / (knobDefinition.ticks - 1);

//   if (knobMin < 0) {
//     //consoleLog("min knob", knob)
//   }
//   if (stepSize == 1) {
//     //    consoleLog("Knob " + knob.getAttribute("name"), knobDefinition)
//   }

//   knob.dataset.wobbleRate = 0.25;
//   knob.dataset.wobbleDepth = 0.25;

//   setKnobValue(parseFloat(knobInput.value));

//   let knobUIModes = {
//     wobbleMode: new WobbleMode(knob),
//     wobbleConfigMode: new WobbleConfigMode(knob)
//   };
//   let mouseDown = false;
//   let mouseY = null, deltaY = null;
//   let pointerType = null;

//   let prevAngle = 0;
//   let newAngle = 0;
//   let angle = 0;

//   knob.onkeydown = () => keyDownHandler();
//   knob.onwheel = () => wheelHandler();

//   knob.onpointerdown = () => pointerDownHandler();
//   knob.onpointermove = () => pointerMoveHandler();
//   knob.onpointerup = () => pointerUpHandler();
//   knob.onpointerleave = () => pointerLeaveHandler();


//   knobInput.onchange = () => {
//     setKnobValue(parseFloat(knobInput.value));
//   }

//   function keyDownHandler() {
//     let valueStep = !window.event.shiftKey ? knobDefinition.stepSize : knobDefinition.largeStepSize;
//     switch (window.event.key) {
//       case "ArrowDown":
//         decreaseValue(valueStep);
//         window.event.preventDefault();
//         window.event.stopPropagation();
//         break;
//       case "ArrowUp":
//         increaseValue(valueStep);
//         window.event.preventDefault();
//         window.event.stopPropagation();
//         break;
//     }
//   }

//   function wheelHandler() {
//     if (window.event.deltaY == 0)
//       return;

//     let valueStep = !window.event.shiftKey ? knobDefinition.stepSize : knobDefinition.largeStepSize;

//     if (window.event.deltaY > 0)
//       decreaseValue(valueStep);
//     else if (window.event.deltaY < 0)
//       increaseValue(valueStep);
//     window.event.preventDefault();
//     window.event.stopPropagation();
//   }

//   function pointerDownHandler() {
//     mouseDown = true;

//     if (_doubleTapTimer) {
//       doubleTap();
//       stopLongTouchTimer();
//       return;
//     }
//     else {
//       startLongTouchTimer(window.event);
//       startDoubleTapTimer(window.event);
//     }


//    // if (knobUIModes.wobbleConfigMode.isActive)
//      // return;

//     mouseY = window.event.y;
//     angle = knobInput.dataset.angle ? parseFloat(knobInput.dataset.angle) : 0;
//     pointerType = window.event.pointerType;
//   }

//   function pointerMoveHandler() {
//     document.dispatchEvent(new CustomEvent("PointerMoved", { detail: { element: knob, event: window.event } }));

//     if (knobUIModes.wobbleConfigMode.isActive)
//       return;

//     if (!mouseDown) return;

//     let verticalPointerMovement = mouseY - window.event.y;
//     let multiplier = (pointerType == "mouse") ? 180 : 90;
//     let circleMovement = (verticalPointerMovement / knob.clientHeight) * multiplier;

//     newAngle = angle + circleMovement
//     if (newAngle < -135)
//       newAngle = -135;
//     else if (newAngle > 135)
//       newAngle = 135;

//     let angleOffset = newAngle - knobDefinition.minAngle;
//     let angleRatio = angleOffset / knobDefinition.angleRange;
//     let ticks = Math.round(angleRatio * (knobDefinition.ticks - 1));
//     let value = knobDefinition.min + (ticks * knobDefinition.stepSize);
//     //let value = knobDefinition.min + Math.round(angleRatio * (knobDefinition.steps - 1));
//     setKnobValue(value, newAngle);
//   }

//   function pointerUpHandler() {
//     if (_longTouchTimer) {
//       stopLongTouchTimer();
//     }
//     if (knobUIModes.wobbleConfigMode.isActive)
//       return;

//     mouseDown = false;
//     knobInput.dataset.angle = newAngle;
//   }

//   function pointerLeaveHandler() {
//     if (!mouseDown)
//       return;

//     document.addEventListener("pointermove", pointerMoveHandler);
//     document.addEventListener("pointerup", documentPointerUpHandler);
//   }

//   function documentPointerUpHandler() {
//     pointerUpHandler();
//     document.removeEventListener("pointermove", pointerMoveHandler);
//     document.removeEventListener("pointerup", documentPointerUpHandler);
//   }

//   let _longTouchTimer;
//   let _longTouchDuration = 1000;

//   let _doubleTapTimer;
//   let _doubleTapDuration = 500;

//   let _longTouchEvent;
//   let _longTouchPosition;

//   function startLongTouchTimer(e) {
//     _longTouchEvent = e;
//     _longTouchTimer = setTimeout(longTouch, _longTouchDuration);
//     consoleLog("Start long touch timer");
//   }

//   function longTouch() {
//     if (!_longTouchTimer)
//       return;

//     consoleLog("Long touch detected", _longTouchEvent);
//     stopLongTouchTimer();
//     document.dispatchEvent(new CustomEvent("LongTouch", { detail: { element: knob, event: _longTouchEvent } }));
//   }

//   function stopLongTouchTimer() {
//     if (_longTouchTimer) {
//       clearTimeout(_longTouchTimer);
//       _longTouchTimer = null;
//       consoleLog("Cleared long touch timer");
//     }
//   }

//   function startDoubleTapTimer() {
//     _doubleTapTimer = setTimeout(doubleTapTimeElapsed, _doubleTapDuration);
//     //consoleLog("Start double tap detection");
//   }

//   function stopDoubleTapTimer() {
//     if (!_doubleTapTimer)
//       return;
//     //consoleLog(`Stop double tap timer for ${knobInput.name}`);
//     clearTimeout(_doubleTapTimer);
//     _doubleTapTimer = null;
//   }

//   function doubleTapTimeElapsed() {
//     //consoleLog(`No double tap detected for ${knobInput.name} in ${_doubleTapDuration}`);
//     stopDoubleTapTimer();
//   }

//   function doubleTap() {
//    // consoleLog("Double tap detected for " + knobInput.name);
//     clearTimeout(_doubleTapTimer);
//     _doubleTapTimer = null;
//     document.dispatchEvent(new CustomEvent("DoubleTap", { detail: { element: knob } }));
//   }

//   function getEventElementPosition(e) {
//     let target = e.target ? e.target : e.touches[0].target;
//     var rect = target.getBoundingClientRect();
//     let clientX = e.touches ? e.touches[0].clientX : e.clientX;
//     let clientY = e.touches ? e.touches[0].clientY : e.clientY;
//     var position = {
//       x: clientX - rect.left,
//       y: clientY - rect.top
//     };
//     return position;
//   }

//   function decreaseValue(valueToDecrease) {
//     let newValue = parseFloat(knobInput.value) - valueToDecrease;
//     setKnobValue(newValue);
//     //consoleLog(`decreaseValue with ${valueToDecrease}`);
//   }

//   function increaseValue(valueToIncrease) {
//     let newValue = parseFloat(knobInput.value) + valueToIncrease;
//     setKnobValue(newValue);
//   }

//   function setKnobValue(value, angle) {
//     if (knobInput.value === value)
//       return;

//     if (value < knobDefinition.min) {
//       value = knobDefinition.min;
//     } else if (value > knobDefinition.max) {
//       value = knobDefinition.max;
//     }

//     //if (! angle)
//     angle = knobDefinition.minAngle + ((value - knobDefinition.min) * knobDefinition.stepAngle);

//     if (dial)
//       dial.style.rotate = angle + "deg";
//     if (line)
//       line.style.rotate = angle + "deg";

//     knobInput.value = value;
//     knobInput.dataset.value = value;
//     if (knobValueLabel) {
//       let listName = knobInput.getAttribute("list");
//       if (listName) {
//         let list = document.getElementById(listName);
//         if (!list) {
//           consoleError("List " + listName + " not found for knob input", knobInput);
//           knobValueLabel.innerHTML = value;
//           return;
//         }
//         let option = list.querySelector("option[value='" + value + "']");
//         if (option) {
//           knobValueLabel.innerHTML = option.innerHTML.trim().substring(0, 7);
//           knobInput.dataset.optionValue = option.innerHTML;
//         }
//         else {
//           knobValueLabel.innerHTML = floatToFixed(value, knobDefinition.valueDecimals);
//         }
//       }
//       else {
//         knobValueLabel.innerHTML = floatToFixed(value, knobDefinition.valueDecimals);
//       }
//     }

//     var evnt = knobInput["oninput"];
//     if (evnt)
//       evnt.call(knobInput);

//     function floatToFixed(value, digits) {
//       if (Math.round(value) != value) {
//         let text = parseFloat(value).toFixed(digits);
//         if (text.indexOf(".") > -1) {
//           while (text.substring(text.length - 1) == "0") {
//             text = text.substring(0, text.length - 1);
//           }
//           value = text;
//         }

//       }
//       return value;
//     }
//   }

// }

// function setupKnobs(className = "knob") {
//   document.querySelectorAll(`.${className}`).forEach(knob => setupKnob(knob));
// }
