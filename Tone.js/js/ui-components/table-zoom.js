function initializeTableZoom(tracksTable, zoomElement) {
  
  let positionColumns = tracksTable.querySelectorAll(".position-column");
  let clipColumns = tracksTable.querySelectorAll(".clip-column");
  let clipsWithOffset = tracksTable.querySelectorAll(".clip-with-offset");
  
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
  
  zoomElement.oninput = () => {
    let zoomFactor = zoomElement.value / 100;
    
    let tableHeadFontSize = zoomFactor < 1 ? tableHead.dataset.fontSize * zoomFactor : tableHead.dataset.fontSize;
    tableHead.style.fontSize = tableHeadFontSize + "px";
    
    clipColumns.forEach(column => {
      column.style.maxWidth = (column.dataset.width * zoomFactor) + "px";
      column.style.minWidth = (column.dataset.width * zoomFactor) + "px";
    });
    clipsWithOffset.forEach(clip => {
      applyClipOffset(clip);
    })
    positionColumns.forEach(column => {
      column.style.maxWidth = (column.dataset.width * zoomFactor) + "px";
      column.style.minWidth = (column.dataset.width * zoomFactor) + "px";
    });
  };
}