// const { Tone } = require("tone/build/esm/core/Tone");


async function loadProject(session) {
  await fetch('.\\projects\\project.json')
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
    console.log("project create");

    this._projectFile = projectFile;

    let masterChannel = new Tone.Channel({ channelCount: 2 });
    masterChannel.receive("master", 0);
    masterChannel.toDestination();
    this._masterChannel = masterChannel;

    console.log("creating tracks")

    this._projectFile.tracks.forEach(projectFileTrack =>
      this._tracks.push(new Track(projectFileTrack)));
    console.log("tracks created")
  }

  get name() { return this._projectFile.name; }
  set name(value) { this._projectFile.name = value; }

  get tempo() { return this._projectFile.tempo; }
  set tempo(value) { this._projectFile.tempo = value; }

  get length() { return this._projectFile.length; }

  get masterChannel() { return this._masterChannel; }
  get tracks() { return this._tracks; }

  start(time) {
    this.tracks.forEach(track => track.start(time));
  }

  save() {
    this._projectFile.tracks = [];
    this.tracks.forEach(track => this._projectFile.tracks.push(track.toProjectFileTrack()));
  }
}

class Track {
  _projectFileTrack;
  _channel;
  _devices = [];
  _instruments = [];
  _effects = [];
  _parts = [];
  _automationDefaults = {};
  _automations = [];

  constructor(projectFileTrack) {
    try {
      this._projectFileTrack = projectFileTrack;
      this._channel = new Tone.Channel({ volume: projectFileTrack.volume, pan: projectFileTrack.pan, channelCount: 2 });
      this._channel.send("master", 0);
      //this._channel.toDestination()
      this._projectFileTrack.devices.forEach(projectFileDevice =>
        this.addDevice(projectFileDevice[Object.keys(projectFileDevice)[0]].type, Object.keys(projectFileDevice)[0], projectFileDevice[Object.keys(projectFileDevice)[0]].parameters));
      this._generateClipLoops();
      this._generateAutomationDefaults();
      if (this.id == "track5")
        console.log("Track5", this)
    }
    catch (error) {
      console.error("Failed to create track", error)
    }
  }

  get id() { return this._projectFileTrack.id; }
  set id(value) { this._projectFileTrack.id = value; }

  get name() { return this._projectFileTrack.name; }
  set name(value) { this._projectFileTrack.name = value; }

  get volume() { return this._channel.volume.value; }
  set volume(value) {
    if (value == this._channel.volume.value)
      return;
    this._channel.volume.value = value;
    this._projectFileTrack.volume = value;
    document.dispatchEvent(
      new CustomEvent("TrackVolumeChanged",
        {
          detail:
            { track: this.id, volume: value }
        }));
  }

  get pan() { return this._channel.pan; }
  set pan(value) {
    if (value == this._channel.pan.value)
      return;
    this._channel.pan.value = value;
    this._projectFileTrack.pan = value;
    document.dispatchEvent(
      new CustomEvent("TrackPanChanged",
        {
          detail:
            { track: this.id, pan: value }
        }));
  }

  get enabled() { return !this._channel.mute; }
  set enabled(value) {
    if (value == this.enabled)
      return;
    this._channel.mute = !value;
    document.dispatchEvent(
      new CustomEvent("TrackEnabledChanged",
        {
          detail:
            { track: this.id, enabled: this.enabled }
        }));
  }

  get channel() { return this._channel; }
  get devices() { return this._devices; }
  get instruments() { return this._instruments; }
  get effects() { return this._effects; }

  get clips() { return this._projectFileTrack.clips; }

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

  addDevice(deviceType, deviceName, deviceParams) {
    let deviceInstance = new Tone[deviceName](deviceParams);
    this._devices.push(deviceInstance);
    if (deviceType == "Instrument") {
      this._instruments.push(deviceInstance);
    } else if (deviceType == "Effect") {
      this._effects.push(deviceInstance);
    }
    else {
      throw "Invalid device type " + deviceType;
    }
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

  toProjectFileTrack() {
    this._projectFileTrack.devices = [];

    document.getElementById(this.id).querySelectorAll(".Instrument").forEach(instrumentElement => {

      let projectFileTrackDeviceParameters = {};

      let deviceParameters = instrumentElement.querySelectorAll(".Parameter");
      deviceParameters.forEach(parameterArticleElement => {
        let parameterElement = parameterArticleElement.querySelector("input");
        if (!parameterElement) 
          parameterElement = parameterArticleElement.querySelector("select");
        if (!parameterElement) throw "No parameter input found for Parameter Article";
        
        let parameterName = parameterElement.getAttribute("name");
        if (!parameterName) throw "Parameter doesn't have a name";

        let parameterValue = parameterElement.value;

        let moduleElement = parameterArticleElement.closest(".Module");
        let moduleName = moduleElement.getAttribute("name");
        if (!moduleName) throw "Module doesn't have a name";

        if (moduleElement === instrumentElement) {
          projectFileTrackDeviceParameters[parameterName] = parameterValue;
        } else {

          if (!projectFileTrackDeviceParameters[moduleName]) {
            projectFileTrackDeviceParameters[moduleName] = {}
          }
          projectFileTrackDeviceParameters[moduleName][parameterName] = parameterValue;
        }
      });

      let projectFileTrackDevice = {};
      projectFileTrackDevice[instrumentElement.getAttribute("name")] = {
        "type": "Instrument",
        "parameters": projectFileTrackDeviceParameters
      };
      this._projectFileTrack.devices.push(projectFileTrackDevice);
    });
  }

  _generateClipLoops() {
    let clipIndex = 0;
    let transport = Tone.getTransport();

    this._projectFileTrack.clips.forEach(clip => {
      let loopStartTime = Tone.Time(clip.startTime)
      let loopEndTime = null;
      if (clip.endTime)
        loopEndTime = Tone.Time(clip.endTime);
      else if (clipIndex < this._projectFileTrack.clips.length - 1)
        loopEndTime = Tone.Time(this._projectFileTrack.clips[clipIndex + 1].startTime);

      let loopDuration = Tone.Time(clip.length);
      let clipDuration = loopEndTime ? (loopEndTime - loopStartTime) : null;

      const part = new Tone.Part(((time, value) => {
        this.instruments.forEach(instrument => {
          if (value.note)
            instrument.triggerAttackRelease(value.note, value.duration, time, value.velocity);
          else
            instrument.triggerAttack(time);
        });
      }), clip.notes);
      part.loopStart = Tone.Time("0:0:0");
      part.loopEnd = loopDuration;

      part.loop = true;
      part.start(loopStartTime);
      if (loopEndTime)
        part.stop(loopEndTime);

      this._parts.push(part);

      clipIndex++;
    });
  }

  _playClip(time, clip) {
  }

  // _generateLoopInstance() {
  //   this._loopInstance = new Tone.Loop((time) =>
  //     this._loopFunction(time), Tone.Time(this._projectFileTrack.loop.length));
  //   //this._loopInstance.start(Tone.now() + Tone.Time(this._projectFileTrack.loop.startTime));
  //   this._loopInstance.start(Tone.Time(this._projectFileTrack.loop.startTime));
  // }

  // _loopFunction(time) {
  //   //console.log(`Playing loop on ${this.name} at ${time}, now=${Tone.now()}`);
  //   this._projectFileTrack.loop.notes.forEach(note => {
  //     let noteTime = (note.timeOffset) ? time + (Tone.Time("16n") * note.timeOffset) : time + Tone.Time(note.time);
  //     //console.log(`Playing note ${note.note} on ${this.name} at ${noteTime}, now=${Tone.now()}`);
  //     this.instrument.triggerAttackRelease(
  //       note.note, note.duration, noteTime, note.velocity / 127);
  //   });
  // }

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
