function initializeTableZoom(tracksTable, zoomElement) {
  
  let positionColumns = tracksTable.querySelectorAll(".position-column");
  let barHeaderColumns = tracksTable.querySelectorAll(".bar-header-column");
  let beatHeaderColumns = tracksTable.querySelectorAll(".beat-header-column"); 
  let sixteenthHeaderColumns = tracksTable.querySelectorAll(".sixteenth-header-column"); 
  
  let barDetailColumns = tracksTable.querySelectorAll(".bar-detail-column");
  let beatDetailColumns = tracksTable.querySelectorAll(".beat-detail-column");
  console.log("Found " + beatDetailColumns.length + " detail columns")
  let clipColumns = tracksTable.querySelectorAll(".clip-column");
  let clipsWithOffset = tracksTable.querySelectorAll(".clip-with-offset");
  let zoomOutput = document.getElementById("zoom-output");
  
  let zoomFactor = zoomElement.value / 100;
  
  let tableHead = tracksTable.querySelector("thead");
  var tableHeadStyle = window.getComputedStyle(tableHead, null).getPropertyValue('font-size');
  tableHead.dataset.fontSize = parseFloat(tableHeadStyle);
  
  clipColumns.forEach(column => {
    column.dataset.width = column.getBoundingClientRect().width;
  });
  positionColumns.forEach(column => {
    column.dataset.width = column.getBoundingClientRect().width;
  });
  beatDetailColumns.forEach(column => {
    column.dataset.display = column.style.display;
  });
  zoomElement.oninput = () => {
    let zoom = parseFloat(zoomElement.value);
    let zoomFactor = zoom / 100;
    
    let tableHeadFontSize = zoomFactor < 1 ? tableHead.dataset.fontSize * (zoomFactor / 2) : tableHead.dataset.fontSize;
    zoomOutput.innerText = `${zoomElement.value}%`;
    
    clipColumns.forEach(column => {
      column.style.maxWidth = (column.dataset.width * zoomFactor) + "px";
      column.style.minWidth = (column.dataset.width * zoomFactor) + "px";
      column.style.width = (column.dataset.width * zoomFactor) + "px";
    });
    clipsWithOffset.forEach(clip => {
      applyClipOffset(clip);
    })
    
    
    let showSixteenthColumns = zoom >= 50;
    
    
    barHeaderColumns.forEach(column => column.colSpan = showSixteenthColumns ? 1 : 4);
    beatHeaderColumns.forEach(column => column.colSpan = showSixteenthColumns ? 1 : 4);
    sixteenthHeaderColumns.forEach(column => column.style.display = showSixteenthColumns ? column.dataset.display : "none");
    
    positionColumns.forEach(column => {
      if (column.style.display != "none") {
        column.style.maxWidth = (column.dataset.width * zoomFactor) + "px";
        column.style.minWidth = (column.dataset.width * zoomFactor) + "px";
        column.style.width = (column.dataset.width * zoomFactor) + "px";
      }
    });
    
  };
}