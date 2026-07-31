export class CustomEventBase<T> extends CustomEvent<T> {
  constructor(eventName: string, detail: CustomEventInit<T>) {
    super(eventName, detail)
  }

  send() {
    document.dispatchEvent(this);
  }

  static addEventListener(eventName: string, eventHandler: Function) {
    document.addEventListener(eventName, (eventInfo) => { eventHandler(eventInfo); });
  }
}
