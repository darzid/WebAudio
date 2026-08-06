class PianoRoll {
  _currentOctave = 2;
  // _trackId = "Track1";
  _pianoRollPanel = document.getElementById("piano-roll");

  constructor() {
  }

  get selectedTrackId() {

    // let devicePanel = document.getElementById("device-panel")! as HTMLDivElement;
    // let selectedTrack = devicePanel.querySelector(".selected-track");
    // if (selectedTrack) 
    //   return selectedTrack.id.replace("-container", "");
    // else 
    return "track1";
  }

  init() {
    // let pianoRollKeys = this._pianoRollPanel.querySelectorAll("button");

    // for (let keyIndex = 0; keyIndex < pianoRollKeys.length; keyIndex++) {
    //   let pianoRollKey = pianoRollKeys[keyIndex];
    //   // pianoRollKey.addEventListener("mousedown", (eventInfo: MouseEvent) => PlayNoteRequestEvent.send(this.selectedTrackId, (eventInfo.srcElement! as HTMLElement).title));
    //   // pianoRollKey.addEventListener("mouseup", (eventInfo: MouseEvent) => StopNoteRequestEvent.send(this.selectedTrackId, (eventInfo.srcElement! as HTMLElement).title));
    // }

    document.addEventListener("keydown", (eventInfo) => this.onKeyDown(eventInfo), true);
    document.addEventListener("keyup", (eventInfo) => this.onKeyUp(eventInfo), true);
    document.addEventListener("NotePlayingEvent", (eventInfo) => this.onNotePlaying(eventInfo));
    document.addEventListener("NoteStoppedEvent", (eventInfo) => this.onNoteStopped(eventInfo));
  }

  showHide() {
    if (this._pianoRollPanel.style.display == "inline")
      this._pianoRollPanel.style.display = 'none';
    else
      this._pianoRollPanel.style.display = "inline";
  }

  onKeyDown(eventInfo) {
    if (eventInfo.altKey && eventInfo.key.toLowerCase() == "p") {
      this._pianoRollPanel.style.display = this._pianoRollPanel.style.display == "none" ? "inline" : "none";
      return;
    }

    if (eventInfo.altKey || eventInfo.repeat) return;

    if (MIDI_KEYS[eventInfo.key.toLowerCase()]) {
      let note = MIDI_KEYS[eventInfo.key.toLowerCase()].replace("_LOW_", this._currentOctave.toString()).replace("_HI_", (this._currentOctave + 1).toString());
      console.log(`KBD[${this.selectedTrackId}]: sending PlayNoteRequestEvent: MIDI KEY up: ${eventInfo.key.toLowerCase()} => ${note}`);

      document.dispatchEvent(
        new CustomEvent("PlayNoteRequestEvent", {
          detail: {
            track: this.selectedTrackId,
            note: note
          }
        }));
    }
    else if (eventInfo.key == "z" && this._currentOctave > 0) {
      console.log(`KBD: onKeyDown: octave down from ${this._currentOctave} to ${this._currentOctave - 1}`);
      this._currentOctave--;
    }
    else if (eventInfo.key == "x" && this._currentOctave < 8) {
      console.log(`KBD: onKeyDown: octave up from ${this._currentOctave} to ${this._currentOctave + 1}`);
      this._currentOctave++;
    }
  }

  onKeyUp(eventInfo) {
    if (eventInfo.altKey) return;

    if (MIDI_KEYS[eventInfo.key.toLowerCase()]) {
      let note = MIDI_KEYS[eventInfo.key.toLowerCase()].replace("_LOW_", this._currentOctave.toString()).replace("_HI_", (this._currentOctave + 1).toString());
      console.log(`KBD[${this.selectedTrackId}]: sending StopNoteRequestEvent onKeyUp: MIDI KEY up: ${eventInfo.key.toLowerCase()} => ${note}`);
      document.dispatchEvent(
        new CustomEvent("StopNoteRequestEvent", {
          detail: {
            track: this.selectedTrackId,
            note: note
          }
        }));
    }
  }

  onNotePlaying(eventInfo) {
    if (eventInfo.detail.trackId != this.selectedTrackId) return;

    let key = this._pianoRollPanel.querySelector(`button[title='${eventInfo.detail.note}']`);
    if (key.className.indexOf("-pressed") == -1)
      key.className = key.className + "-pressed";
  }

  onNoteStopped(eventInfo) {
    if (eventInfo.detail.trackId != this.selectedTrackId) return;

    let key = this._pianoRollPanel.querySelector(`button[title='${eventInfo.detail.note}']`);
    if (key.className.indexOf("-pressed") != -1)
      key.className = key.className.replace("-pressed", "");
  }
}

const MIDI_KEYS = {
  "a": "C_LOW_",
  "w": "C#_LOW_",
  "s": "D_LOW_",
  "e": "D#_LOW_",
  "d": "E_LOW_",
  "f": "F_LOW_",
  "t": "F#_LOW_",
  "g": "G_LOW_",
  "y": "G#_LOW_",
  "h": "A_LOW_",
  "u": "A#_LOW_",
  "j": "B_LOW_",
  "k": "C_HI_",
  "o": "C#_HI_",
  "l": "D_HI_",
  "p": "D#_HI_"
}
