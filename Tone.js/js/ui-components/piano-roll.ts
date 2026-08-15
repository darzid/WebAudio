import { KeyDownEvent, KeyUpEvent } from "../lib-ts/keyboard-events";
import { PlayNoteRequestEvent, StopNoteRequestEvent, NotePlayingEvent, NoteStoppedEvent } from "./websynth-events";

export class PianoRoll {
  _currentOctave: number = 2;
  // _trackId = "Track1";
  _pianoRollPanel = document.getElementById("piano-roll") as HTMLDivElement;

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

    KeyDownEvent.subscribe((eventInfo: KeyboardEvent) => this.onKeyDown(eventInfo));
    KeyUpEvent.subscribe((eventInfo: KeyboardEvent) => this.onKeyUp(eventInfo));
    NotePlayingEvent.subscribe((eventInfo: NotePlayingEvent) => this.onNotePlaying(eventInfo));
    NoteStoppedEvent.subscribe((eventInfo: NoteStoppedEvent) => this.onNoteStopped(eventInfo));
  }

  showHide() {
    if (this._pianoRollPanel.style.display == "inline")
      this._pianoRollPanel.style.display = 'none';
    else
      this._pianoRollPanel.style.display = "inline";
  }

  onKeyDown(eventInfo: KeyboardEvent) {
    if (eventInfo.altKey && eventInfo.key.toLowerCase() == "p") {
      this._pianoRollPanel.style.display = this._pianoRollPanel.style.display == "none" ? "inline" : "none";
      return;
    }

    if (eventInfo.altKey || eventInfo.repeat) return;

    if (MIDI_KEYS[eventInfo.key.toLowerCase()]) {
      let note = MIDI_KEYS[eventInfo.key.toLowerCase()]!.replace("_LOW_", this._currentOctave.toString()).replace("_HI_", (this._currentOctave + 1).toString());
      //console.log(`KBD[${this.selectedTrackId}]: onKeyDown: MIDI KEY down: ${eventInfo.key.toLowerCase()} => ${note}`);

      // const evt = new CustomEvent(PlayNoteRequestEvent._name, { detail: { trackId: this.selectedTrackId, note: note, velocity: 127, time: 0 } });
      // document.dispatchEvent(evt);
      PlayNoteRequestEvent.send(this.selectedTrackId, note);
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

  onKeyUp(eventInfo: KeyboardEvent) {
    if (eventInfo.altKey) return;

    if (MIDI_KEYS[eventInfo.key.toLowerCase()]) {
      let note = MIDI_KEYS[eventInfo.key.toLowerCase()]!.replace("_LOW_", this._currentOctave.toString()).replace("_HI_", (this._currentOctave + 1).toString());
      //console.log(`KBD[${this.selectedTrackId}]: onKeyUp: MIDI KEY up: ${eventInfo.key.toLowerCase()} => ${note}`);
      StopNoteRequestEvent.send(this.selectedTrackId, note);
    }
  }

  onNotePlaying(eventInfo: any) {
    if (eventInfo.detail.trackId != this.selectedTrackId) return;

    let key = this._pianoRollPanel.querySelector(`button[title='${eventInfo.detail.note}']`) as HTMLButtonElement;
    if (key.className.indexOf("-pressed") == -1)
      key.className = key.className + "-pressed";
  }

  onNoteStopped(eventInfo: any) {
    if (eventInfo.detail.trackId != this.selectedTrackId) return;

    let key = this._pianoRollPanel.querySelector(`button[title='${eventInfo.detail.note}']`) as HTMLButtonElement;
    if (key.className.indexOf("-pressed") != -1)
      key.className = key.className.replace("-pressed", "");
  }
}

const MIDI_KEYS: { [id: string]: string } = {
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
