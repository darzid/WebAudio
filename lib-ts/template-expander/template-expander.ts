import { Logger } from "../../lib-ts/logger";

export function applyDefaultTemplate(element: HTMLElement, itemTemplate: HTMLTemplateElement, templateContainer: HTMLElement) {
  let trimmedHtml = itemTemplate.innerHTML.trim();
  templateContainer.innerHTML = trimmedHtml;
  if (!templateContainer.firstChild) {
    Logger.error("Template " + element.dataset.template + " is empty", itemTemplate);
    return;
  }
  element.appendChild(templateContainer.firstChild);
  
  return element;
}

export function applyControlTemplate(element: HTMLElement, itemTemplate: HTMLTemplateElement, templateContainer: HTMLElement) : HTMLElement {
  let trimmedHtml = itemTemplate.innerHTML.trim();
  templateContainer.innerHTML = trimmedHtml;
  if (!templateContainer.firstChild) {
    throw("Template " + element.dataset.template + " is empty", itemTemplate);
  }
  
  let templatedElement = templateContainer.firstChild as HTMLElement;
  let contentElement = templatedElement.querySelector("#Content");
  if (contentElement) {
    contentElement.outerHTML = element.outerHTML.trim();
    element.classList.forEach(className => contentElement.classList.add(className));
    element.classList.forEach(className => templatedElement.classList.add(className));
  }
  else {
    for (var i = 0; i < element.attributes.length; i++){ 
    let name = element.attributes[i]!.name;
    let value = element.attributes[i]!.value;
    
    if (!templatedElement.getAttribute(name)) {
      Logger.log("copying att " + name, value);
      templatedElement.setAttribute(name, value);
    }
    else {
      Logger.log("skipping att " + name, value);
    }
   // arr.push(atts[i].nodeName);
  }
  }
  
  element.replaceWith(templatedElement);
  
  return templatedElement;
}

export function applyTemplates() {
  let templateItems: NodeListOf<HTMLElement> = document.querySelectorAll("[data-template]");
  while (templateItems.length > 0) {
    Logger.log("Applying template items " + templateItems.length);
    templateItems.forEach(itemElement => applyTemplate(itemElement));
    templateItems = document.querySelectorAll("[data-template]");
    if (templateItems.length > 0)
    {
      Logger.log("Remaining template items " + templateItems.length, templateItems);
    }
    //return;
  }
}

function applyTemplate(element: HTMLElement) {
    let itemTemplate: HTMLTemplateElement= document.getElementById(element.dataset.template!) as HTMLTemplateElement;
    if (!itemTemplate) {
      Logger.error("Template " + element.dataset.template + " not found", element);
      element.removeAttribute("data-template");
      return;
    }
    element.removeAttribute("data-template");
    
    let templatedElement: HTMLElement = element;
    
    if (itemTemplate.innerHTML) {
      let templateContainer = document.createElement("div");
      templatedElement = applyControlTemplate(element, itemTemplate, templateContainer);
      
      let templateItems = templatedElement.querySelectorAll("[data-template]");
      //templateItems.forEach(itemElement => applyTemplate(itemElement));
    }
    
    let titleElement: HTMLElement = templatedElement.querySelector(".title")!;
    if (titleElement) {
      let elementTitle = element.getAttribute("title");
      if (!elementTitle)
        elementTitle = element.getAttribute("name");
      if (elementTitle)
        titleElement.innerText = formatHumanText(elementTitle);
    }
  
    let datasetAttributes = Object.keys(itemTemplate.dataset);
    if (datasetAttributes) {
      datasetAttributes.forEach(key => templatedElement.setAttribute(key, itemTemplate.dataset[key]!));
    }
    
    Logger.log("Applied template " + itemTemplate.id);//, element, templatedElement.outerHTML)
}


function formatHumanText(text: string) {
  let newText = text.replace(/([A-Z]|([0-9]+))/g, ' $1').trim();
  return newText;
}