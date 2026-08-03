// const { Tone } = require("tone/build/esm/core/Tone");

async function loadProject(session) {
  await fetch('.\\project.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(projectFile => session.project = new Project(projectFile))
    .catch(error => {
      console.error('Error loading JSON:', error);
    });
}

class Project {
  _projectFile;
  _masterChannel;
  _tracks = [];

  constructor(projectFile) {
    this._projectFile = projectFile;
    this._masterChannel = new Tone.Channel({channelCount: 2});
    this._masterChannel.receive("master", 0);
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

  start(time) {
    this.tracks.forEach(track => track.start(time));
  }
}

class Track {
  _projectFileTrack;
  _channel;
  _devices = [];
  _loopInstance;
  _automationDefaults = {};
  _automations = [];

  constructor(projectFileTrack) {
    this._projectFileTrack = projectFileTrack;
    this._channel = new Tone.Channel({ volume: projectFileTrack.volume, pan: projectFileTrack.pan, channelCount: 2 });
    this._channel.send("master", 0);
    this._projectFileTrack.devices.forEach(projectFileDevice =>
      this.addDevice(Object.keys(projectFileDevice)[0], projectFileDevice[Object.keys(projectFileDevice)[0]]));
    this._generateLoopInstance();
    this._generateAutomationDefaults();
  }

  get id() { return this._projectFileTrack.id; }
  set id(value) { this._projectFileTrack.id = value; }

  get name() { return this._projectFileTrack.name; }
  set name(value) { this._projectFileTrack.name = value; }

  get volume() { return this._channel.volume.value; }
  set volume(value) {
    this._channel.volume = value;
    this._projectFileTrack.volume = value;
  }

  get pan() { return this._channel.pan; }
  set pan(value) {
    this._channel.pan = value;
    this._projectFileTrack.pan = value;
  }

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

  get automations() { return this._projectFileTrack.automations; }

  addDevice(deviceName, deviceParams) {
    let deviceInstance = new Tone[deviceName](deviceParams);
    this._devices.push(deviceInstance);
  }

  start(time) {
    this._generateAutomations(time);
  }

  getDeviceParameter(deviceIndex, parameterPath) {
    let parameterPathParts = parameterPath.split(".");
    let parameter = this.devices[deviceIndex][parameterPathParts[0]];
    for (let parameterPathIndex = 1; parameterPathIndex < parameterPathParts.length; parameterPathIndex++) {
      parameter = parameter[parameterPathParts[parameterPathIndex]];
    }
    return parameter;
  }

  _generateLoopInstance() {
    this._loopInstance = new Tone.Loop((time) =>
      this._loopFunction(time), Tone.Time(this._projectFileTrack.loop.length));
    //this._loopInstance.start(Tone.now() + Tone.Time(this._projectFileTrack.loop.startTime));
    this._loopInstance.start(Tone.Time(this._projectFileTrack.loop.startTime));
  }

  _loopFunction(time) {
    //console.log(`Playing loop on ${this.name} at ${time}, now=${Tone.now()}`);
    this._projectFileTrack.loop.notes.forEach(note => {
      let noteTime = (note.timeOffset) ? time + (Tone.Time("16n") * note.timeOffset) : time + Tone.Time(note.time);
      //console.log(`Playing note ${note.note} on ${this.name} at ${noteTime}, now=${Tone.now()}`);
      this.instrument.triggerAttackRelease(
        note.note, note.duration, noteTime, note.velocity / 127);
    });
  }

  _generateAutomationDefaults() {
    let projectFileAutomations = this._projectFileTrack.automations;
    if (projectFileAutomations.length == 0) {
      return;
    }
    let automationsByDeviceParameter = Object.groupBy(projectFileAutomations, ({ deviceIndex, parameter }) => `${deviceIndex}_${parameter}`);
    let deviceParameterIndices = Object.keys(automationsByDeviceParameter);
    deviceParameterIndices.forEach(deviceParamKey => {
      // Create automation to set start value
      let parts = deviceParamKey.split("_");
      let deviceIndex = parts[0];
      let parameterPath = parts[1];
      let param = this.getDeviceParameter(deviceIndex, parameterPath);
      let initialParamValue = param.value;
      this._automationDefaults[deviceParamKey] = new Automation(0, this, { deviceIndex: deviceIndex, parameter: parameterPath, startTime: 0, rampTime: 0, value: initialParamValue });
    });
  }

  _generateAutomations(time) {
    this._automations = [];
    let projectFileAutomations = this._projectFileTrack.automations;
    if (projectFileAutomations.length == 0) {
      return;
    }
    let automationsByDeviceParameter = Object.groupBy(projectFileAutomations, ({ deviceIndex, parameter }) => `${deviceIndex}_${parameter}`);
    let deviceParameterIndices = Object.keys(automationsByDeviceParameter);
    deviceParameterIndices.forEach(deviceParamKey => {
      let parts = deviceParamKey.split("_");
      let deviceIndex = parts[0];
      let parameterPath = parts[1];
      let parameter = this.getDeviceParameter(deviceIndex, parameterPath);
      parameter.value = this._automationDefaults[deviceParamKey].value;
      automationsByDeviceParameter[deviceParamKey].forEach(projectFileAutomation =>
        this._automations.push(new Automation(time, this, projectFileAutomation)));
    })
  }
}

class Automation {
  constructor(time, track, projectFileAutomation) {
    this._time = time;
    this._track = track;
    this._projectFileAutomation = projectFileAutomation;
    this._generate();
  }

  get deviceIndex() { return this._projectFileAutomation.deviceIndex; }
  get parameter() { return this._projectFileAutomation.parameter; }
  get value() { return this._projectFileAutomation.value; }
  set value(value) {
    this._projectFileAutomation.value = value;
    this._generate();
  }

  get startTime() { return this._projectFileAutomation.startTime; }
  set startTime(value) {
    this._projectFileAutomation.startTime = value;
    this._generate();
  }

  get rampTime() { return this._projectFileAutomation.rampTime; }
  set rampTime(value) {
    this._projectFileAutomation.rampTime = value;
    this._generate();
  }

  get device() { return this._track.devices[this.deviceIndex]; }
  get parameterPathParts() { return this.parameter.split("."); }
  get parameterName() { return this.parameterPathParts[this.parameterPathParts.length - 1]; }

  _generate() {
    let parameter = this._track.getDeviceParameter(this.deviceIndex, this.parameter);
    parameter.rampTo(this.value, Tone.Time(this.rampTime), Tone.now() + Tone.Time(this.startTime));
  }
}
