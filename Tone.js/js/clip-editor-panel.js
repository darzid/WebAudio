var pianoRoll;
var editClip;
var clipIndex;
var clipTrack;
function initializeClipEditor() {
  /*pianoRoll = document.getElementById("piano-roll");
  
  pianoRoll.xoffset = document.getElementById("pianoroll-scroll-x").value;
  pianoRoll.yoffset = document.getElementById("pianoroll-scroll-y").value;
  pianoRoll.xrange = document.getElementById("pianoroll-zoom-x").value;
  pianoRoll.yrange = document.getElementById("pianoroll-zoom-y").value;
*/
}

function compareNotes(a, b) {
  if (a.start < b.start) {
    return -1;
  } else if (a.start > b.start) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

function onNotesChanged(clipTrack, notes) {
  if (! clipTrack) {
    console.warn("notes changed no selected track")
  }
  console.log("Edit clip", editClip)
  let convertedNotes = [];
  
  notes.sort(compareNotes);
  notes.forEach(note => {
    let midiNote = Tone.Midi(note.pitch);
    let noteOn = Tone.Ticks(note.start * 12).toTicks();
    let noteDuration = Tone.Ticks(note.duration * 12).toTicks();
    convertedNotes.push({note: midiNote, time: noteOn, duration: noteDuration})
  })
  console.log("notes changing, current, new ", editClip.notes, convertedNotes);
  
  let noteIndex = 0;
  editClip.notes = convertedNotes;
}

function showClip() {
  if (! selectedTrack) {
    throw "show clip no selected track"
  }
  clipTrack = selectedTrack;
  let sequence = [];
  if (selectedClip)
  {
    console.log("show clip", selectedClip);
    clipIndex = clipTrack.clips.indexOf(selectedClip);
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
    
    pianoRoll = createPianoroll(sequence, selectedClip.length, document.getElementById("tempo").value, (notes) => onNotesChanged(clipTrack, notes));
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