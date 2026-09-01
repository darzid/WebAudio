class DeviceBrowser {
  _deviceBank = null;
  _deviceSelect = null;
  _visibleDeviceListElement = null;
  _lastDevice = null;

  constructor() {
  }

  async loadDevices() {
    console.log("Load presets")
    await fetch('.\\data\\devices.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(deviceBank => {
        this._deviceBank = deviceBank;
        
        this._deviceSelect = document.createElement("select");
        this._deviceSelect.id = 'device-list';
      //  this._deviceSelect.size = 5;
        this._deviceSelect.style.width = "200px";
        this._deviceSelect.style.display = "none";
        document.getElementById("app-content").appendChild(this._deviceSelect);
        let option = document.createElement("option");
        option.innerText = "";
        this._deviceSelect.appendChild(option);
        
        Object.keys(deviceBank.devices).forEach(deviceName => {
          let device = deviceBank.devices[deviceName];
          option = document.createElement("option");
          option.innerText = deviceName;
          this._deviceSelect.appendChild(option);
        });
        console.log(`Loaded devices to devices-data`, document.getElementById("devices-data"));
      })
      .catch(error => {
        console.error('Error loading devices.JSON:', error);
      });
  }

  show(targetElement, callback) {
    if (!this._deviceSelect) {
      return;
    }

    let boundingRect = targetElement.getBoundingClientRect();
    this._deviceSelect.style.position = "absolute";
    this._deviceSelect.style.left = `${boundingRect.right}px`;
    this._deviceSelect.style.top = `${boundingRect.top}px`;
    //this._deviceSelect.style.width = `${boundingRect.width}px`;
    this._deviceSelect.style.display = "inline-block";
    this._deviceSelect.addEventListener("change", () => this.deviceSelected(callback));
  }

  deviceSelected(callback) {
    
    let deviceName = this._deviceSelect.value;
    if (deviceName) {
      console.log(`${deviceName} selected`);
    
      let deviceDefinition = this.getDeviceDefinition(deviceName);
      callback(deviceDefinition);
      
      console.log(`${deviceName} loaded`);
    }
    this._deviceSelect.removeEventListener("change", () => this.deviceSelected(callback));
    this._deviceSelect.style.display = "none";
    
  }

  getDeviceDefinition(deviceName) {
    let deviceDefinition = {
      name: deviceName,
      parameterGroups: {}
    };
    let module = this._deviceBank.devices[deviceName];
    
    let moduleGroupName = "General";
    getModuleParameters(this._deviceBank, module, moduleGroupName);
    //console.log(deviceDefinition);
    return deviceDefinition;
    
    function getModuleParameters(deviceBank, module, moduleGroupName) {
      Object.keys(module.parameters).forEach(paramKey => {
        let paramNamespace = module.parameters[paramKey];
        let paramNamespaceParts = paramNamespace.split("/");
        let paramGroup = paramNamespaceParts[0];
        let paramName = paramNamespaceParts[1];
        
        let groupName = (paramGroup === "unitTypes" || paramGroup === "enumTypes") ? moduleGroupName : paramKey;
        
        if (!deviceDefinition.parameterGroups[groupName]) {
          deviceDefinition.parameterGroups[groupName] = {};
        }
        if (paramGroup === "unitTypes" || paramGroup === "enumTypes") {
          let paramDefinition = deviceBank[paramGroup][paramName];
          deviceDefinition.parameterGroups[groupName][paramKey] = paramDefinition;
        } 
        else if (paramGroup === "modules") {
          let subModule = deviceBank[paramGroup][paramName];
          getModuleParameters(deviceBank, subModule, paramKey);
        }
        else {
          throw "Not supported";
        }
      });
    }
  }
}
