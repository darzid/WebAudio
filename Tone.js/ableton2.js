let timeline = document.getElementById("timeline");

let left = 0;
let index = 0;
for (bar = 1; bar <= 4; bar++) {
  for (beat = 1; beat <= 4; beat++) {
    for (sixteenth = 1; sixteenth <= 4; sixteenth++) {
      let className = (sixteenth > 1) ? "sixteenth" : (beat > 1) ? "beat" : "bar";
      let timelineElement = document.createElement("div");
      timelineElement.className = className;
      
      timelineElement.innerText = `${bar}:${beat}:${sixteenth}`;
      timelineElement.title = `${bar}:${beat}:${sixteenth}`;
      timelineElement.style.width = "50px";
      timelineElement.style.left = left + "px"
      timelineElement.dataset.index = index;
      timeline.appendChild(timelineElement);
      
      left += 0;
      index++;
    }
  }
}


let trackClips2 = {
  "Kick": {
    "1:1:1": "Kick",
    "1:2:1": "Kick",
    "1:3:1": "Kick",
    "1:4:1": "Kick",
    "2:1:1": "Kick",
    "2:2:1": "Kick",
    "2:3:1": "Kick",
    "2:4:1": "Kick"
  },
  "Bass": {
    "1:1:2": "Bass01",
    "1:1:3": "Bass02",
    "1:1:4": "Bass03",
    "1:2:2": "Bass01",
    "1:2:3": "Bass02",
    "1:2:4": "Bass03",
    "1:3:2": "Bass01",
    "1:3:3": "Bass02",
    "1:3:4": "Bass03",
    "1:4:2": "Bass01",
    "1:4:3": "Bass02",
    "1:4:4": "Bass03",
    "2:1:2": "Bass01",
    "2:1:3": "Bass02",
    "2:1:4": "Bass03",
    "2:2:2": "Bass01",
    "2:2:3": "Bass02",
    "2:2:4": "Bass03",
    "2:3:2": "Bass01",
    "2:3:3": "Bass02",
    "2:3:4": "Bass03",
    "2:4:2": "Bass01",
    "2:4:3": "Bass02",
    "2:4:4": "Bass03"
  },
  "OpenHat": {
    "1:1:3": "OH",
    "1:2:3": "OH",
    "1:3:3": "OH",
    "1:4:3": "OH",
    "2:1:3": "OH",
    "2:2:3": "OH",
    "2:3:3": "OH",
    "2:4:3": "OH",
  },
  "Track4": {},
  "Track5": {},
  "Track6": {},
  "Track7": {},
  "Track8": {},
  "Track9": {},
  "Track10": {}
};

let trackClips = {
  "Kick": {
    "1:1:1": "Kick",
    "1:2:1": "Kick",
  },
  "Bass": {
    "1:1:3": "Bass01",
  },
  "OpenHat": {
    "1:1:3": "OH",
  },
  "Track4": {},
  "Track5": {},
  "Track6": {},
  "Track7": {},
  "Track8": {},
  "Track9": {},
  "Track10": {},
  "Track11": {},
  "Track12": {},
  "Track13": {},
  "Track14": {},
  "Track15": {},
  "Track16": {},
  "Track17": {},
  "Track18": {},
  "Track19": {},
  "Track20": {},
  "Track21": {},
  "Track22": {},
  "Track23": {},
  "Track24": {}
};

let sixteenthWidth = document.querySelector("#timeline div[title='1:1:1']").getBoundingClientRect().width;

let tracksTable = document.getElementById("tracks-table");
let tracksTableBody = tracksTable.querySelector("tbody");

Object.keys(trackClips).forEach(track => {
  let trackRow = document.createElement("tr");
  trackRow.id = track + "-row";
  trackRow.className = "track-row";
  tracksTableBody.appendChild(trackRow);
  
  let trackHeaderColumn = document.createElement("td");
  trackHeaderColumn.classList.add("track-header");
  trackHeaderColumn.classList.add("control");
  trackRow.appendChild(trackHeaderColumn);
  
  let trackHeaderDiv = document.createElement("div");
  trackHeaderColumn.appendChild(trackHeaderDiv);
  
  trackHeaderDiv.innerHTML = `<button class="control toggle-button enabled-button active"></button>
              <label><input name="track-name" class="control medium-width" type="text" value="${track}" readonly></label>`;
  
  let trackClipsColumn = document.createElement("td");
  trackClipsColumn.classList.add("track-clips");
  trackRow.appendChild(trackClipsColumn);
  
  let trackClipsElement = document.querySelector(`#${track}-row td.track-clips`);
  
  Object.keys(trackClips[track]).forEach(clipPosition => {
    let clipElement = document.createElement("div");
    clipElement.className = "Clip";
    clipElement.innerText = trackClips[track][clipPosition];
    clipElement.title = clipPosition;
    clipElement.style.width = (sixteenthWidth - 2) + "px";
    
    let timelineElement = timeline.querySelector(`div[title='${clipPosition}']`);
    let clipSixteenthIndex = timelineElement.dataset.index;
    
    let previousClip = trackClipsElement.lastChild;
    let previousClipTimelineElement = previousClip ? timeline.querySelector(`div[title='${previousClip.title}']`) : null;
    let previousClipSixteenthIndex = previousClipTimelineElement ? previousClipTimelineElement.dataset.index : null;
    
    let indexGap = previousClipSixteenthIndex ? clipSixteenthIndex - (previousClipSixteenthIndex + 1) : clipSixteenthIndex;
    let clipLeft = indexGap * sixteenthWidth;
    clipElement.style.left = `${clipLeft - 1}px`;
    console.log(track + "-" + clipElement.innerText, clipSixteenthIndex);
    trackClipsElement.appendChild(clipElement);
  })
});

let trackNameElements = document.querySelectorAll("input[name='track-name']");
trackNameElements.forEach(element => {
  element.ondblclick = () => element.readOnly ? element.readOnly = "" : element.readOnly = "true";
  element.onblur = () => element.readOnly = "true";
});


let selectedTrackRow = null;
let trackRowHeaders = tracksTable.querySelectorAll("tr.track-row td div");
trackRowHeaders.forEach(header => header.onclick = () => {
  let trackRow = header.closest("tr");
  if (selectedTrackRow)
    selectedTrackRow.classList.remove("selected");
  trackRow.classList.add("selected");
  selectedTrackRow = trackRow;
});


let zoomElement = document.getElementById("zoom");
let columns = tracksTable.querySelectorAll("td div");
//console.log("columns", columns, columns[0].style.width);
columns.forEach(column => {
  column.dataset.width = column.getBoundingClientRect().width;
  column.dataset.width = parseFloat(column.style.width);
  if (column.classList.contains("Clip")) {
    
    column.dataset.marginLeft = parseFloat(column.style.marginLeft);
    //    if (column.innerText == "Kick2")
    // console.log("Clip", column, column.dataset.width, column.dataset.marginLeft)
  }
  
});

zoomElement.oninput = () => {
  let columns = tracksTable.querySelectorAll("td div");
  
  columns.forEach(column => {
    let zoomFactor = zoomElement.value / 100;
    
    column.style.width = (column.dataset.width * zoomFactor) + "px";
    
    if (column.classList.contains("Clip")) {
      column.style.marginLeft = (column.dataset.marginLeft * zoomFactor) + "px";
      if (column.innerText == "Kick2") {
        // console.log(`zoom ${zoomElement.value}% [${zoomFactor}] ${column.innerText}`, column.style.marginLeft, column.style.width);
        firstZoom = false;
      }
    }
  });
};

document.querySelectorAll(".toggle-button")
  .forEach((button) => button.addEventListener("click", () => button.classList.toggle("active")));