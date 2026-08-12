let output = document.getElementById("output");
      let pianoRoll = null;
      let presetBrowser = new PresetBrowser();
      var presets;
      var session = null;
      let selectedTrackId = null;
      let toneInitialized = false;
      document.addEventListener("DOMContentLoaded", async (event) => {
        await createUI();
      });

      document.addEventListener("mousemove", async () => {
        if (toneInitialized) return;
        toneInitialized = true;

        // Tone.setContext(
        //   new Tone.Context(
        //     {
        //       context: new AudioContext({ sampleRate: 32000 }),
        //       latencyHint: "playback",
        //       lookAhead: 0.15
        //     }));

        // Tone.setContext(new Tone.Context({ latencyHint: "playback", lookAhead: 0.15 }))
        await Tone.start();
      });

      async function createUI() {
        //applyTemplates();

        session = {
          project: null
        }
        await loadProject(session);
        await presetBrowser.loadPresets();

        Tone.getTransport().bpm.value = session.project.tempo;

        let tracksElement = document.getElementById("tracks");
        session.project.tracks.forEach(track => createTrack(session.project, tracksElement, track));

        let mixerElement = document.getElementById("mixer");
        let toggleMixerElement = document.getElementById("toggle-mixer");
        toggleMixerElement.addEventListener("click", () => mixer.style.display = toggleMixerElement.checked ? "flex" : "none");
        
        let toggleClipsElement = document.getElementById("toggle-clips");
        toggleClipsElement.addEventListener("click", () => {
          let trackClipsElements = document.querySelectorAll(".TrackClipsContainer");
          trackClipsElements.forEach((trackClipsElement) => trackClipsElement.style.display = toggleClipsElement.checked ? "inline-block" : "none");
        });
        
        let toggleDevicesElement = document.getElementById("toggle-devices");
        toggleDevicesElement.addEventListener("click", () => {
          let trackDevicesElements = document.querySelectorAll(".TrackDevices");
          trackDevicesElements.forEach((trackDevicesElement) => trackDevicesElement.style.display = toggleDevicesElement.checked ? "inline-block" : "none");
        });
        
        initializeToggleButtons();
        initializeArmTrackButtons();
        initializeTransport();
        initializeComputerKeyboard();
        
        document.getElementById("daw").style.opacity = 1;
        document.getElementById("loading").style.display = "none";
        console.log("Initialized");
      }

function createTrack(project, tracksElement, track) {
  let mixerElement = document.getElementById("mixer");
  
  let trackElement = document.createElement("div");
trackElement.id = track.id;
trackElement.setAttribute("name", track.name);
trackElement.setAttribute("data-template", "Track");
trackElement.setAttribute("value", track.volume);
tracksElement.appendChild(trackElement);

let trackFaderElement = document.createElement("div");
trackFaderElement.id = `${track.id}-fader`;
trackFaderElement.type = "range";
trackFaderElement.setAttribute("name", track.name);
trackFaderElement.setAttribute("value", track.volume);
trackFaderElement.setAttribute("data-template", "MixerChannel");
mixerElement.appendChild(trackFaderElement);

applyTemplates();

trackElement = document.getElementById(track.id);
bind(trackElement.querySelector(".track-header"), track.channel);

trackFaderElement = document.getElementById(`${track.id}-fader`);

let trackVolumeInputElement = trackElement.querySelector(".TrackLane input[name='volume']");
let trackVolumeValueElement = trackElement.querySelector(`.TrackLane value[name='volume']`);
let trackFaderInputElement = trackFaderElement.querySelector("input");
let trackFaderValueElement = trackFaderElement.querySelector("value");
trackFaderValueElement.innerHTML = trackFaderInputElement.value;
let trackEnabledElement = trackElement.querySelector(".track-header input[type='checkbox'][name='enabled']");

document.addEventListener("TrackEnabledChanged", (e) => {
  if (e.detail.track == track.id) {
    if (e.detail.enabled != trackEnabledElement.checked)
      trackEnabledElement.checked = e.detail.enabled;
    if (e.detail.enabled && trackFaderInputElement.classList.contains("disabled"))
      trackFaderInputElement.classList.remove("disabled");
    else if (!e.detail.enabled && !trackFaderInputElement.classList.contains("disabled"))
      trackFaderInputElement.classList.add("disabled");
  }
});

document.addEventListener("TrackVolumeChanged", (e) => {
  if (e.detail.track == track.id) {
    trackFaderInputElement.value = e.detail.volume;
    trackFaderValueElement.innerHTML = e.detail.volume;
    trackVolumeInputElement.value = e.detail.volume;
    trackVolumeValueElement.innerHTML = e.detail.volume;
  }
});

trackVolumeInputElement.addEventListener("input", () =>
  track.volume = parseFloat(trackVolumeInputElement.value)
);

trackFaderInputElement.addEventListener("input", () =>
  track.volume = parseFloat(trackFaderInputElement.value)
);

trackEnabledElement.addEventListener("change", (e) => {
  if (track.enabled != e.target.checked)
    track.enabled = e.target.checked;
});

createTrackDevices(track, trackElement);
createTrackClips(project, track, trackElement);
}
function toOneBased(time){
  if (typeof time === "string")
    time = Tone.Time(time);
  let parts = time.toBarsBeatsSixteenths().split(":");
  let bars = parseInt(parts[0]);
  let beats = parseInt(parts[1]);
  let sixteenths = parseFloat(parts[2]);
  return `${bars+1}:${beats+1}:${sixteenths+1}`;
}

function createTrackDevices(track, trackElement) {
  let trackDevicesElement = trackElement.querySelector("div[name='Devices']");
          track.devices.forEach(device => {
            let newDeviceElement = document.createElement("div");
            newDeviceElement.id = `${track.id}-${device.name}`;
            newDeviceElement.setAttribute("name", device.name);
            newDeviceElement.setAttribute("data-template", device.name);
            trackDevicesElement.appendChild(newDeviceElement);

            applyTemplates();
            let deviceElement = document.getElementById(newDeviceElement.id);
            bind(deviceElement, device);
            deviceElement.querySelector(".browse-button").addEventListener("click", (e) => presetBrowser.show(device, deviceElement));
          });

          let trackDevices = track.devices.filter(device => device.name != "LFO");
          let instrumentTarget = track.effects.length > 0 ? track.effects[0] : track.channel;
          for (let instrumentIndex = 0; instrumentIndex < track.instruments.length; instrumentIndex++) {
            track.instruments[instrumentIndex].connect(instrumentTarget);
          }

          for (let effectIndex = 0; effectIndex < track.effects.length - 1; effectIndex++) {
            track.effects[effectIndex].connect(track.effects[effectIndex + 1]);
          }
          if (track.effects.length > 0) {
            track.effects[track.effects.length - 1].connect(track.channel);
          }
}

function createTrackClips(project, track, trackElement) {
  //if (track.id != "track1")
    //return;
  var getSixteenths = (time) => {
    let parts = time.toBarsBeatsSixteenths().split(":");
    let bars = parseInt(parts[0]);
    let beats = (bars * 4) + parseInt(parts[1]);
    let sixteenths = (beats * 4) + parseFloat(parts[2]);
    return sixteenths;
  }
  
  let lastClipEndTime = track.clips[track.clips.length - 1].endTime;
  if (!lastClipEndTime) {
    lastClipEndTime = project.lengtb;
  }
  
  let projectDuration = Tone.Time(project.length);
  let parts = projectDuration.toBarsBeatsSixteenths().split(":");
  let projectBars = parseInt(parts[0]);
  let projectBeats = (projectBars * 4) + parseInt(parts[1]);
  let projectSixteenths = getSixteenths(projectDuration);
  let projectSeconds = projectDuration.toSeconds();
  let projectDurationInMs = projectDuration.toMilliseconds();
  
  let msToPixels = 0.2;
  let clipsWidth = projectDurationInMs;
  let barWidth = Tone.Time("1:0:0").toMilliseconds();
  
  let trackDetailsElement = trackElement.querySelector(".track-details");
  //trackDetailsElement.style.width = `${projectDurationInMs * msToPixels + 200}px`;
  
  let trackClipsContainerElement = trackElement.querySelector("div[name='TrackClipsContainer']");
  trackClipsContainerElement.style.width = `${projectDurationInMs * msToPixels}px`;
  let trackClipsElement = trackClipsContainerElement.querySelector(".TrackClips");
  
  let previousClip = null;
  let timeBarElement = trackClipsContainerElement.querySelector(".TimeBar");
 // timeBarElement.style.width = `${projectDurationInMs * msToPixels}px`;
  let timeBarTop = timeBarElement.getBoundingClientRect().top;

  var prevRight = null;
  for (let bar = 0; bar < projectBars; bar++) {
    let barLabel = document.createElement("label");
    barLabel.class = "BarLabel";
    let barLeft = Tone.Time(`${bar}:0:0`).toMilliseconds();
    if (prevRight) {
      barLabel.style.marginLeft = `${barLeft * msToPixels - prevRight}px`;
    }
    barLabel.style.width = `${barWidth * msToPixels}px`;
    barLabel.innerText = `${bar+1}:1:1`;
    timeBarElement.appendChild(barLabel);
    if (bar % 2 == 0) {
      barLabel.classList.add("banded");
    }
    prevRight = barLeft * msToPixels + barWidth * msToPixels;
    if (track.id === "track1")
      console.log(`Bar: ${barLabel.innerText}, left: ${barLeft * msToPixels}, width: ${barWidth}, clipsWidth: ${clipsWidth}`);
  }
  
  let prevClipEndInPixels = null;
          track.clips.forEach(clip => {
            //if (clip.name != "Kick02")
              //return;
            let clipStartTime = Tone.Time(clip.startTime);
            let clipEndTime = clip.endTime ? Tone.Time(clip.endTime) : Tone.Time(project.length);
            let clipDuration = Tone.Time(clipEndTime - clipStartTime);

            let clipStartInMs = clipStartTime.toMilliseconds();
            let clipDurationInMs = clipDuration.toMilliseconds();
            
            let clipStartInPixels = clipStartInMs * msToPixels;
            let clipWidthInPixels = clipDurationInMs * msToPixels;
            let clipEndInPixels = clipStartInPixels + clipWidthInPixels;
            let clipMarginLeftInPixels = prevClipEndInPixels ? clipStartInPixels - prevClipEndInPixels : clipStartInPixels;
            
            let newClipElement = document.createElement("span");
            newClipElement.id = `${track.id}-${clip.name}`;
            newClipElement.setAttribute("name", toOneBased(clip.startTime) + " > " + clip.name + " > " + toOneBased(clip.endTime ? clip.endTime : project.length));
            newClipElement.setAttribute("title", clip.name);
            newClipElement.setAttribute("data-template", "Clip");
            newClipElement.style.marginLeft = `${clipMarginLeftInPixels}px`;
            newClipElement.style.width = `${clipWidthInPixels}px`;
            if (track.id === "track1")
              console.log(`clip ${clip.name}, left: ${clipStartInMs * msToPixels},  width: ${clipDurationInMs * msToPixels}`);
            prevClipEndInPixels = clipEndInPixels
            trackClipsElement.appendChild(newClipElement);
            applyTemplates();

            let clipsElement = trackClipsElement.querySelectorAll(".Clip");
            let clipElement = clipsElement[clipsElement.length - 1];

          
            let clipNotesContainerElement = clipElement.querySelector(".ClipNotesContainer");
            let clipNotesElement = clipNotesContainerElement.querySelector(".ClipNotes");
            let timeBarElement = clipNotesContainerElement.querySelector(".TimeBar");
  
            let clipParts = clipDuration.toBarsBeatsSixteenths().split(":");
            let clipBars = parseInt(clipParts[0]);
            let clipBeats = (clipBars * 4) + parseInt(clipParts[1]);
            let clipSixteenths = getSixteenths(clipDuration);
            
            var prevClipRight = null;
            let bar = 0;
            let barBeat = 0;
            let beatWidth = barWidth / 4;
            for (let beat = 0; beat < clipBeats; beat++) {
              let beatLabel = document.createElement("label");
              beatLabel.class = "BeatLabel";
              let beatLeft = Tone.Time(`${bar}:${barBeat}:0`).toMilliseconds();
              if (prevClipRight) {
                beatLabel.style.marginLeft = `${beatLeft * msToPixels - prevClipRight}px`;
              }
              beatLabel.style.width = `${beatWidth * msToPixels}px`;
              beatLabel.innerText = `${bar+1}:${barBeat+1}:1`;
              timeBarElement.appendChild(beatLabel);
              barBeat++;
              if (beat % 2 == 0) {
                beatLabel.classList.add("banded");
              }
              prevClipRight = beatLeft * msToPixels + beatWidth * msToPixels;
              if (barBeat == 4) {
                bar++;
                barBeat = 0;
              }
              //if (track.id === "track1")
               // console.log(`Bar: ${barLabel.innerText}, left: ${barLeft * msToPixels}, width: ${barWidth}, clipsWidth: ${clipsWidth}`);
            }
            
            
            let repeat = true;
            let noteOffset = 0;
            let clipLength = Tone.Time(clip.length);
            let clipLengthInPixels = Tone.Time(clip.length).toMilliseconds() * msToPixels;
            let clipOffset = Tone.Time("0:0:0");
            let prevNoteEndInPixels = null;
            while (clipOffset < clipDuration) {
              clip.notes.forEach(note => {
                let noteStartTime = Tone.Time(Tone.Time(note.time) + clipOffset);
                let noteDuration = Tone.Time(note.duration);
                
                let noteStartInMs = noteStartTime.toMilliseconds();
                let noteDurationInMs = noteDuration.toMilliseconds();
                
                let noteStartInPixels = noteStartInMs * msToPixels;
                let noteWidthInPixels = noteDurationInMs * msToPixels;
                let noteEndInPixels = noteStartInPixels + noteWidthInPixels;
                let noteMarginLeftInPixels = prevNoteEndInPixels ? noteStartInPixels - prevNoteEndInPixels : noteStartInPixels;
              
                let noteDurationText = Tone.Time(note.duration).toNotation();
                if (noteDurationText.endsWith("n")) {
                  noteDurationText = `1/${noteDurationText.substring(0, noteDurationText.length - 1)}`;
                }
                let newClipNoteElement = document.createElement("span");
                newClipNoteElement.id = `${track.id}-${clip.name}-${clip.notes.indexOf(note)}`;
                
                newClipNoteElement.setAttribute("time", toOneBased(note.time));
                newClipNoteElement.innerText = note.note;
                newClipNoteElement.setAttribute("duration", noteDurationText);
                newClipNoteElement.setAttribute("velocity", Math.round(note.velocity * 127, 0));
                //newClipNoteElement.setAttribute("data-template", "ClipNote");
                newClipNoteElement.style.marginLeft = `${noteMarginLeftInPixels}px`;
                newClipNoteElement.style.width = `${noteWidthInPixels}px`;
                if (track.id === "track1")
                  console.log(`note ${note.note}, start: ${noteStartInMs}, left: ${noteStartInMs * msToPixels},  width: ${noteDurationInMs * msToPixels}`, note);
                prevNoteEndInPixels = noteEndInPixels
                clipNotesElement.appendChild(newClipNoteElement);
                //applyTemplates();
              });
              clipOffset = Tone.Time(clipOffset + clipLength);
            }
            
            
            let longestClipNoteDurationInMs = 0;
            clip.notes.forEach(note => {
              let noteDurationInMs = Tone.Time(note.duration).toMilliseconds();
              if (noteDurationInMs > longestClipNoteDurationInMs)
                longestClipNoteDurationInMs = noteDurationInMs;
            });

            clip.notes.forEach(note => {
              /*
              let clipNoteOffset = (Tone.Time(note.startTime).toMilliseconds() / (clipDurationInMs * 1000));
              
              let noteDurationText = Tone.Time(note.duration).toNotation();
              if (noteDurationText.endsWith("n")) {
                noteDurationText = `1/${noteDurationText.substring(0, noteDurationText.length - 1)}`;
              }
              let newClipNoteElement = document.createElement("div");
              newClipNoteElement.id = `${track.id}-${clip.name}-${clip.notes.indexOf(note)}`;
              newClipNoteElement.setAttribute("time", toOneBased(note.time));
              newClipNoteElement.setAttribute("note", note.note);
              newClipNoteElement.setAttribute("duration", noteDurationText);
              newClipNoteElement.setAttribute("velocity", Math.round(note.velocity * 127, 0));
              newClipNoteElement.setAttribute("data-template", "ClipNote");
              newClipNoteElement.style.left = `${clipNoteOffset * 100}%`;
              console.log(`Velocity ${note.velocity}, height ${note.velocity * 100}%, time ${note.time}, offset ${newClipNoteElement.style.left}%`);

              clipNotesElement.appendChild(newClipNoteElement);

              let clipNoteElement = applyTemplate(newClipNoteElement);

              //let velocityBarElement = clipNoteElement.querySelector(".VelocityBar");
              //velocityBarElement.style.height = `${note.velocity * 100}%`;

              let noteDurationInMs = Tone.Time(note.duration).toMilliseconds();

              // let noteLengthBarElement = clipNoteElement.querySelector(".NoteLengthBar");
              //noteLengthBarElement.style.width = `${noteDurationInMs / longestClipNoteDurationInMs * 100}%`;

              let visualNoteElement = clipNoteElement.querySelector(".VisualNoteRow");
             // visualNoteElement.style.width = `${noteDurationInMs / longestClipNoteDurationInMs * 100}%`;

              let velocityBackgroundElement = clipNoteElement.querySelector(".VelocityBackground");
              velocityBackgroundElement.style.height = `${note.velocity * 100}%`;
*/
            });

          });
}

function initializeArmTrackButtons(){
  let armTrackInputs = document.querySelectorAll("input[type='radio'][name='arm-track']");
        armTrackInputs[0].checked = true;
        selectedTrackId = session.project.tracks[0].id;
        armTrackInputs.forEach(armTrackInput =>
          armTrackInput.addEventListener("change", () => selectedTrackId = armTrackInput.value));

}

function initializeComputerKeyboard(){
  pianoRoll = new PianoRoll();
        
  pianoRoll.init();

        document.addEventListener("PlayNoteRequestEvent", (eventInfo) => playNote(eventInfo));
        document.addEventListener("StopNoteRequestEvent", (eventInfo) => stopNote(eventInfo));

        function playNote(eventInfo) {
          let track = session.project.tracks.find(track => track.id === selectedTrackId);
          if (track.instruments.length == 0) return;
          track.instruments.forEach(instrument => {
            if (instrument.name == "NoiseSynth")
              instrument.triggerAttack(Tone.now());
            else
              instrument.triggerAttack(eventInfo.detail.note, Tone.now())
          });
        }

        function stopNote(eventInfo) {
          let track = session.project.tracks.find(track => track.id === selectedTrackId);
          if (track.instruments.length == 0) return;
          track.instruments.forEach(instrument => instrument.triggerRelease(Tone.now()));
        }

}