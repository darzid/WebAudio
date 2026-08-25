customElements.define("number-input", class NumberInput extends HTMLElement {
    constructor(){
        super();
    }
    
    defineprop(computedStyle){
        console.log("defineprop()");
        
        const plist=this.module.properties;
        for(let k in plist){
            const v = plist[k];
            let value = v.value;
            if (!value) {
                console.log("computedStyle " + k, computedStyle[k])
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
            is:"number-input",
            properties:{
                fill:               {type:String, value:"", defaultValue:"#00b7b7"},
                min:                {type:Number, value:0},
                max:                {type:Number, value:100},
                step:               {type:Number, value:1},
                value:              {type:Number, value:0},
                'class':            {type:String, value:"number-input"}
            },
        };
        let computedStyle = window.getComputedStyle(this);
        this.defineprop(computedStyle);
        root.innerHTML =
`<style>
.number-input {
    color: ${computedStyle.color},
    backgroundColor: ${computedStyle.backgroundColor},
    text-align: center;
    width: 4em;
}
:host {
    user-select: none;
    padding:0;
    margin:0;
}
</style>
<input id="${this.id}" name="${this.name}" type="number" class="${this.class}" min="${this.min}" max="${this.max}" step="${this.step}" value="${this.value}">`;
        this.ready=function(){
            console.log("ready()");
            
            this.inputElement=root.children[1];
            this.inputElement.addEventListener("input", this.drawFill, false);
            this.inputElement.addEventListener("pointerdown", this.bindpointerdown.bind(this), false);
            //this.addEventListener('mousemove',this.mousemove.bind(this),false);
            //this.canvas.addEventListener('keydown',this.keydown.bind(this),false);
            this.initialized=1;
            this.drawFill();
        };
        this.bindpointerdown=function(ev) {
            this.inputElement.addEventListener("pointermove", this.bindpointermove.bind(this), false);
            this.inputElement.addEventListener("pointerup", this.bindpointerup.bind(this), false);
        };
        this.bindpointermove=function(ev){
            let range = parseFloat(this.max) - parseFloat(this.min);
            let movement = (Math.abs(ev.movementY) > Math.abs(ev.movementX)) ? -0.75 * ev.movementY : 1.5 * ev.movementX;
              
            let decimals = this.step ? parseFloat(this.step).countDecimals() : 0;
            let value = (parseFloat(this.inputElement.value) + ((movement / 100) * range));
            value = parseFloat(value.toFixed(decimals)).clamp(this.min, this.max);
            this.inputElement.value = value;
            var evnt = this.inputElement["oninput"];
            if (evnt)
                evnt.call(this.inputElement);
            this.drawFill();
        };
        this.bindpointerup=function(ev) {
            this.inputElement.removeEventListener("pointermove", this.bindpointermove, false);
            this.inputElement.removeEventListener("pointerup", this.bindpointerup, false);
        };
        this.drawFill=function() {
            let progress = 100 * ((this.inputElement.value - this.min) / (this.max - this.min));
            let backgroundColor = window.getComputedStyle(this.inputElement).backgroundColor;
            let backgroundImage = `linear-gradient(to right, ${this.fill} 0%, ${this.fill} ${progress}%, ${backgroundColor} ${progress}%, ${backgroundColor} 100%)`;
            this.inputElement.style.backgroundImage = backgroundImage;
            //console.log("drawFill()", this.inputElement, backgroundImage);
        }
        this.ready();
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

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};
Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}
