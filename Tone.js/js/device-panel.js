function showTrackDevices(trackId) {
  let devicesPanelHeader = document.querySelector("#track-devices-panel .panel-header");
  let devicesPanelContent = document.querySelector("#track-devices-panel .panel-content");

  let track = tracks.find(track => track.name == trackId);
  console.log(trackId, track.devices);
  devicesPanelHeader.innerText = `Devices - ${trackId}`;
  devicesPanelContent.innerHTML = "";
  
  let deviceIndex = 1;
  track.devices.forEach(device => {
    let deviceElement = document.createElement("div");
    deviceElement.className = "device panel";
    deviceElement.id = `${trackId}-Device${deviceIndex}`;
    devicesPanelContent.appendChild(deviceElement);
    
    let deviceHeaderElement = document.createElement("div");
    deviceHeaderElement.className = "panel-header";
    deviceHeaderElement.innerHTML = `<button class="control toggle-button enabled-button active"></button>${device.name}`;
    deviceElement.appendChild(deviceHeaderElement);
    
    let deviceContentElement = document.createElement("div");
    deviceContentElement.className = "panel-content";
    deviceElement.appendChild(deviceContentElement);
    
    Object.keys(device.parameters).forEach(parameterName => {
      let parameterLabelElement = document.createElement("label");
      parameterLabelElement.className = "number-label";
      parameterLabelElement.innerHTML =
        `${parameterName}<input class="control" type="number" min="0" max="127" value="${device.parameters[parameterName]}">`;
      deviceContentElement.appendChild(parameterLabelElement);
    })
    initializeNumberInputs(deviceElement);
    initializeToggleButtons(deviceElement);
    deviceIndex++;
  })
}