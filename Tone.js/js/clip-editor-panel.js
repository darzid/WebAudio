var pianoRoll;
var editClip;

function initializeClipEditor() {
  /*pianoRoll = document.getElementById("piano-roll");
  
  pianoRoll.xoffset = document.getElementById("pianoroll-scroll-x").value;
  pianoRoll.yoffset = document.getElementById("pianoroll-scroll-y").value;
  pianoRoll.xrange = document.getElementById("pianoroll-zoom-x").value;
  pianoRoll.yrange = document.getElementById("pianoroll-zoom-y").value;
*/
}

function onNotesChanged(notes) {
  console.log("notes changing", notes, editClip.notes);
  let noteIndex = 0;
  editClip.notes.length = 0;
  notes.forEach(note => {
    let midiNote = Tone.Midi(note.pitch);
    let noteOn = Tone.Ticks(note.start * 48).toTicks();
    let noteDuration = Tone.Ticks(note.duration * 48).toTicks();
    editClip.notes.push({note: midiNote, time: noteOn, duration: noteDuration})
  })
  console.log("notes changed", editClip.notes);
}

function showClip() {
  let sequence = [];
  if (selectedClip)
  {
    console.log("show clip", selectedClip);
    editClip = selectedClip;
    if (selectedClip.notes)
    {
      selectedClip.notes.forEach(clipNote => {
        let midiNote = Tone.Midi(clipNote.note).toMidi();
        let noteOn = Tone.Ticks(clipNote.time).toTicks() / 48;
        let noteDuration = Tone.Ticks(clipNote.duration).toTicks() / 48;
        
        sequence.push([midiNote, noteOn, noteDuration]);
        /*  t: noteOn, 
          g: noteDuration,
          n: midiNote});*/
      });
    }
    
    pianoRoll = createPianoroll(sequence, selectedClip.length, document.getElementById("tempo").value, (notes) => onNotesChanged(notes));
   // pianoRoll.redraw();
  } 
  else {
    if (pianoRoll.sequence.length > 0) {
      console.log("clear", pianoRoll.sequence)
      pianoRoll.sequence.splice(0, pianoRoll.sequence.length);
      pianoRoll.redraw();
    }
    //  pianoRoll.sequence = sequence;
    editClip = null;
  }
  
  sizeTracksTableContainer();
}

/*

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


*/