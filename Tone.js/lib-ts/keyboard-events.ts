export class KeyDownEvent {
  static subscribe(eventHandler: Function) {
    addEventListener("keydown", (eventInfo) => { eventHandler(eventInfo); }, true);
  }
}

export class KeyUpEvent {
  static subscribe(eventHandler: Function) {
    addEventListener("keyup", (eventInfo) => { eventHandler(eventInfo); });
  }
}