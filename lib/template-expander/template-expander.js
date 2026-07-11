function applyDefaultTemplate(element, itemTemplate, templateContainer) {
  let trimmedHtml = itemTemplate.innerHTML.trim();
  templateContainer.innerHTML = trimmedHtml;
  if (!templateContainer.firstChild) {
    consoleError("Template " + element.dataset.template + " is empty", itemTemplate);
    return;
  }
  element.appendChild(templateContainer.firstChild);
  
  return element;
}

function applyControlTemplate(element, itemTemplate, templateContainer) {
  let trimmedHtml = itemTemplate.innerHTML.trim();
  templateContainer.innerHTML = trimmedHtml;
  if (!templateContainer.firstChild) {
    consoleError("Template " + element.dataset.template + " is empty", itemTemplate);
    return;
  }
  
  let templatedElement = templateContainer.firstChild;
//  consoleLog(element.outerHTML)
  let contentElement = templatedElement.querySelector("#Content");
  if (contentElement) {
    contentElement.outerHTML = element.outerHTML.trim();
    element.classList.forEach(className => contentElement.classList.add(className));
    element.classList.forEach(className => templatedElement.classList.add(className));
  }
  else {
    for (var i = 0; i < element.attributes.length; i++){ 
    let name = element.attributes[i].name;
    let value = element.attributes[i].value;
    
    if (!templatedElement.getAttribute(name)) {
      consoleLog("copying att " + name, value);
      templatedElement.setAttribute(name, value);
    }
    else {
      consoleLog("skipping att " + name, value);
    }
   // arr.push(atts[i].nodeName);
  }
  }
  
  element.replaceWith(templatedElement);
  
  return templatedElement;
}
/*
function applyDecoratorTemplate(element, itemTemplate, templateContainer) {
  let trimmedHtml = itemTemplate.innerHTML.trim();
  templateContainer.innerHTML = trimmedHtml;
  if (!templateContainer.firstChild) {
    consoleError("Template " + element.dataset.template + " is empty", itemTemplate);
    return;
  }
  element.replaceWith(templateContainer);
  
  return templateContainer;
}*/


function applyTemplate(element) {
 // let elementAttributes = element.attributes.map(att => att.name, att => att.value);
  //consoleLog("atts ", element.attributes);
    let itemTemplate = document.getElementById(element.dataset.template);
    if (!itemTemplate) {
      consoleError("Template " + element.dataset.template + " not found", element);
      return;
    }
    element.removeAttribute("data-template");
    
    let templatedElement = element;
    
    if (itemTemplate.innerHTML) {
      let templateContainer = document.createElement("div");
      templatedElement = applyControlTemplate(element, itemTemplate, templateContainer);
      
      let templateItems = templatedElement.querySelectorAll("[data-template]");
      //templateItems.forEach(itemElement => applyTemplate(itemElement));
    }
    
    let titleElement = templatedElement.querySelector(".title");
    if (titleElement) {
      let elementTitle = element.getAttribute("title");
      if (!elementTitle)
        elementTitle = element.getAttribute("name");
      if (elementTitle)
        titleElement.innerText = formatHumanText(elementTitle);
    }
  
    let datasetAttributes = Object.keys(itemTemplate.dataset);
    if (datasetAttributes) {
      datasetAttributes.forEach(key => templatedElement.setAttribute(key, itemTemplate.dataset[key]));
    }
    
    consoleLog("Applied template " + itemTemplate.id);//, element, templatedElement.outerHTML)
}

function applyTemplates() {
  let templateItems = document.querySelectorAll("[data-template]");
  while (templateItems.length > 0) {
    consoleLog("Applying template items " + templateItems.length);
    templateItems.forEach(itemElement => applyTemplate(itemElement));
    templateItems = document.querySelectorAll("[data-template]");
    if (templateItems.length > 0)
    {
      consoleLog("Remaining template items " + templateItems.length, templateItems);
    }
    //return;
  }
  
}

function formatHumanText(text) {
  let newText = text.replace(/([A-Z]|([0-9]+))/g, ' $1').trim();
  // if (text.indexOf("Step") > -1) {
  //   //consoleLog(`Old text=${text}, new=${newText}`);
  // }
  return newText;
}