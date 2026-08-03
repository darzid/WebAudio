export function initializeToggleButtons() {
  // let collapsedArrowSvg = `<svg class="arrow" name="collapsed" style="display:inline" fill="#ffffff">
  // <polygon points="0,0 450,225 0,450" style="fill:rgba(255,255,255,0.5);stroke:rgba(0,0,0,0.5);stroke-width:1" />
  // </svg>`
  // let expandedArrowSvg = `<svg class="arrow" name="expanded" style="display:none" fill="#ffffff">
  // <polygon points="0,1 5,9 9,1" style="fill:rgba(255,255,255,0.5);stroke:rgba(0,0,0,0.5);stroke-width:1" />
  // </svg>`

  let collapsedArrowHtml = "<img class='arrow' name='collapsed' style='display:inline' src='img/arrow-collapsed.png'>";
  let expandedArrowHtml = "<img class='arrow' name='expanded' style='display:none' src='img/arrow-expanded.png'>";

  const toggleBtns = document.querySelectorAll('.toggle-button');

  toggleBtns.forEach(button => {

    button.innerHTML = collapsedArrowHtml + expandedArrowHtml + button.innerHTML;
    let collapsedArrow = button.querySelector<HTMLElement>("[name='collapsed']")!;
    let expandedArrow = button.querySelector<HTMLElement>("[name='expanded']")!;
    let parentArticle = button.closest("article") as HTMLElement;

    button.addEventListener('click', () => {
      parentArticle.classList.toggle('expanded');

      if (parentArticle.classList.contains("expanded")) {
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
