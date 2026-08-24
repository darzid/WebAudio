function openTab(tabButton, parentElement) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = parentElement.querySelectorAll(`.tabcontent`);
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = parentElement.querySelectorAll(`.tablinks`);
 // console.log("tabLinks", tablinks)
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active-tab", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  parentElement.querySelector(`div.tabcontent[id="${tabButton.innerText}"]`).style.display = "flex";
  tabButton.className += " active-tab";
}