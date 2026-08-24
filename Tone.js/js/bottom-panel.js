function clickTab(tabButton) {
  // Declare all variables
  var tabControl;
  tabControl = tabButton.closest(".tab-control");
  
  // Get all elements with class="tabcontent" and hide them
  tabControl.querySelectorAll(".tab-panel")
    .forEach(panel => panel.style.display = "none");
  
 // let openTab = !tabButton.classList.contains("active-tab");
  
  // Get all elements with class="tablinks" and remove the class "active"
  tabControl.querySelectorAll(`.tab-button`)
    .forEach(button => button.classList.remove("active-tab"));

  //if (openTab) {
    // Show the current tab, and add an "active" class to the button that opened the tab
    tabControl.querySelector(`.tab-panel[name="${tabButton.innerText}"]`).style.display = "flex";
    tabButton.classList.add("active-tab");
  //}
  
  sizeTracksTableContainer();
}

