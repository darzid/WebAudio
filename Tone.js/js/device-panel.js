function showTrackDevices() {
  let trackId = selectedTrackId;
  let devicesPanelHeader = document.querySelector("#devices-panel .panel-header");
  let devicesPanelContent = document.querySelector("#devices-panel .panel-content");
  devicesPanelContent.style.display = selectedTrackId ? "block" : "none";
  let track = tracks.find(track => track.name == trackId);
  devicesPanelContent.innerHTML = "";
  
  if (track && track.devices && track.devices.length > 0){
    let deviceIndex = 1;
    track.devices.forEach(device => {
      let deviceId = `${trackId}-Device${deviceIndex}`;
      
      let deviceElement = document.createElement("div");
      deviceElement.className = "device";
      deviceElement.id = deviceId;
      devicesPanelContent.appendChild(deviceElement);
      
      let deviceHeaderElement = document.createElement("div");
      deviceHeaderElement.className = "panel-header";
      deviceHeaderElement.innerHTML = `<button class="control toggle-button enabled-button active"></button>${device.name}`;
      deviceElement.appendChild(deviceHeaderElement);
      
      let addDeviceButton = document.createElement("button");
      addDeviceButton.className = "add-device";
      addDeviceButton.innerText = "Add";
      deviceHeaderElement.appendChild(addDeviceButton);
      
    addDeviceButton.onclick = () => addDevice(trackId, 0);
      let deviceContentElement = document.createElement("div");
      deviceContentElement.className = "panel-content";
      deviceElement.appendChild(deviceContentElement);
      
      let tabstripElement = document.createElement("div");
      tabstripElement.className = "tab";
      deviceContentElement.appendChild(tabstripElement);
      
      if (device.parameterGroups) {
        Object.keys(device.parameterGroups).forEach(parameterGroupName => {
          let tabButton = document.createElement("button");
          tabButton.className = "tablinks";
          tabButton.onclick = (e) => openTab(e.currentTarget, deviceElement);
          tabButton.innerText = parameterGroupName;
          tabButton.dataset.deviceId = deviceId;
          tabstripElement.appendChild(tabButton);
        });
        
        Object.keys(device.parameterGroups).forEach(parameterGroupName => {
          let tabContent = document.createElement("div");
          tabContent.className = "tabcontent";
          tabContent.id = parameterGroupName;
          deviceContentElement.appendChild(tabContent);
          
          Object.keys(device.parameterGroups[parameterGroupName]).forEach(parameterName => {
            let parameterLabelElement = document.createElement("label");
            parameterLabelElement.className = "number-label";
            parameterLabelElement.innerHTML =
              `${parameterName}<input class="control" type="number" min="0" max="127" value="${device.parameterGroups[parameterGroupName][parameterName]}">`;
            tabContent.appendChild(parameterLabelElement);
          })
        });
        openTab(tabstripElement.childNodes[0], deviceElement, tabstripElement.childNodes[0].innerText);
      }
      initializeNumberInputs(deviceElement);
      initializeToggleButtons(deviceElement);
      deviceIndex++;
    });
    
  }
  else {
    let addDeviceButton = document.createElement("button");
    addDeviceButton.className = "add-device image-button control";
    addDeviceButton.innerHTML = '<img src="img/plus-black.png">';
    devicesPanelContent.appendChild(addDeviceButton);
    addDeviceButton.onclick = () => addDevice(trackId, 0);
  }
  
  sizeTracksTableContainer();
}

