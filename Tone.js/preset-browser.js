function loadPresets() {
  fetch('.\\preset-bank.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      presets = data;
      let presetBrowser = document.getElementById("PresetBrowser");
      document.getElementById('presets-data').textContent = JSON.stringify(data, null, 2);

      let presetPaths = Object.keys(data);
      presetPaths.forEach(presetPath => {
        presetPath = presetPath.replace("effect\\", "").replace("instrument\\", "").replace(".json", "");
        let deviceName = presetPath.split("\\")[0];

        let devicePresetSelect = document.getElementById(deviceName + "-presets");
        if (!devicePresetSelect) {
          devicePresetSelect = document.createElement("select");
          devicePresetSelect.id = `${deviceName}-presets`;
          devicePresetSelect.size = 5;
          devicePresetSelect.style.display = "none";
          presetBrowser.appendChild(devicePresetSelect);
        }

        let option = document.createElement("option");
        option.innerText = presetPath.split("\\")[1];
        devicePresetSelect.appendChild(option);
      })
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
    });
}

function showPresetBrowser(device, deviceElement) {
  let deviceName = deviceElement.getAttribute("name");
  let presetListElement = document.getElementById(`${deviceName}-presets`);
  if (!presetListElement) {
    return;
  }
  let boundingRect = deviceElement.querySelector(".title-bar").getBoundingClientRect();
  presetListElement.style.position = "absolute";
  presetListElement.style.left = `${boundingRect.left}px`;
  presetListElement.style.top = `${boundingRect.top + boundingRect.height}px`;
  presetListElement.style.width = `${boundingRect.width}px`;
  presetListElement.style.display = "inline";
  presetListElement.addEventListener("change", () => applyPreset(device, deviceElement, presetListElement, presetListElement.value));
}

function applyPreset(device, deviceElement, presetListElement, presetName) {
  let presetPaths = Object.keys(presets);
  let presetPath = presetPaths.find(presetPath => presetPath.endsWith("\\" + presetName));
  let preset = presets[presetPath];

  let presetParameterNames = Object.keys(preset);
  let presetCursor = preset;
  let module = device;
  applyModuleParameters(presetCursor, module, presetParameterNames);

  let addEventHandler = false;

  let numberParameters = deviceElement.querySelectorAll(".Parameter input");
  numberParameters.forEach(element => {
    bindNumberInputElement(element, device, addEventHandler);
  });

  let optionParameters = deviceElement.querySelectorAll(".Parameter select");
  optionParameters.forEach(element => {
    bindOptionSelectElement(element, device, addEventHandler);
  });

  presetListElement.style.display = "none";
  console.log(`Preset ${presetName} applied`);
}

function applyModuleParameters(presetCursor, module, presetParameterNames) {
  presetParameterNames.forEach(paramName => {
    if (typeof presetCursor[paramName] === "object") {
      let moduleParamNames = Object.keys(presetCursor[paramName]);
      applyModuleParameters(presetCursor[paramName], module[paramName], moduleParamNames);
    }
    else {
      let paramType = typeof presetCursor[paramName];
      if (paramType === "number" || paramType === "string") {
        if (typeof module[paramName] != "object") {
          module[paramName] = presetCursor[paramName];
        } else {
          module[paramName].value = presetCursor[paramName];
        }
      }
    }
  });
}

