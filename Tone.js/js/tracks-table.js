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
    selectedTrackRow = trackRow;
    showTrackDevices(trackRow.id.split("-row")[0]);
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
    
    trackHeaderDiv.innerHTML = `<button class="control toggle-button enabled-button active"></button>
                    <label><input name="track-name" class="control medium-width" type="text" value="${track.name}" readonly></label>`;
    
    let clipIndex = 1;
    let repeatingClip = null;
    let repeatCounter = 0;
    for (bar = 1; bar <= 4; bar++) {
      for (beat = 1; beat <= 4; beat++) {
        for (sixteenth = 1; sixteenth <= 4; sixteenth++) {
          let columnElement = document.createElement("td");
          columnElement.className = "clip-column";
          if (beat % 2 == 0)
            columnElement.classList.add("banded");
          trackRow.appendChild(columnElement);
          
          let clipPosition = `${bar}:${beat}:${sixteenth}`;
          
          
          let clip = track.clips.find(clip => clip.start.startsWith(clipPosition));
          if (clip) {
            repeatingClip = null;
            
            let clipElement = document.createElement("div");
            clipElement.id = `${track.name}-Clip${clipIndex}`;
            clipElement.className = "Clip";
            
            clipElement.innerText = clip.name;
            
            let clipDurationInSixteenths = getSixteenths(clip.duration);
            clipElement.style.width = `${clipDurationInSixteenths * 100}%`;
            
            columnElement.appendChild(clipElement);
            
            if (clip.start.indexOf(".")) {
              let clipOffset = parseFloat(`0.${clip.start.split(".")[1]}`);
              clipElement.classList.add("clip-with-offset");
              clipElement.dataset.offset = clipOffset;
              
              applyClipOffset(clipElement);
            }
            
            if (clip.end) {
              let clipStartInSixteenths = getSixteenths(clip.start);
              let clipEndInSixteenths = getSixteenths(clip.end);
              if (clipEndInSixteenths - clipStartInSixteenths > 1) {
                repeatingClip = clip;
                repeatCounter = clipEndInSixteenths - clipStartInSixteenths - 1;
                clipElement.classList.add("Repeat");
              }
            }
            
            if (!repeatingClip) {
              clipElement.classList.add("ClipEnd");
            }
            clipIndex++;
          }
          else if (repeatingClip) {
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
          }
        }
      }
    }
    
    trackRow.querySelectorAll("td div").forEach(header => {
      header.onclick = () => selectTrack(header.closest("tr"));
    });
    return trackRow;
  }

  let trackRowHeaders = tracksTable.querySelectorAll("tr.track-row td div");
  trackRowHeaders.forEach(header => header.onclick = () => {
    selectTrack(header.closest("tr"));
  });
  
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
  return sixteenths;
}


function sizeTracksTableContainer() {
  let tracksTable = document.getElementById("tracks-table");
  let devicesPanel = document.getElementById("track-devices-panel");
  
  let pageHeight = window.innerHeight;
    
  let devicesPanelHeight = devicesPanel.getBoundingClientRect().height;
  let devicesPanelTop = devicesPanelHeight > 0 ? devicesPanel.getBoundingClientRect().y : pageHeight;
  
  
  let tracksTableHeight = tracksTable.getBoundingClientRect().height;
  let tracksTableTop = tracksTable.getBoundingClientRect().y;
  
  if (!tracksTable.dataset.initialY) {
    tracksTable.dataset.initialY = tracksTableTop;
    console.log("top", tracksTableTop);
  } 
  
  let availableHeight = devicesPanelTop - tracksTable.dataset.initialY;
  let overflow = availableHeight - (tracksTableHeight);
  console.log("overflow", overflow, tracksTable.getBoundingClientRect());
  
  if (overflow < 0) {
    console.log("overflow fix", overflow);
    tracksTable.parentElement.style.maxHeight = `${tracksTableHeight + overflow}px`;
    tracksTable.parentElement.style.height = tracksTable.parentElement.style.maxHeight;
  }
  else
  {
    console.log("no overflow", overflow);
    tracksTable.parentElement.style.maxHeight = `${tracksTableHeight}px`;
    tracksTable.parentElement.style.height = tracksTable.parentElement.style.maxHeight;
  }
}