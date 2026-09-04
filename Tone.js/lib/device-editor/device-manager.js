customElements.define("device-editor", class DeviceEditor extends HTMLElement {
   deviceParamsAdded = false;
    constructor(){
        super();
    }
    
    this.onMutation = this.onMutation.bind(this);
        this.deviceParamsAdded = false;
    }
    
    onMutation(mutations) {
        if (this.deviceParamsAdded) return;
        
        const newElements = [];
    
        // A `mutation` is passed for each new node
        for (const mutation of mutations) {
          // Could test for `mutation.type` here, but since we only have
          // set up one observer type it will always be `childList`
          newElements.push(...mutation.addedNodes);
        }
        this.tabPanels = newElements.filter(el => el.nodeType === Node.ELEMENT_NODE && el.className == "tab-panel");
        
        this.tabsAdded = true;
        
        let tabPanelContainer = document.createElement("div");
        tabPanelContainer.classList.add("tab-control");
        this.appendChild(tabPanelContainer);
        
        let tabstripElement = document.createElement("div");
        tabstripElement.className = "tab-strip";
        
        if (this.tabstripLocation == "top") 
            tabPanelContainer.appendChild(tabstripElement);
        
        let tabPanelsContainer = document.createElement("div");
        tabPanelsContainer.classList.add("tab-panels");
        tabPanelContainer.appendChild(tabPanelsContainer);
        
        this.tabPanels.forEach(tabPanel => {
            tabPanel.style.display = "none";
            tabPanel.classList.add("tab-panel");
            tabPanelsContainer.appendChild(tabPanel);
        });
        
        if (this.tabstripLocation == "bottom") 
            tabPanelContainer.appendChild(tabstripElement);
        
        this.tabPanels.forEach(tabPanel => {
            let tabButton = document.createElement("button");
            tabButton.className = "tab-button";
            tabButton.innerText = tabPanel.getAttribute("name");
            tabstripElement.appendChild(tabButton);
            this.tabButtons.push(tabButton);
            tabButton.onclick = () => this.clickTab(tabButton);
        });
        
        this.clickTab(this.tabButtons[0]);
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
</style>`;
        this.innerHTML = css;
        if (!deviceBrowser) {
            throw "DeviceBrowser null";
        }
        this.createDeviceEditor(deviceBrowser, this.deviceName, this.deviceParameters);
        
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
    
    createDeviceEditor(deviceBrowser, deviceName, deviceParameters) {
      let deviceEditorId = `device-editor-${this.parentElement.childNodes.length}`;
      let deviceEditorElement = document.createElement("div");
      deviceEditorElement.className = "device";
      deviceEditorElement.id = deviceEditorId;
      devicesPanelContent.appendChild(deviceEditorElement);
      
      let deviceHeaderElement = document.createElement("div");
      deviceHeaderElement.className = "panel-header";
      deviceHeaderElement.innerHTML = `<button class="control toggle-button enabled-button active"></button>${deviceName}`;
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
      
      let deviceDefinition = deviceBrowser.getDeviceDefinition(deviceName);
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
          tabButton.dataset.deviceId = deviceEditorId;
          tabstripElement.appendChild(tabButton);
        });
      }
      
      function createParameterGroupTabContent(deviceParameters, parameterGroup) {
        //console.log("createParameterGroupTabContent " + parameterGroupName, device, parameterGroup)
        let tabContent = document.createElement("div");
        tabContent.className = "tabcontent";
        tabContent.id = parameterGroup.name;
        deviceContentElement.appendChild(tabContent);
        
        Object.keys(parameterGroup.parameters).forEach(parameterName => {
          let parameterLabelElement = document.createElement("label");
          
          let parameter = parameterGroup.parameters[parameterName];
          if (!parameter.values) {
            let paramValue = deviceParameters[parameterName] ? deviceParameters[parameterName].name ? deviceParameters[parameterName].value : deviceParameters[parameterName] : "0";
            //console.log(`${device.name}.${parameterName} = `, paramValue)
            parameterLabelElement.className = "number-label";
            parameterLabelElement.innerHTML =
              `${parameterName}<number-input id="${parameterGroup.name}-${parameterName}" class="control-without-bg" fill="#00b7b7" background="white" step="${parameter.step}" min="${parameter.min}" max="${parameter.max}" value="${paramValue}">`;
          } else {
            let optionsHtml = "";
            parameter.values.forEach(value => optionsHtml += "<option>" + value + "</option>");
            parameterLabelElement.innerHTML =
              `${parameterName}<select value="${deviceParameters[parameterName]}">${optionsHtml}</select>`;
            parameterLabelElement.className = "select-label";
          }
          tabContent.appendChild(parameterLabelElement);
        });
      }
    }
});