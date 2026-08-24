var selectedTrackId;
var selectedClip;

function fillTracksTable(tracksTable, tracks)
{
  let tracksTableBody = tracksTable.querySelector("tbody");
  let tracksTableHeaderRow = tracksTable.querySelector(".header-row");
  let leftTopHeader = document.createElement("th");
  let addTrackButton = document.createElement("button");
  addTrackButton.classList.add("control");
  addTrackButton.classList.add("image-button");
  addTrackButton.id ="add-track";
  leftTopHeader.appendChild(addTrackButton);
  addTrackButton.innerHTML = '<img src="img/addtrack.png">';
  
  tracksTableHeaderRow.appendChild(leftTopHeader);
  
  addTrackButton.onclick = () => addTrack();
  
  for (bar = 1; bar <= 4; bar++) {
    for (beat = 1; beat <= 4; beat++) {
      for (sixteenth = 1; sixteenth <= 4; sixteenth++) {
        let className = (sixteenth > 1) ? "sixteenth" : (beat > 1) ? "beat" : "bar";
        let timelineElement = document.createElement("th");
        timelineElement.className = className;
        timelineElement.classList.add("position-column");
        
        timelineElement.innerText = `${bar}:${beat}:${sixteenth}`;
        timelineElement.title = `${bar}:${beat}:${sixteenth}`;
        tracksTableHeaderRow.appendChild(timelineElement);
      }
    }
  }
  
  tracks.forEach(track => {
    addTrackRow(track);
  });
  sizeTracksTableContainer();
  
  let selectedTrackRow = null;
  
  function selectTrack(trackRow) {
    if (selectedTrackRow)
      selectedTrackRow.classList.remove("selected");
    trackRow.classList.add("selected");
    if (selectedTrackRow != trackRow)
      selectedClip = null;
    selectedTrackRow = trackRow;
    selectedTrackId = trackRow.id.split("-row")[0];
  }
  
  function addTrack() {
    let newTrack = {
      name: "Track" + (tracks.length + 1),
      clips: []
    }
    tracks.push(newTrack);
    let trackRow = addTrackRow(newTrack);
    trackRow.scrollIntoView();
    selectTrack(trackRow);
    sizeTracksTableContainer();
  }

  let selectedClipElement = null;
  function addTrackRow(track) {
    let trackIndex = tracks.indexOf(track);

    let trackRow = document.createElement("tr");
    trackRow.id = track.name + "-row";
    trackRow.className = "track-row";
    tracksTableBody.appendChild(trackRow);
    
    let trackHeaderColumn = document.createElement("td");
    trackHeaderColumn.classList.add("track-header");
    trackHeaderColumn.classList.add("control");
    trackRow.appendChild(trackHeaderColumn);
    
    let trackHeaderDiv = document.createElement("div");
    trackHeaderColumn.appendChild(trackHeaderDiv);
    trackHeaderDiv.addEventListener("click", () => {
      selectTrack(trackRow);
      showTrackDevices();
      clickTab(document.getElementById("devices-tab-button"));
      console.log("show devices")
    });
    trackHeaderDiv.innerHTML = `<button class="control toggle-button enabled-button active"></button>
                    <label><input name="track-name" class="control" type="text" value="${track.name}" readonly></label>`;
    
    renderColumns();
    renderClips();
    
    function renderColumns() {
      for (bar = 1; bar <= 4; bar++) {
        for (beat = 1; beat <= 4; beat++) {
          for (sixteenth = 1; sixteenth <= 4; sixteenth++) {
            
            let columnElement = document.createElement("td");
            columnElement.className = "clip-column";
            if (beat % 2 == 0)
              columnElement.classList.add("banded");
            trackRow.appendChild(columnElement);
          }
        }
      }
    }
    
    function renderClips() {
      track.clips.forEach(clip => {
        let clipStartInSixteenths = getSixteenths(clip.start);
        let clipEndInSixteenths = getSixteenths(clip.end) - 1;
        let clipDurationInSixteenths = getSixteenths(clip.duration);
        
        let clipStartColumn = Math.floor(clipStartInSixteenths) + 1;
        let clipStartOffset = (clipStartInSixteenths + 1) - clipStartColumn;
        
        let clipEndColumn = Math.floor(clipEndInSixteenths) + 1;
        let clipEndOffset = (clipEndInSixteenths + 1) - clipEndColumn;
        let clipRepeatStartColumn = clipStartColumn + Math.ceil(clipDurationInSixteenths);
        let clipRepeatColumnCount = Math.ceil(clipDurationInSixteenths);
        console.log("render clip", track.name, clip.name, clipStartColumn, clipEndColumn);
      
        for (clipColumnIndex = clipStartColumn; clipColumnIndex <= clipEndColumn; clipColumnIndex++) {
          let column = trackRow.children[clipColumnIndex];
          
          let clipElement = document.createElement("div");
          clipElement.className = "clip-cell";
          
          clipElement.style.borderTop = "1px solid black";
          clipElement.style.borderBottom = "1px solid black";
          
          clipElement.style.height = "100%";
          
          if (clipColumnIndex == clipStartColumn) {
            clipElement.innerText = clip.name;
            clipElement.style.borderLeft = "1px solid black";
          }
          if (clipColumnIndex == clipEndColumn) {
            clipElement.style.borderRight = "1px solid black";
          }
          
          let isOffsetColumn = (clipColumnIndex == clipStartColumn && clipStartOffset != 0) || (clipColumnIndex == clipEndColumn && clipEndOffset != 0);
          
          if (isOffsetColumn) {
            console.log("offset column", clipColumnIndex)
            if (clipColumnIndex == clipStartColumn) {
              let columnWidth = column.getBoundingClientRect().width;
              clipElement.style.marginLeft = `${columnWidth * clipStartOffset}px`;
            } 
            else if (clipColumnIndex == clipEndColumn) {
              let columnWidth = column.getBoundingClientRect().width;
              clipElement.style.width = `${columnWidth * clipEndOffset}px`;
              clipElement.style.borderRight = "1px solid black";
            }
          }
          
          
          if (clipColumnIndex < clipRepeatStartColumn) {
            clipElement.style.backgroundColor = "var(--clip-bg)";
          }
          else {
            clipElement.style.backgroundColor = "var(--repeating-clip-bg)";
            let repeatColumnIndex = clipColumnIndex - clipRepeatStartColumn;
            if (repeatColumnIndex % clipRepeatColumnCount == 0) {
              clipElement.style.borderLeft = "1px solid rgba(50,50,50,0.5)";
            }
          }
          
          clipElement.addEventListener("click", () => {
            console.log("clip click")
            if (selectedClipElement)
              selectedClipElement.classList.remove("selected");
            clipElement.classList.add("selected");
            selectedClipElement = clipElement;
            selectedClip = clip;
            selectTrack
            showClip()
            clickTab(document.getElementById("clip-editor-tab-button"));
            ;
          });
            
          column.appendChild(clipElement);
          column.classList.add("clip-column-clip");
        }
        
        //let clipRepeats = ((clipEndInSixteenths - clipStartInSixteenths) / clipDurationInSixteenths) - 1;
      });
    }
    
    
    /* Old code */
    function renderTableOld() {
      let clipIndex = 1;
      let currentClip = null;
      let spanCounter = 0;
      let repeatingClip = null;
      let repeatCounter = 0;
      
      let clipStartCol = null;
      let clipEndCol = null;
      let clipRepeatStartCol = null;
      let clipRepeatEndCol = null;
      
      console.log(track.name)
      let currentCol = 0;
      for (bar = 1; bar <= 4; bar++) {
        for (beat = 1; beat <= 4; beat++) {
          for (sixteenth = 1; sixteenth <= 4; sixteenth++) {
            
            let columnElement = document.createElement("td");
            columnElement.className = "clip-column";
            if (beat % 2 == 0)
              columnElement.classList.add("banded");
            trackRow.appendChild(columnElement);
            
            let clipPosition = `${bar - 1}:${beat - 1}:${sixteenth - 1}`;
            let clip = track.clips.find(clip => clip.start.startsWith(clipPosition));
            if (clip) {
              repeatingClip = null;
              currentClip = null;
              
              let clipElement = document.createElement("div");
              clipElement.id = `${track.name}-Clip${clipIndex}`;
              clipElement.className = "Clip";
              clipElement.innerText = clip.name;
              
              let clipDurationInSixteenths = getSixteenths(Tone.Time(clip.duration).toBarsBeatsSixteenths());
              //clipElement.style.width = `${(clipDurationInSixteenths) * 102}%`;
              
              columnElement.colSpan = clipDurationInSixteenths;
              columnElement.appendChild(clipElement);
              
              clipStartCol = currentCol;
              clipEndCol = clipStartCol + (clipDurationInSixteenths - 1);
              clipRepeatStartCol = null;
              clipRepeatEndCol = null;
              if (clip.end) {
                let clipStartInSixteenths = getSixteenths(clip.start);
                let clipEndInSixteenths = getSixteenths(clip.end);
                let clipRepeats = ((clipEndInSixteenths - clipStartInSixteenths) / clipDurationInSixteenths) - 1;
                console.log("clip repeats", clipRepeats)
                
                if (clipRepeats > 0) {
                  clipRepeatStartCol = clipEndCol + 1;
                  clipRepeatEndCol = clipRepeatStartCol + (clipDurationInSixteenths * (clipRepeats - 1));
                  repeatingClip = clip;
                }
                /*let clipRepeatInSixteenths = (clipEndInSixteenths - clipStartInSixteenths) ;
                
                if (clipRepeatInSixteenths > clipDurationInSixteenths) {
                  clipRepeatStartCol = clipEndCol + 1;
                  clipRepeatEndCol = clipStartCol + clipRepeatInSixteenths - 1;
                  repeatingClip = clip;
                }*/
              }
              console.log("clip", track.name, clipStartCol, clipEndCol, clipRepeatStartCol, clipRepeatEndCol);
              
              currentClip = clipDurationInSixteenths > 1 ? clip : null;
              
              spanCounter = clipDurationInSixteenths > 1 ? spanCounter = clipDurationInSixteenths + 1 : 0;
              clipElement.addEventListener("click", () => {
                console.log("clip click")
                if (selectedClipElement)
                  selectedClipElement.classList.remove("selected");
                clipElement.classList.add("selected");
                selectedClipElement = clipElement;
                selectedClip = clip;
                showClip();
              });
              
              if (clip.start.indexOf(".")) {
                let clipOffset = parseFloat(`0.${clip.start.split(".")[1]}`);
                clipElement.classList.add("clip-with-offset");
                clipElement.dataset.offset = clipOffset;
                
                applyClipOffset(clipElement);
              }
              /*
              if (clip.end) {
                let clipStartInSixteenths = getSixteenths(clip.start);
                let clipEndInSixteenths = getSixteenths(clip.end);
                console.log("clip end", clipStartInSixteenths, clipEndInSixteenths)
                if (clipEndInSixteenths - clipStartInSixteenths > 1) {
                  repeatingClip = clip;
                  repeatCounter = clipEndInSixteenths - clipStartInSixteenths - 1;
                  clipElement.classList.add("Repeat");
                  
                }
              }
              */
              if (!repeatingClip) {
                clipElement.classList.add("ClipEnd");
              }
              clipIndex++;
            }
            else if (currentCol >= clipRepeatStartCol && currentCol <= clipRepeatEndCol && repeatingClip) {
              let clipElement = document.createElement("div");
              clipElement.id = `${track.name}-Clip${clipIndex}`;
              clipElement.className = "RepeatingClip";
              // clipElement.innerText = clip.name;
              let clipDurationInSixteenths = getSixteenths(repeatingClip.duration);
              clipElement.style.width = `${clipDurationInSixteenths * 100}%`;
              columnElement.appendChild(clipElement);
            }
           /* else if (repeatingClip) {
              
              let clipElement = document.createElement("div");
              clipElement.id = `${track.name}-Clip${clipIndex}`;
              clipElement.className = "RepeatingClip";
              // clipElement.innerText = clip.name;
              let clipDurationInSixteenths = getSixteenths(repeatingClip.duration);
              clipElement.style.width = `${clipDurationInSixteenths * 100}%`;
              columnElement.appendChild(clipElement);
              
              if (repeatingClip.start.indexOf(".")) {
                let clipOffset = parseFloat(`0.${repeatingClip.start.split(".")[1]}`);
                clipElement.classList.add("clip-with-offset");
                clipElement.dataset.offset = clipOffset;
                
                applyClipOffset(clipElement);
              }
              
              repeatCounter--;
              if (repeatCounter == 0) {
                repeatingClip = null;
                clipElement.classList.add("ClipEnd")
              }
            }*/
            
            currentCol++;
          }
        }
      }
    }
    
    trackRow.querySelectorAll("td div").forEach(header => header.addEventListener("click", () => selectTrack(header.closest("tr"))));
    return trackRow;
  }

  let trackRowHeaders = tracksTable.querySelectorAll("tr.track-row td div");
  trackRowHeaders.forEach(header => header.onclick = () => selectTrack(header.closest("tr")));
  
  /*tracksTable.querySelectorAll("tr.track-row td.track-header div").forEach(header => header.onclick = (e) => {
    selectTrack(header.closest("tr"));
    //clickTab(document.getElementById("devices-tab-button"));
  }*/
//  );
  //tracksTable.querySelectorAll("tr.track-row .clip-element").forEach(header => header.onclick = (e) => clickTab(document.getElementById("clip-editor-tab-button")));
    
  let trackNameElements = document.querySelectorAll("input[name='track-name']");
  trackNameElements.forEach(element => {
    element.ondblclick = () => element.readOnly ? element.readOnly = "" : element.readOnly = "true";
    element.onblur = () =>  element.readOnly = "true";
  });
}

function getSixteenths(time) {
  let parts = time.split(":");
  let bars = parseInt(parts[0]);
  let beats = (bars * 4) + parseInt(parts[1]);
  let sixteenths = (beats * 4) + parseFloat(parts[2]);
  //console.log("toSixteenths", time, sixteenths)
  return sixteenths;
}

function sizeTracksTableContainer() {
  console.log("size")
  let tracksTable = document.getElementById("tracks-table");
  //let devicesPanel = document.getElementById("track-devices-panel");
  //let pianoRollPanel = document.getElementById("clip-editor-panel");
  let bottomPanel = document.getElementById("bottom-panel");
  let pageHeight = window.innerHeight;
  
  //let bottomPanel = pianoRollPanel.style.display != "none" ? pianoRollPanel : devicesPanel;
  
  let bottomPanelHeight = bottomPanel.getBoundingClientRect().height;
  let bottomPanelTop = bottomPanelHeight > 0 ? bottomPanel.getBoundingClientRect().y : pageHeight;
  
  let tracksTableHeight = tracksTable.getBoundingClientRect().height;
  let tracksTableTop = tracksTable.getBoundingClientRect().y;
  
  if (!tracksTable.dataset.initialY) {
    tracksTable.dataset.initialY = tracksTableTop;
    //console.log("top", tracksTableTop);
  } 
  
  let availableHeight = bottomPanelTop - tracksTable.dataset.initialY;
  let overflow = availableHeight - (tracksTableHeight);
  //console.log("overflow", overflow, tracksTable.getBoundingClientRect());
  
  if (overflow < 0) {
    //console.log("overflow fix", overflow);
    tracksTable.parentElement.style.maxHeight = `${tracksTableHeight + overflow}px`;
    tracksTable.parentElement.style.height = tracksTable.parentElement.style.maxHeight;
  }
  else
  {
   // console.log("no overflow", overflow);
    tracksTable.parentElement.style.maxHeight = `${tracksTableHeight}px`;
    tracksTable.parentElement.style.height = tracksTable.parentElement.style.maxHeight;
  }
}