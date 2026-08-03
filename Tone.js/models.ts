
export class Session {
  _project: Project;

  constructor() {
    this._project = new Project();
  }

  get project() { return this._project; }

  start(time: Tone.Time) {
    this.project.start(time);
    Tone.getTransport().start(time + 0.5);
  }

  async loadProject(projectFilePath: string) {
    await fetch(`.\\${projectFilePath}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(projectFile => {
        this._project = new Project(projectFile);
        console.log("Project loaded", this._project);
      })
      .catch(error => {
        console.error('Error loading JSON:', error);
      });
  }
}

export type ProjectFileDeviceParameter = { value: string | number; };
export type ProjectFileDeviceParameters = { [parameterName: string]: ProjectFileDeviceParameter };
export type ProjectFileDevice = { [deviceName: string]: ProjectFileDeviceParameters };
export type ProjectFileTrackLoopNote = { note: string, duration: string | number, timeOffset: number, velocity: number };
export type ProjectFileTrackLoop = { notes: ProjectFileTrackLoopNote[], startTime: string | number, length: string | number };
export type ProjectFileTrackAutomation = { deviceIndex: number, parameter: string, startTime: string | number, rampTime: string | number, value: number };
export type ProjectFileTrack = { id: string, name: string, volume: number, devices: ProjectFileDevice[], loop: ProjectFileTrackLoop, automations: ProjectFileTrackAutomation[] };
export type ProjectFile = { name: string, tempo: number, tracks: ProjectFileTrack[] };

class Project {
  _projectFile: ProjectFile;
  _masterChannel;
  _tracks: Track[] = [];

  constructor(projectFile: ProjectFile = {
    "name": "My Project",
    "tempo": 146,
    "tracks": []
  }) {
    this._projectFile = projectFile;
    this._masterChannel = new Tone.Channel();
    this._masterChannel.receive("master");
    this._masterChannel.toDestination();

    this._projectFile.tracks.forEach(projectFileTrack =>
      this._tracks.push(new Track(projectFileTrack)));
  }

  get name() { return this._projectFile.name; }
  set name(value) { this._projectFile.name = value; }

  get tempo() { return this._projectFile.tempo; }
  set tempo(value) { this._projectFile.tempo = value; }

  get masterChannel() { return this._masterChannel; }
  get tracks() { return this._tracks; }

  start(time: Tone.Time) {
    this.tracks.forEach(track => track.start(time));
  }
}

class Track {
  _projectFileTrack;
  _channel: Tone.Channel;
  _devices: any[] = [];
  _loopInstance: Tone.Loop | null = null;
  _automations: Automation[] = [];

  constructor(projectFileTrack: ProjectFileTrack) {
    this._projectFileTrack = projectFileTrack;
    this._channel = new Tone.Channel();
    this._channel.send("master", 0);

    this._projectFileTrack.devices.forEach(projectFileDevice => {
      let deviceName: string = Object.keys(projectFileDevice)[0]!;
      this.addDevice(deviceName, projectFileDevice[deviceName]!);
    });

    this._generateLoopInstance();
    this._generateAutomations();
  }

  get id() { return this._projectFileTrack.id; }
  set id(value) { this._projectFileTrack.id = value; }

  get name() { return this._projectFileTrack.name; }
  set name(value) { this._projectFileTrack.name = value; }

  get volume() { return this._projectFileTrack.volume; }
  set volume(value) { this._projectFileTrack.volume = value; }

  get channel() { return this._channel; }

  get devices() { return this._devices; }
  get instrument() { return this._devices[0]; }

  get loopNotes() { return this._projectFileTrack.loop.notes; }
  set loopNotes(value) {
    this._projectFileTrack.loop.notes = value;
    this._generateLoopInstance();
  }

  get loopLength() { return this._projectFileTrack.loop.length; }
  set loopLength(value) {
    this._projectFileTrack.loop.length = value;
    this._generateLoopInstance();
  }

  get loopStartTime() { return this._projectFileTrack.loop.startTime; }
  set loopStartTime(value) {
    this._projectFileTrack.loop.startTime = value;
    this._generateLoopInstance();
  }

  get automations() { return this._automations; }

  addDevice(deviceName: any, deviceParams: ProjectFileDeviceParameters) {
    // Tone is a module with many constructors; deviceName comes from JSON so
    // index into Tone with a dynamic key. Cast to any to satisfy TypeScript.
    const DeviceCtor = (Tone as any)[deviceName];
    if (typeof DeviceCtor !== 'function') {
      throw new Error(`Device not found on Tone: ${deviceName}`);
    }
    const deviceInstance = new DeviceCtor(deviceParams);
    this._devices.push(deviceInstance);
  }

  start(time: Tone.Time) {
    this.automations.forEach(automation => automation.generate(time));
  }

  _generateLoopInstance() {
    this._loopInstance = new Tone.Loop((time) => {
      let adjustedTime = time + 0.1;
      console.log(`Playing loop on ${this.name} at ${adjustedTime}, now=${Tone.now()}`);
      this._projectFileTrack.loop.notes.forEach(note => {
        let noteTime = adjustedTime + (Tone.Time("16n") * note.timeOffset);
        console.log(`Playing note ${note.note} on ${this.name} at ${noteTime}, now=${Tone.now()}`);
        this.instrument.triggerAttackRelease(
          note.note, note.duration, noteTime, note.velocity / 127);
      });
    }); //, this._projectFileTrack.loop.length);
    this._loopInstance.start(Tone.now() + Tone.Time(this._projectFileTrack.loop.startTime));
    //this._loopInstance.start(Tone.now() + Tone.Time(this._projectFileTrack.loop.startTime));
    // this._loopInstance = new Tone.Loop((time: Tone.Time) => {
    //   console.log(`Playing loop on track ${this.name} at ${time}, now=${Tone.now()} `);
    //   this._projectFileTrack.loop.notes.forEach(note => {
    //     let noteTime = time + (Tone.Time("16n").toMilliseconds() * note.timeOffset);
    //     if (noteTime < Tone.now()) {
    //       console.warn(`Playing note ${note.note} on track ${this.name} at ${noteTime} too late, now=${Tone.now()}`);
    //     }
    //     else {
    //       console.log(`Playing note ${note.note} on track ${this.name} at ${noteTime}, now=${Tone.now()}`);
    //     }
    //     try {
    //       this.instrument.triggerAttackRelease(note.note, note.duration, noteTime, note.velocity / 127);
    //     }
    //     catch (error) {
    //       console.warn(`Error ${error} while trying to play note ${note.note} on track ${this.name} at ${noteTime}, now=${Tone.now()}`);
    //     }

    //   });
    // }, this._projectFileTrack.loop.length);
    // this._loopInstance.start(Tone.Time(this._projectFileTrack.loop.startTime).toSeconds());
  }

_loopFunction(time: Tone.Time) {
  console.log(`Playing loop on ${this.name} at ${time}, now=${Tone.now()}`);
  this._projectFileTrack.loop.notes.forEach(note => {
    let noteTime = time + (Tone.Time("16n") * note.timeOffset);
    console.log(`Playing note ${note.note} on ${this.name} at ${noteTime}, now=${Tone.now()}`);
    this.instrument.triggerAttackRelease(
      note.note, note.duration, noteTime, note.velocity / 127);
  });
  // console.log(`Playing loop on track ${this.name} at ${time}, now=${Tone.now()} `);
  // this._projectFileTrack.loop.notes.forEach(note => {
  //   let noteTime = time + (Tone.Time("16n").toMilliseconds() * note.timeOffset);
  //   if (noteTime < Tone.now()) {
  //     console.warn(`Playing note ${note.note} on track ${this.name} at ${noteTime}, now=${Tone.now()}`);
  //   }
  //   else {
  //     console.log(`Playing note ${note.note} on track ${this.name} at ${noteTime}, now=${Tone.now()}`);
  //   }
  //   this.instrument.triggerAttackRelease(note.note, note.duration, noteTime, note.velocity / 127);
  // });
}

_generateAutomations() {
  this._projectFileTrack.automations.forEach(projectFileAutomation =>
    this._automations.push(new Automation(this, projectFileAutomation)));
}
}

class Automation {
  _track: Track;
  _projectFileAutomation: ProjectFileTrackAutomation;
  constructor(track: Track, projectFileAutomation: ProjectFileTrackAutomation) {
    this._track = track;
    this._projectFileAutomation = projectFileAutomation;
  }

  get deviceIndex() { return this._projectFileAutomation.deviceIndex; }
  get parameter() { return this._projectFileAutomation.parameter; }
  get value() { return this._projectFileAutomation.value; }
  set value(value) {
    this._projectFileAutomation.value = value;
  }

  get startTime() { return this._projectFileAutomation.startTime; }
  set startTime(value) {
    this._projectFileAutomation.startTime = value;
  }

  get rampTime() { return this._projectFileAutomation.rampTime; }
  set rampTime(value) {
    this._projectFileAutomation.rampTime = value;
  }

  get device() { return this._track.devices[this.deviceIndex]; }
  get parameterPathParts() { return this.parameter.split("."); }
  get parameterName() { return this.parameterPathParts[this.parameterPathParts.length - 1]; }

  generate(time: Tone.Time) {
    let parameter = this.device[this.parameterPathParts[0]!];
    for (let parameterPathIndex = 1; parameterPathIndex < this.parameterPathParts.length; parameterPathIndex++) {
      parameter = parameter[this.parameterPathParts[parameterPathIndex]!];
    }
    let rampDuration = time + Tone.Time(this.rampTime).toSeconds();
    let startTime = time + Tone.Time(this.startTime).toSeconds();
    console.log(`Ramping up ${this._track.name}.${this.parameterName} to ${this.value} in ${rampDuration} at ${startTime}`);
    parameter.rampTo(this.value, rampDuration, startTime);
  }
}
