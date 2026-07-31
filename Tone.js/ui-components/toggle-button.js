function initializeToggleButtons() {
  let collapsedArrowSvg = `<svg class="arrow" name="collapsed" width="10" height="10" style="display:inline" fill="#ffffff">
  <polygon points="0,0 10,5 0,10" style="fill:rgba(255,255,255,0.5);stroke:rgba(0,0,0,0.5);stroke-width:1" />
  </svg>`
  let expandedArrowSvg = `<svg class="arrow" name="expanded" width="10" height="10" style="display:none" fill="#ffffff">
  <polygon points="0,1 5,9 9,1" style="fill:rgba(255,255,255,0.5);stroke:rgba(0,0,0,0.5);stroke-width:1" />
  </svg>`

  const toggleBtns = document.querySelectorAll('.toggle-button');

    toggleBtns.forEach(button => {

    button.innerHTML = collapsedArrowSvg + expandedArrowSvg + button.innerHTML;
    let collapsedArrow = button.querySelector("[name='collapsed']");
    let expandedArrow = button.querySelector("[name='expanded']");
    let content = null;
    let parentElement = button.parentElement;
    while (! content && parentElement) {
      content = parentElement.querySelector(".expander-content");
      if (! content) {
        parentElement = parentElement.parentElement;
      }
    }
    if (! content) {
      throw "Could not find expander content element";
    } 
//    let content = button.parentElement.parentElement.querySelector(".expander-content");

    button.addEventListener('click', () => {
      content.classList.toggle('expanded');
      if (content.classList.contains("expanded")) {
        collapsedArrow.style.display = "none";
        expandedArrow.style.display = "inline";
      }
      else {
        collapsedArrow.style.display = "inline";
        expandedArrow.style.display = "none ";
      }
    });
  });
}
