import type { ElementHandler } from "./element-handler";

export class DeviceFactory {
  create(typename: string, element: HTMLElement, cssClass: string) : ElementHandler | null {
    return null;
  }
}
