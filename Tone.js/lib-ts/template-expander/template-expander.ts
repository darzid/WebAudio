import { Logger } from "../../lib-ts/logger";

export function applyTemplates() {
  let templateItems: NodeListOf<HTMLElement> = document.querySelectorAll("[data-template]:not(template)");
  while (templateItems.length > 0) {
    Logger.log("Applying template items " + templateItems.length);
    templateItems.forEach(itemElement => applyTemplate(itemElement));
    templateItems = document.querySelectorAll("[data-template]:not(template)");
  }
}

export function applyTemplate(element: HTMLElement) {
  let itemTemplate: HTMLTemplateElement = document.getElementById(element.dataset.template!) as HTMLTemplateElement;
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
    datasetAttributes.forEach(key =>
      templatedElement.setAttribute(key, itemTemplate.dataset[key]!));
  }
}

export function applyControlTemplate(element: HTMLElement, itemTemplate: HTMLTemplateElement, templateContainer: HTMLElement): HTMLElement {
  let trimmedHtml = itemTemplate.innerHTML.trim();

  let templateDataItem: {[key: string]: any} = {};

  for (let attributeIndex = 0; attributeIndex < element.attributes.length; attributeIndex++) {
    let attributeName = element.attributes[attributeIndex]!.name;
    templateDataItem[attributeName] = element.getAttribute(attributeName);
  }

  let datasetAttributes = Object.keys(itemTemplate.dataset);
  if (datasetAttributes) {
    datasetAttributes.forEach(datasetAttributeName => {
      templateDataItem[datasetAttributeName.replace("data-", "")] = itemTemplate.dataset[datasetAttributeName];
    });
  }

  trimmedHtml = parseTokenizedTemplate(trimmedHtml, templateDataItem);

  templateContainer.innerHTML = trimmedHtml;
  if (!templateContainer.firstChild) {
    throw ("Template " + element.dataset.template + " is empty", itemTemplate);
  }

  let templatedElement = templateContainer.firstChild as HTMLElement;
  let contentElement = templatedElement.querySelector("#Content");
  if (contentElement) {
    contentElement.outerHTML = element.outerHTML.trim();
    element.classList.forEach(className => contentElement.classList.add(className));
    element.classList.forEach(className => templatedElement.classList.add(className));
  }
  else {
    for (var i = 0; i < element.attributes.length; i++) {
      let name = element.attributes[i]!.name;
      let value = element.attributes[i]!.value;

      if (!templatedElement.getAttribute(name)) {
        templatedElement.setAttribute(name, value);
      }
    }
  }

  element.replaceWith(templatedElement);

  return templatedElement;
}

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



function formatHumanText(text: string) {
  let newText = text.replace(/([A-Z]|([0-9]+))/g, ' $1').trim();
  return newText;
}


function parseTokenizedTemplate(templateHtml: string, item: {[key: string]: any}) {
  let valueTokens = getValueTokens(templateHtml);
  let valueTokenReplacements: {[key: string]: any} = {};
  valueTokens.forEach(tokenInfo => {
    if (!valueTokenReplacements[tokenInfo.tokenName]) {
      let tokenValue = eval(tokenInfo.tokenName);
      if (isNaN(tokenValue) && (tokenValue == null || tokenValue == undefined)) {
        console.log(`No value found for token ${tokenInfo.token}`);
      }
      valueTokenReplacements[tokenInfo.tokenName] = tokenValue;
      templateHtml = templateHtml.replaceAll(tokenInfo.token, tokenValue);
    }
  });

  return templateHtml;
}

function getValueTokens(templateHtml: string) {
  let regEx = new RegExp(/[$]{(?<token>[a-zA-Z =\\>\\(\\)\\{\\}\\.]+[0-9]?)}/g);
  let matches: any = templateHtml.matchAll(regEx);
  return getTokenInfos(matches);
}

function getListTokens(templateHtml: string) {
  let regEx = new RegExp(/{{[$]?(?<token>[a-zA-Z =\\>\\(\\)\\{\\}\\.]+[0-9]?)}}/g);
  let matches: any = templateHtml.matchAll(regEx);
  return getTokenInfos(matches);
}

function getTokenInfos(matches: any[]) {
  let tokenInfos: { tokenName: string, token: any }[] = [];
  matches.forEach(match => {
    tokenInfos.push({
      tokenName: match.groups["token"],
      token: match[0]
    });
  });
  return tokenInfos;
}
