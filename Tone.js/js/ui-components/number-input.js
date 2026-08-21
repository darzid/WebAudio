function initializeNumberInputs() {
  let numberInputs = document.querySelectorAll("input[type=number]");
  numberInputs.forEach((input) => {
    updateNumberBackground(input);
    
    let pointerDown = false;
    input.addEventListener("pointerdown", (e) => pointerDown = true);
    input.addEventListener("pointerup", (e) => pointerDown = false);
    input.addEventListener("pointermove", (e) => {
      if (!pointerDown) return;
      
      let range = parseFloat(input.max) - parseFloat(input.min);
      let movement = (Math.abs(e.movementY) > Math.abs(e.movementX)) ? -0.75 * e.movementY : 1.5 * e.movementX;
      
      let decimals = input.step ? parseFloat(input.step).countDecimals() : 0;
      let value = (parseFloat(input.value) + ((movement / 100) * range));
      value = parseFloat(value.toFixed(decimals))
        .clamp(input.min, input.max);
      
      input.value = value;
      var evnt = input["oninput"];
      if (evnt)
        evnt.call(input);
      updateNumberBackground(input);
    });
    
    input.addEventListener("change", () => updateNumberBackground(input));
    //, { capture: false, passive: false });
  });
  
  function updateNumberBackground(input) {
    let progress = 100 * ((input.value - input.min) / (input.max - input.min));
    input.style.backgroundImage = `linear-gradient(to right, #00b7b7 0%, #00b7b7 ${progress}%, white ${progress}%, white 100%)`;
  }
}