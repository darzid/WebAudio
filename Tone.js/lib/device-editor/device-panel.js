customElements.define("device-panel", class DevicePanel extends HTMLElement {
    constructor(){
        super();
    }
    
    defineprop(computedStyle){
        const plist=this.module.properties;
        for(let k in plist){
            const v = plist[k];
            let value = v.value;
            if (!value) {
                if (computedStyle[k]) {
                    value = computedStyle[k];
                } else if (v.defaultValue) {
                    value = v.defaultValue;
                }
            }
            this["_"+k] = this.getAttr(k,value);
            
            Object.defineProperty(this, k, {
                get:()=>{return this["_"+k]},
                set:(val)=>{
                    this["_"+k] = val;
                    if(typeof(this[v.observer])=="function")
                        this[v.observer]();
                }
            });
        }        
    }
    
    connectedCallback(){
        let root;
        root=this;
        
        this.module = {
            is:"device-editor",
            properties:{
                deviceName:                 {type:String, value:""},
                'class':                    {type:String, value:"device-editor"}
            },
        };
        let computedStyle = window.getComputedStyle(this);
        this.defineprop(computedStyle);
        
        let css = `<style>

    .devices {
      overflow - x: auto;
    }
  .add-device {
    margin: 2px;
    border-radius: 20px;
  }
  
  .device {
    display: flex;
    flex-direction: column;
    margin: 3px;
    width: max-content;
      
    border-radius: 4px 4px 0px 0px;
    border: 1px solid var(--panel-border-color-dark);
      
    box-shadow: 1px 1px 2px var(--shadow-color);
    background: var(--device-bg);
    
    .panel-header {
      width: stretch;
      font-size: x-small;
      padding-top: 2px;
      border-bottom: 0px solid var(--panel-border-color-dark);
      background: rgb(160,170,170);
      border-bottom: 1px solid var(--panel-header-border-color);
      border-radius: 4px 4px 0px 0px;
      
      .add-device {
        
        margin: 0px;
        margin-right: 2px;
        float: right;
        background: transparent;
        border: 1px solid black;
        border-radius: 0px;
        font-size: xx-small;
        img {
          width: 10px;
          height: 10px;
        }
      }

      .enabled-button {
        width: 12px;
        height: 12px;
        margin: 3px;
        margin-top: 0px;
      }
    }
      
    .panel-content {
      display: flex;
      flex-flow: column nowrap;
      height: 74%;
      width: max-content;
        
      overflow: auto;
      
      .tablinks {
        display: flex;
        flex-flow: row nowrap;
        width: max-content;
      }

      .tab {
        overflow: hidden;
        border-bottom: 1px solid #ccc;
        background-color: #909090;
        margin-left: -4px;
      }
      
      .tab button {
        background-color: rgba(255,255,255,0.2);
        float: left;
        border: 1px solid rgb(80,80,80);
        border-radius: 2px 2px 0px 0px;
        border-bottom: 0px;
        outline: none;
        cursor: pointer;
        padding: 0px 6px;
        transition: 0.3s;
        font-size: x-small;
        margin-right: 1px;
      }
      
      .tab button:hover {
        background-color: #ddd;
      }
      
      .tab button.active-tab {
        background-color: #a0c0c0;
      }
      
      .tabcontent {
        display: none;
        flex-direction: row;
        padding: 0px 0px;
        border: 1px solid #808080;
        border-top: none;
        overflow-x: auto;
      }

    }
  
}
:host {
    user-select: none;
    padding:0;
    margin:0;
}
</style><div class="panel-content devices"></div>`;
        this.innerHTML = css;
        if (!deviceBrowser) {
            throw "DeviceBrowser null";
        }
        this.devicesPanelContent = this.childNodes[1];
        document.addEventListener("ShowTrackDevices", (e) => this.show(e.detail.track));
      
        this.createDeviceEditor=function(device, deviceIndex) {
          console.log("device", device);
          //let deviceDefinition = deviceBrowser.getDeviceDefinition(device.name);
          let deviceId = `Device${deviceIndex}`;
          
          let deviceEditorElement = document.createElement("div");
          deviceEditorElement.className = "device";
          deviceEditorElement.id = deviceId;
          this.devicesPanelContent.appendChild(deviceEditorElement);
          
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
          console.log("device ded", deviceDefinition)
          createParameterGroupTabButtons(deviceDefinition.parameterGroups);
          deviceDefinition.parameterGroups.forEach(parameterGroup => {
            //console.log("device tab " + paramgroupName, deviceDefinition.parameterGroups);
            createParameterGroupTabContent(deviceContentElement, device, parameterGroup);
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
              
              console.log(`tab ${parameterGroup.name}, path ${parameterGroup.path}`)
            });
          }
          
          function createParameterGroupTabContent(deviceContentElement, device, parameterGroup) {
            //console.log("createParameterGroupTabContent " + parameterGroupName, device, parameterGroup)
            let tabContent = document.createElement("div");
            tabContent.className = "tabcontent";
            tabContent.id = parameterGroup.name;
            deviceContentElement.appendChild(tabContent);
            
            if (parameterGroup.name === "filter") {
              console.log("creating filter tab", parameterGroup.parameters);
            }
            Object.keys(parameterGroup.parameters).forEach(parameterName => {
              if (parameterGroup.name === "filter") {
                console.log("creating filter param", parameterName);
              }
              
              let parameterLabelElement = document.createElement("label");
              tabContent.appendChild(parameterLabelElement);
              
              let parameter = parameterGroup.parameters[parameterName];
              if (parameterName === "attack") {
                console.log("Attack param", parameter, parameterGroup)
              }
              let param = parameterGroup.name == "general" ? device[parameterName] : device[parameterGroup.name][parameterName];
              let paramValue = param ? param.name ? param.value : param : "0";
              if (!parameter.values) {
                console.log(`Creating input for ${device.name}.${parameterName} = `, paramValue, device)
                parameterLabelElement.className = "number-label";
                parameterLabelElement.innerHTML = parameterName;
                
                let numberInput = document.createElement("number-input");
                numberInput.id = parameterGroup.name + "-" + parameterName;
                numberInput.className="param";
               // numberInput.fill="orange";
                
                parameterLabelElement.appendChild(numberInput);
                numberInput.step=parameter.step;
                numberInput.min=parameter.min;
                numberInput.max=parameter.max;
                numberInput.value=param.name ? param.value : param;
                
                  //`${parameterName}<number-input id="${parameterGroup.name}-${parameterName}" class="control-without-bg" fill="#f2b544" step="${parameter.step}" min="${parameter.min}" max="${parameter.max}" value="${paramValue}">`;
                //let numberInput = parameterLabelElement.cbildren[parameterLabelElement.children.length];
                numberInput.oninput = ()  => {
                  let oldValue = "";
                  if (param.name) {
                    oldValue = param.value;
                    param.value = numberInput.value;
                  } else {
                    oldValue = param;
                    param = numberInput.value;
                  }
                  console.log(`${parameterName} changed from ${oldValue} to ${numberInput.value}`, device)
                 };
              } else {
                let optionsHtml = "";
                parameter.values.forEach(value => {
                  let selected = value === paramValue ? " selected='true'" : "";
                  optionsHtml += `<option${selected}>` + value + "</option>"
                });
                parameterLabelElement.innerHTML =
                  `${parameterName}<select>${optionsHtml}</select>`;
                parameterLabelElement.className = "select-label";
                console.log("select", parameterLabelElement.innerHTML, paramValue);
              }
              
              
            });
            if (parameterGroup.name.startsWith("filter")) {
              console.log(parameterGroup.name + " tab", tabContent);
            }
          }
          
        }
        this.show=function(track){
          
          this.devicesPanelContent.style.display = selectedTrackId ? "flex" : "none";
          this.devicesPanelContent.innerHTML = "";
          
          if (track && track.devices && track.devices.length > 0) {
            
            let deviceIndex = 1;
            //console.log("Track", track.projectFileTrack);
            track.devices.forEach(device => {
              this.createDeviceEditor(device, deviceIndex);
              deviceIndex++;
            });
            
          }
          else {
            
            let addDeviceButton = document.createElement("button");
            addDeviceButton.className = "add-device image-button control";
            addDeviceButton.innerHTML = '<img src="img/plus-black.png">';
            this.devicesPanelContent.appendChild(addDeviceButton);
            addDeviceButton.onclick = () => deviceBrowser.show(addDeviceButton, addDeviceCallback);
          }
          
          sizeTracksTableContainer();
        }
        //this.createDeviceEditor(device, deviceIndex);
        
        this.ready=function(){
            
        };
        
        this.ready();
    }
    
    disconnectedCallback() {
        // remove observer if element is no longer connected to DOM
        this.observer.disconnect();
    }
    
    getAttr(n, def) {
        let v = this.getAttribute(n);
        if (v == "" || v == null) return def;
        switch (typeof(def)) {
            case "number":
                if (v == "true") return 1;
                v = +v;
                if (isNaN(v)) return 0;
                return v;
        }
        return v;
    }
    
    
});