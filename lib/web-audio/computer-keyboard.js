onKeyDown(eventInfo) {
    if (eventInfo.altKey && eventInfo.key.toLowerCase() == "p") {
      this._pianoRollPanel.style.display = this._pianoRollPanel.style.display == "none" ? "inline" : "none";
      return;
    }

    if (eventInfo.altKey || eventInfo.repeat) return;

    if (MIDI_KEYS[eventInfo.key.toLowerCase()]) {
      let note = MIDI_KEYS[eventInfo.key.toLowerCase()].replace("_LOW_", this._currentOctave.toString()).replace("_HI_", (this._currentOctave + 1).toString());
      console.log(`KBD[${this.selectedTrackId}]: onKeyDown: MIDI KEY down: ${eventInfo.key.toLowerCase()} => ${note}`);
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

  onKeyUp(eventInfo) {
    if (eventInfo.altKey) return;

    if (MIDI_KEYS[eventInfo.key.toLowerCase()]) {
      let note = MIDI_KEYS[eventInfo.key.toLowerCase()].replace("_LOW_", this._currentOctave.toString()).replace("_HI_", (this._currentOctave + 1).toString());
      console.log(`KBD[${this.selectedTrackId}]: onKeyUp: MIDI KEY up: ${eventInfo.key.toLowerCase()} => ${note}`);
      StopNoteRequestEvent.send(this.selectedTrackId, note);
    }
  }
