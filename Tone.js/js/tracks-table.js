function fillTracksTable(tracksTable, tracks)
{
  let tracksTableHeaderRow = tracksTable.querySelector(".header-row");
  let leftTopHeader = document.createElement("th");
  leftTopHeader.innerText = "";
  
  tracksTableHeaderRow.appendChild(leftTopHeader);
  
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
  
  
  let tracksTableBody = tracksTable.querySelector("tbody");
  
  tracks.forEach(track => {
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
    for (bar = 1; bar <= 4; bar++) {
      for (beat = 1; beat <= 4; beat++) {
        for (sixteenth = 1; sixteenth <= 4; sixteenth++) {
          let columnElement = document.createElement("td");
          columnElement.className = "clip-column";
          if (beat % 2 == 0) 
            columnElement.classList.add("banded");
          trackRow.appendChild(columnElement);
          
          let clipPosition = `${bar}:${beat}:${sixteenth}`;
          
          let clip = track.clips.find(clip => clip.position.startsWith(clipPosition));
          if (clip) {
            
            
            let clipElement = document.createElement("div");
            clipElement.id = `${track.name}-Clip${clipIndex}`;
            clipElement.className = "Clip";
            clipElement.innerText = clip.name;
            
            let clipDurationInSixteenths = getSixteenths(clip.duration);
            
            clipElement.style.width = `${clipDurationInSixteenths * 100}%`;
            
            columnElement.appendChild(clipElement);
            
            if (clip.position.indexOf(".")) {
              let clipOffset = parseFloat(`0.${clip.position.split(".")[1]}`);
              clipElement.classList.add("clip-with-offset");
              clipElement.dataset.offset = clipOffset;
              
              applyClipOffset(clipElement);
            }
            
            clipIndex++;
          }
        }
      }
    }
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
