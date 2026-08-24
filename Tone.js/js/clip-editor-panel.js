var pianoRoll;

function initializeClipEditor() {
  pianoRoll = document.getElementById("piano-roll");
  pianoRoll.xoffset = document.getElementById("pianoroll-scroll-x").value;
  pianoRoll.yoffset = document.getElementById("pianoroll-scroll-y").value;
  pianoRoll.xrange = document.getElementById("pianoroll-zoom-x").value;
  pianoRoll.yrange = document.getElementById("pianoroll-zoom-y").value;
}

function showClip() {
  if (selectedClip)
  {
    pianoRoll.sequence = [];
    console.log("show clip", selectedClip);
    if (selectedClip.notes)
    {
      let sequence = [];
      
      selectedClip.notes.forEach(clipNote => {
        let midiNote = Tone.Midi(clipNote.note).toMidi();
        let noteOn = Tone.Ticks(clipNote.start).toTicks();
        let noteDuration = Tone.Ticks(clipNote.duration).toTicks();
        
        sequence.push({
          t: noteOn, 
          g: noteDuration,
          n: midiNote});
      });
      
      pianoRoll.sequence = sequence;
      //(mmlString);
    }
  }
  pianoRoll.redraw();
}

function pianorollScrollX() {
  pianoRoll.xoffset = document.getElementById("pianoroll-scroll-x").value;
}

function pianorollScrollY() {
  pianoRoll.yoffset = document.getElementById("pianoroll-scroll-y").value;
}

function pianorollZoomX() {
  pianoRoll.xrange = document.getElementById("pianoroll-zoom-x").value;
  console.log(pianoRoll.xrange);
}

function pianorollZoomY() {
  pianoRoll.yrange = document.getElementById("pianoroll-zoom-y").value;
}


