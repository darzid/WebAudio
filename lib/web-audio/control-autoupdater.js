class ControlAutoUpdater {
    _deviceMeters = [];
    
    addAutoUpdateMeter(device, propertyName, meterCanvasElement) {
        let vuMeter = new VuMeter(meterCanvasElement, {
          "boxCount": 15,
          "boxGapFraction": 0.25,
          "max": 100,
        });
        //logger.logVerbose("Adding auto update meter", meterCanvasElement);
        this._deviceMeters.push(new DeviceMeter(device, propertyName, meterCanvasElement, vuMeter));
        
        
        if (this._deviceMeters.length == 1) {
            window.requestAnimationFrame(ControlAutoUpdater.executeAutoUpdateControls);
        }
    }

    autoUpdateMeter(deviceMeter) {
        let meterValue = deviceMeter.device[deviceMeter.propertyName];
        let value = Math.abs(Math.round(meterValue * 1000) / 1000);
        if (parseFloat(deviceMeter.meterCanvasElement.getAttribute("data-val")) != value) { 
            deviceMeter.meterCanvasElement.setAttribute("data-val", value);
            deviceMeter.meterCanvasElement.title = value;
            deviceMeter.vuMeter.draw();
        }
    }

    autoUpdateControls() {
        this._deviceMeters.forEach((dm) => this.autoUpdateMeter(dm));
    }

    static executeAutoUpdateControls() {
        controlAutoUpdater.autoUpdateControls();
        window.requestAnimationFrame(ControlAutoUpdater.executeAutoUpdateControls);
    }
}

let controlAutoUpdater = new ControlAutoUpdater();

function getParentElementWithClassName(element, className) {
    // if (hasClassName(element, className)){
    //     return element;
    // }
    let parentElement = element.parentElement;
    while (parentElement && !parentElement.classList.contains(className)) {
        parentElement = parentElement.parentElement;
    }
    return parentElement;
}

class DeviceMeter {
    constructor(device, propertyName, meterCanvasElement, vuMeter) {
        this.device = device;
        this.propertyName = propertyName;
        this.meterCanvasElement = meterCanvasElement;
        this.vuMeter = vuMeter;
    }
}