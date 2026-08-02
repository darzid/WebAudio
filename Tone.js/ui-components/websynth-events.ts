import { CustomEventBase } from "../lib-ts/custom-event-base";

export class StartPlayingEvent {
  static _name = "StartPlayingEvent";
  static send(): void {
    const evt = new CustomEvent(StartPlayingEvent._name);
    document.dispatchEvent(evt);
  }

  static subscribe(eventHandler: Function): void {
    CustomEventBase.addEventListener(StartPlayingEvent._name, eventHandler);
  }
}

export class StopPlayingEvent {
  static _name = "StopPlayingEvent";
  static send(): void {
    const evt = new CustomEvent(StopPlayingEvent._name);
    document.dispatchEvent(evt);
  }

  static subscribe(eventHandler: Function): void {
    CustomEventBase.addEventListener(StopPlayingEvent._name, eventHandler);
  }
}

export class TempoChangedEvent {
  static _name = "TempoChangedEvent";
  static send(beatsPerMinute: Number): void {
    const evt = new CustomEvent(TempoChangedEvent._name, { detail: { beatsPerMinute: beatsPerMinute } });
    document.dispatchEvent(evt);
  }

  static subscribe(eventHandler: Function): void {
    CustomEventBase.addEventListener(TempoChangedEvent._name, eventHandler);
  }
}

export class NoteEventDetails {
  trackId: string;
  note: string;

  constructor(trackId: string, note: string) {
    this.trackId = trackId;
    this.note = note;
  }
}

export class PlayNoteRequestEvent {
  static _name = "PlayNoteRequestEvent";
  static send(trackId: string, note: string, velocity: number = 127, time: number | null = null) {
    const evt = new CustomEvent(PlayNoteRequestEvent._name, { detail: { trackId: trackId, note: note, velocity: velocity, time: time } });
    console.log("sending PlayNoteREquest")
    document.dispatchEvent(evt);
    console.log("sent PlayNoteREquest" + note)
  }
  static subscribe(eventHandler: Function) {
    CustomEventBase.addEventListener(PlayNoteRequestEvent._name, eventHandler);
  }
}

export class NotePlayingEvent {
  static _name = "NotePlayingEvent";
  static send(trackId: string, note: string) {
    const evt = new CustomEvent(NotePlayingEvent._name, { detail: { trackId: trackId, note: note } });
    document.dispatchEvent(evt);
  }
  static subscribe(eventHandler: Function) {
    CustomEventBase.addEventListener(NotePlayingEvent._name, eventHandler);
  }
}

export class StopNoteRequestEvent {
  static _name = "StopNoteRequestEvent";
  static send(trackId: string, note: string, time: number | null = null) {
    const evt = new CustomEvent(StopNoteRequestEvent._name, { detail: { trackId: trackId, note: note, time: time } });
    document.dispatchEvent(evt);
  }
  static subscribe(eventHandler: Function) {
    CustomEventBase.addEventListener(StopNoteRequestEvent._name, eventHandler);
  }
}

export class NoteStoppedEvent {
  static _name = "NoteStoppedEvent";
  static send(trackId: string, note: string) {
    console.log(`${NoteStoppedEvent._name}: send(trackId: ${trackId}, note: ${note}`);
    const evt = new CustomEvent(NoteStoppedEvent._name, { detail: { trackId: trackId, note: note } });
    document.dispatchEvent(evt);
  }
  static subscribe(eventHandler: Function) {
    CustomEventBase.addEventListener(NoteStoppedEvent._name, eventHandler);
  }
}

// export class TrackAddedEvent {
//   static _name = "TrackAddedEvent";

//   static send(track: Track) {
//     const evt = new CustomEvent(TrackAddedEvent._name, { detail: { trackId: track.trackId, track: track } });
//     document.dispatchEvent(evt);
//   }

//   static subscribe(eventHandler: Function) {
//     CustomEventBase.addEventListener(TrackAddedEvent._name, (eventInfo: any) => {
//       eventHandler(eventInfo);
//     });
//   }
// }

// export class TrackRemovedEvent {
//   static _name = "TrackRemovedEvent";

//   static send(trackId: string) {
//     const evt = new CustomEvent(TrackRemovedEvent._name, { detail: { trackId: trackId } });
//     document.dispatchEvent(evt);
//   }

//   static subscribe(eventHandler: Function) {
//     CustomEventBase.addEventListener(TrackRemovedEvent._name, (eventInfo: any) => {
//       eventHandler(eventInfo);
//     });
//   }
// }

// export class DeviceParameterEventDetailsBase {
//   sender: string;
//   deviceId: string;
//   parameterName: string;

//   constructor(sender: string, deviceId: string, parameterName: string) {
//     this.sender = sender;
//     this.deviceId = deviceId;
//     this.parameterName = parameterName;
//   }
// }

// export class DeviceParameterValueEventDetails extends DeviceParameterEventDetailsBase {
//   parameterValue: string | number;

//   constructor(sender: string, deviceId: string, parameterName: string, parameterValue: string | number) {
//     super(sender, deviceId, parameterName)

//     this.parameterValue = parameterValue;
//   }
// }

// export class DeviceParameterChangeRequestEvent {
//   static _name = "DeviceParameterChangeRequestEvent";

//   static send(sender: string, deviceId: string, parameterName: string, parameterValue: string | number) {
//     //console.debug(`${DeviceParameterChangeRequestEvent._name}: send(sender: ${sender}, deviceId: ${deviceId}, parameterName: ${parameterName}, parameterValue: ${parameterValue}`);
//     const evt = new CustomEvent(DeviceParameterChangeRequestEvent._name, { detail: { sender: sender, deviceId: deviceId, parameterName: parameterName, parameterValue: parameterValue } });
//     document.dispatchEvent(evt);
//   }

//   static subscribe(deviceId: string, parameterName: string, eventHandler: Function) {
//     CustomEventBase.addEventListener(DeviceParameterChangeRequestEvent._name, (eventInfo: any) => {
//       if (eventInfo.detail.deviceId == deviceId && (parameterName == "*" || parameterName == eventInfo.detail.parameterName)) eventHandler(eventInfo);
//     });
//   }
// }

// export class DeviceParameterChangedEvent {
//   static _name = "DeviceParameterChangedEvent";
//   static send(sender: string, deviceId: string, parameter: IDeviceParameter) {
  
//     const evt = new CustomEvent(DeviceParameterChangedEvent._name, { detail: { sender: sender, deviceId: deviceId, parameterName: parameter.name, parameterValue: parameter.value } });
//     document.dispatchEvent(evt);
  
    
//   }
//   static subscribe(deviceId: string = "*", parameterName: string = "*", eventHandler: Function) {
//     CustomEventBase.addEventListener(DeviceParameterChangedEvent._name, (eventInfo: any) => {
//       if ((deviceId == "*" || eventInfo.detail.deviceId == deviceId) && (parameterName == "*" || parameterName == eventInfo.detail.parameterName)) 
//         eventHandler(eventInfo);
//     });
//   }
// }

// export class DeviceParameterVisibilityChangedEvent {
//   static _name = "DeviceParameterVisibilityChangedEvent";
//   static send(sender: string, deviceId: string, parameterName: string, isVisible: boolean) {
//     const evt = new CustomEvent(DeviceParameterVisibilityChangedEvent._name, { detail: { sender: sender, deviceId: deviceId, parameterName: parameterName, isVisible: isVisible } });
//     document.dispatchEvent(evt);
//   }
//   static subscribe(eventHandler: Function) {
//     CustomEventBase.addEventListener(DeviceParameterVisibilityChangedEvent._name, eventHandler);
//   }
// }

// export class DeviceCreatedEvent {
//   static _name = "DeviceCreatedEvent";
//   static send(deviceType: string, device: IDevice, deviceParams: any) {
//     const evt = new CustomEvent(DeviceCreatedEvent._name, { detail: { deviceType: deviceType, device: device, deviceParams: deviceParams } });
//     document.dispatchEvent(evt);
//   }
//   static subscribe(eventHandler: Function) {
//     CustomEventBase.addEventListener(DeviceCreatedEvent._name, eventHandler);
    
//   }
// }

// export class DeviceEnableDisableRequestEvent {
//   static _name = "DeviceEnableDisableRequestEvent";
//   static send(deviceId: string, isEnabled: boolean) {
//     const evt = new CustomEvent(DeviceEnableDisableRequestEvent._name, { detail: { deviceId: deviceId, isEnabled: isEnabled } });
//     document.dispatchEvent(evt);
//   }
//   static subscribe(eventHandler: Function) {
//     CustomEventBase.addEventListener(DeviceEnableDisableRequestEvent._name, eventHandler);
    
//   }
// }

// export class DeviceEnableDisableChangedEvent {
//   static _name = "DeviceEnableDisableChangedEvent";
//   static send(deviceId: string, isEnabled: boolean) {
//     const evt = new CustomEvent(DeviceEnableDisableChangedEvent._name, { detail: { deviceId: deviceId, isEnabled: isEnabled } });
//     document.dispatchEvent(evt);
//   }
//   static subscribe(eventHandler: Function) {
//     CustomEventBase.addEventListener(DeviceEnableDisableChangedEvent._name, eventHandler);
    
//   }
// }
