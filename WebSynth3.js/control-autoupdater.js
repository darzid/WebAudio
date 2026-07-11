class ControlAutoUpdater {
    _deviceMeters = [];
    
    addAutoUpdateMeter(device, propertyName, meter) {
        //logger.logVerbose("Adding auto update meter", meter);
        this._deviceMeters.push(new DeviceMeter(device, propertyName, meter));
        vumeter(meter, {
          "boxCount": 15,
          "boxGapFraction": 0.25,
          "max": 100,
        });
        if (this._deviceMeters.length == 1) {
            window.requestAnimationFrame(ControlAutoUpdater.executeAutoUpdateControls);
        }
    }

    autoUpdateMeter(meter) {
        let deviceMeter = this._deviceMeters.find(dm => dm.meter == meter);

        let meterValue = deviceMeter.device[deviceMeter.propertyName];
        let value = Math.abs(Math.round(meterValue * 1000) / 1000);
        if (parseFloat(meter.getAttribute("data-val")) != value) { 
            meter.setAttribute("data-val", value);
            meter.title = value;
        }
    }

    autoUpdateControls() {
        this._deviceMeters.forEach((dm) => this.autoUpdateMeter(dm.meter));
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
    while (!parentElement.classList.contains(className)) {
        parentElement = parentElement.parentElement;
    }
    return parentElement;
}

class DeviceMeter {
        constructor(device, propertyName, meter) {
            this.device = device;
            this.propertyName = propertyName;
            this.meter = meter;
        }
    }