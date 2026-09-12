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
    deviceDefinition.parameterGroups.forEach(parameterGroup => {
      //console.log("device tab " + paramgroupName, deviceDefinition.parameterGroups);
      createParameterGroupTabContent(device, parameterGroup);
    });
    openTab(tabstripElement.childNodes[0], deviceEditorElement);

    function createParameterGroupTabButtons(parameterGroups) {
      parameterGroups.forEach(parameterGroup => {
        let tabButton = document.createElement("button");
        tabButton.className = "tablinks";
        tabButton.onclick = (e) => openTab(e.currentTarget, deviceEditorElement);
        tabButton.innerText = parameterGroup.name;
        tabButton.dataset.deviceId = deviceId;
        tabstripElement.appendChild(tabButton);
      });
    }
  
    function createParameterGroupTabContent(device, parameterGroup) {
      //console.log("createParameterGroupTabContent " + parameterGroupName, device, parameterGroup)
      let tabContent = document.createElement("div");
      tabContent.className = "tabcontent";
      tabContent.id = parameterGroup.name;
      deviceContentElement.appendChild(tabContent);
      
      Object.keys(parameterGroup.parameters).forEach(parameterName => {
        
        let parameterLabelElement = document.createElement("label");
        
        let parameter = parameterGroup.parameters[parameterName];
        if (!parameter.values) {
          let paramValue = device[parameterName] ? device[parameterName].name ? device[parameterName].value : device[parameterName] : "0";
          //console.log(`${device.name}.${parameterName} = `, paramValue)
          parameterLabelElement.className = "number-label red";
          parameterLabelElement.innerHTML = parameterName;
          
           //<number-input id="${parameterGroup.name}-${parameterName}" fill="red" step="${parameter.step}" min="${parameter.min}" max="${parameter.max}" value="${paramValue}">`;
          
         /* let numberInput = document.createElement("number-input");
          numberInput.id = `${parameterGroup.name}-${parameterName}`;
          numberInput.step=parameter.step;
          numberInput.min=parameter.min;
          numberInput.max=parameter.max;
          numberInput.value=paramValue;
          numberInput.classList.add("param-input");*/
          parameterLabelElement.innerHTML += `<number-input id="${parameterGroup.name}-${parameterName}" step="${parameter.step}" min="${parameter.min}" max="${parameter.max}" value="${paramValue}">`
          //parameterLabelElement.appendChild(numberInput);
          //numberInput.fill = "orange";
          let numberInput = document.getElementById(`${parameterGroup.name}-${parameterName}`);
          numberInput.addEventListener("change" = (e) => {
            if (device[parameterName].name) {
              device[parameterName].value = numberInput.value;
            } else 
              device[parameterName] = numberInput.value;
            console.log(`device ${parameterName} updated to ${numberInput.value}`);
          });
          console.log(`created number input ${parameterGroup.name}-${parameterName}`);
          
        } else {
          let optionsHtml = "";
          parameter.values.forEach(value => optionsHtml += "<option>" + value + "</option>");
          parameterLabelElement.innerHTML =
           `${parameterName}<select value="${device[parameterName]}">${optionsHtml}</select>`;
          parameterLabelElement.className = "select-label";
          
        }
        tabContent.appendChild(parameterLabelElement);
      });
      if (parameterGroup.name.startsWith("filter")) {
          console.log(parameterGroup.name + " tab", tabContent);
        }
    }
    
  }
}


