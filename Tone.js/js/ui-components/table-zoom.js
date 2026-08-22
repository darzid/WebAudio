function initializeTableZoom(tracksTable, zoomElement) {
  
  let positionColumns = tracksTable.querySelectorAll(".position-column");
  let clipColumns = tracksTable.querySelectorAll(".clip-column");
  let clipsWithOffset = tracksTable.querySelectorAll(".clip-with-offset");
  
  let zoomFactor = zoomElement.value / 100;
  let tableHead = tracksTable.querySelector("thead");
  var style = window.getComputedStyle(tableHead, null).getPropertyValue('font-size');
  tableHead.dataset.fontSize = parseFloat(style);
  clipColumns.forEach(column => {
    column.dataset.width = column.getBoundingClientRect().width;
  });
  positionColumns.forEach(column => {
    column.dataset.width = column.getBoundingClientRect().width;
  });
  
  zoomElement.oninput = () => {
    let zoomFactor = zoomElement.value / 100;
    //tableHead.style.fontSize = (tableHead.dataset.fontSize * zoomFactor) + "px";
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