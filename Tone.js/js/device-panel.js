function showTrackDevices() {
  let trackId = selectedTrackId;
  let devicesPanelHeader = document.querySelector("#devices-panel .panel-header");
  let devicesPanelContent = document.querySelector("#devices-panel .panel-content");
  devicesPanelContent.style.display = selectedTrackId ? "flex" : "none";
  let track = session.project.tracks.find(track => track.name == trackId);
  devicesPanelContent.innerHTML = "";
  
  if (track && track.devices && track.devices.length > 0){
    
    let deviceIndex = 1;
    //console.log("Track", track.projectFileTrack);
    track.devices.forEach(device => {
      createDeviceEditor(device, deviceIndex);
      deviceIndex++;
    });
    
  }
  else {
    
    let addDeviceButton = document.createElement("button");
    addDeviceButton.className = "add-device image-button control";
    addDeviceButton.innerHTML = '<img src="img/plus-black.png">';
    devicesPanelContent.appendChild(addDeviceButton);
    addDeviceButton.onclick = () => deviceBrowser.show(addDeviceButton, addDeviceCallback);
  }
  
  sizeTracksTableContainer();
  
  function addDeviceCallback(deviceDefinition) {
    console.log("add device " + deviceDefinition.name, deviceDefinition);
    let device = track.addDevice("Instrument", deviceDefinition.name, {});
    createDeviceEditor(device, track.devices.length + 1);
  }
  
  function createDeviceEditor(device, deviceIndex) {
    console.log("device", device);
    //let deviceDefinition = deviceBrowser.getDeviceDefinition(device.name);
    let deviceId = `${trackId}-Device${deviceIndex}`;
      
    let deviceEditorElement = document.createElement("div");
    deviceEditorElement.className = "device";
    deviceEditorElement.id = deviceId;
    devicesPanelContent.appendChild(deviceEditorElement);
      
    let deviceHeaderElement = document.createElement("div");
    deviceHeaderElement.className = "panel-header";
    deviceHeaderElement.innerHTML = `<button class="control toggle-button enabled-button active"></button>${device.name}`;
    deviceEditorElement.appendChild(deviceHeaderElement);
      
    let insertDeviceButton = document.createElement("button");
    insertDeviceButton.className = "add-device";
    insertDeviceButton.innerText = "Add";
    insertDeviceButton.onclick = () => deviceBrowser.show(insertDeviceButton, addDeviceCallback);
    deviceHeaderElement.appendChild(insertDeviceButton);
      
    let deviceContentElement = document.createElement("div");
    deviceContentElement.className = "panel-content";
    deviceEditorElement.appendChild(deviceContentElement);
      
    let tabstripElement = document.createElement("div");
    tabstripElement.className = "tab";
    deviceContentElement.appendChild(tabstripElement);
    
    let deviceDefinition = deviceBrowser.getDeviceDefinition(device.name);
    createParameterGroupTabButtons(deviceDefinition.parameterGroups);
    Object.keys(deviceDefinition.parameterGroups).forEach(paramgroupName=> {
      console.log("device tab", paramgroupName);
      createParameterGroupTabContent(device, paramgroupName, deviceDefinition.parameterGroups[paramgroupName]);
    });
    /*
    let parameterGroups = {
      "General": []
    };
    
    Object.keys(deviceDefinition.parameters).forEach(paramKey => {
      let paramNamespace = deviceDefinition[paramKey];
      let paramNamespaceParts = paramNamespace.split("/");
      let paramPath = paramNamespaceParts[0];
      let paramName = paramNamespaceParts[1];
      
      let groupName = (paramPath === "unitTypes") ? "General" : paramKey;
      if (!parameterGroups[groupName]) {
        parameterGroups[groupName] = [];
      }
      parameterGroups[groupName].push(paramNamespace);
      }
      else {
        parameterGroups[paramKey].push(paramName);
      }
    });
    var generalParameters = Object.keys(deviceDefinition.parameters)
      .reduce(function (filtered, key) {
        if (deviceDefinition.parameters[key].) filtered[key] = deviceDefinition.parameters[key];
          return filtered;
      }, {});
    
    let generalParameters = deviceDefinition.parameters.filter(parameter => parameter.value.starts)
    console.log(device, device.parameterGroups);
    let parameterGroups = track.projectFileTrack.devices[device.name].parameterGroups ? device.parameterGroups : { "general": track.projectFileTrack.devices[device.name].parameters };
      
    if (parameterGroups) {
      createParameterGroupTabButtons(device);
      Object.keys(device.parameterGroups).forEach(parameterGroupName => {
        createParameterGroupTabContent(device, parameterGroupName);
      });
      openTab(tabstripElement.childNodes[0], deviceEditorElement, tabstripElement.childNodes[0].innerText);
    }
    */
    /*initializeNumberInputs(deviceEditorElement);
    initializeToggleButtons(deviceEditorElement);
    */
    
    function createParameterGroupTabButtons(parameterGroups) {
      Object.keys(parameterGroups).forEach(parameterGroupName => {
        let tabButton = document.createElement("button");
        tabButton.className = "tablinks";
        tabButton.onclick = (e) => openTab(e.currentTarget, deviceEditorElement);
        tabButton.innerText = parameterGroupName;
        tabButton.dataset.deviceId = deviceId;
        tabstripElement.appendChild(tabButton);
      });
    }
    
  
    function createParameterGroupTabContent(device, parameterGroupName, parameterGroup) {
      console.log("device", device)
      let tabContent = document.createElement("div");
      tabContent.className = "tabcontent";
      tabContent.id = parameterGroupName;
      deviceContentElement.appendChild(tabContent);
        
      Object.keys(parameterGroup).forEach(parameterName => {
        let parameterLabelElement = document.createElement("label");
        parameterLabelElement.className = "number-label";
      
        parameterLabelElement.innerHTML =
         `${parameterName}<number-input class="control-without-bg" fill="#00b7b7" background="white" step="${parameterGroup[parameterName].step}" min="${parameterGroup[parameterName].min}" max="${parameterGroup[parameterName].max}" value="${device[parameterName]}">`;
        tabContent.appendChild(parameterLabelElement);
      });
    }
    
  }
}


