function applyTemplates() {
  let templateItems = document.querySelectorAll("[data-template]:not(template)");
  while (templateItems.length > 0) {
    //consoleLog(`Applying ${templateItems.length} template items`);
    templateItems.forEach(itemElement => applyTemplate(itemElement));
    templateItems = document.querySelectorAll("[data-template]:not(template)");
    // if (templateItems.length > 0) {
    //   consoleLog("Remaining template items " + templateItems.length, templateItems);
    // }
  }
}


function applyTemplate(element) {
  let itemTemplate = document.getElementById(element.dataset.template);
  if (!itemTemplate) {
    consoleError("Template " + element.dataset.template + " not found", element);
    element.removeAttribute("data-template");
    return;
  }
  //console.log(`Applying template ${element.dataset.template} on element`, element);
  element.removeAttribute("data-template");

  let templatedElement = element;

  if (itemTemplate.innerHTML) {
    let templateContainer = document.createElement("div");
    templatedElement = applyControlTemplate(element, itemTemplate, templateContainer);
  }

  let titleElement = templatedElement.querySelector(".title");
  if (titleElement) {
    let elementTitle = element.getAttribute("title");
    if (!elementTitle)
      elementTitle = element.getAttribute("name");
    if (elementTitle)
      titleElement.innerText = formatHumanText(elementTitle);
  }

  // for (let attributeIndex = 0; attributeIndex < element.attributes.length; attributeIndex++) {
  //   let attributeName = element.attributes[attributeIndex].name;
  //   templateDataItem[attributeName] = element.getAttribute(attributeName);
  // }

  let datasetAttributes = Object.keys(itemTemplate.dataset);
  if (datasetAttributes) {
    datasetAttributes.forEach(datasetAttributeName => {
      templatedElement.setAttribute(datasetAttributeName, itemTemplate.dataset[datasetAttributeName])
      // templateDataItem[datasetAttributeName] = itemTemplate.dataset[datasetAttributeName];
      //console.log("Copied data attribute " + datasetAttributeName)
    });
  }

  //consoleLog("Applied template " + itemTemplate.id);//, element, templatedElement.outerHTML)
}




function applyControlTemplate(element, itemTemplate, templateContainer) {
  let trimmedHtml = itemTemplate.innerHTML.trim();

  let templateDataItem = {};

  for (let attributeIndex = 0; attributeIndex < element.attributes.length; attributeIndex++) {
    let attributeName = element.attributes[attributeIndex].name;
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

    templatedElement.outerHTML = parseTokenizedTemplate(itemTemplate.innerHTML, templateDataItem);
    for (var i = 0; i < element.attributes.length; i++) {
      let name = element.attributes[i].name;
      let value = element.attributes[i].value;

      if (!templatedElement.getAttribute(name)) {
        //consoleLog("copying att " + name, value);
        templatedElement.setAttribute(name, value);
      }
      // else {
      //   consoleLog("skipping att " + name, value);
      // }
      // arr.push(atts[i].nodeName);
    }


  }

  element.replaceWith(templatedElement);

  return templatedElement;
}






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





function formatHumanText(text) {
  let newText = text.replace(/([A-Z]|([0-9]+))/g, ' $1').trim();
  // if (text.indexOf("Step") > -1) {
  //   //consoleLog(`Old text=${text}, new=${newText}`);
  // }
  return newText;
}







function parseTokenizedTemplate(templateHtml, item) {
  let valueTokens = getValueTokens(templateHtml);
  let valueTokenReplacements = {};
  valueTokens.forEach(tokenInfo => {
    if (!valueTokenReplacements[tokenInfo.tokenName]) {
      let tokenValue = eval(tokenInfo.tokenName);
      if (isNaN(tokenValue) && (tokenValue == null || tokenValue == undefined)) {
        //console.log(`No value found for token ${tokenInfo.token}`);
      }
      valueTokenReplacements[tokenInfo.tokenName] = tokenValue;
      templateHtml = templateHtml.replaceAll(tokenInfo.token, tokenValue);
    }
  });

  // let listTokens = getListTokens(templateHtml);
  // listTokens.forEach(tokenInfo => {
  //   let propertyName = tokenInfo.tokenName;
  //   let listItems = item[propertyName];
  //   if (listItems) {
  //     let listHtml = "";
  //     listItems.forEach(listItem => {
  //       if (typeof listItem === "object") {
  //         let listItemHtml = applyTemplate(listItem);
  //         if (listItemHtml) {
  //           listHtml += listItemHtml;
  //         }
  //       }
  //       else {
  //         console.warn(`Cannot apply template to property ${propertyName} item of type ${typeof listItem}`, listItem);
  //       }
  //     });

  //     templateHtml = templateHtml.replace(tokenInfo.token, listHtml);
  //   }
  //   else {
  //     console.warn(`No list items found for property ${item.name}.${propertyName}`, item);
  //   }
  //   // if (!listItems) {
  //   //   listItems = getObjectInfo(item).properties;
  //   // }
  // })
  return templateHtml;
}

function getValueTokens(templateHtml) {
  let matches = templateHtml.matchAll("[$]{(?<token>[a-zA-Z =\\>\\(\\)\\{\\}\\.]+[0-9]?)}");
  return getTokenInfos(matches);
}

function getListTokens(templateHtml) {
  let matches = templateHtml.matchAll("{{[$]?(?<token>[a-zA-Z =\\>\\(\\)\\{\\}\\.]+[0-9]?)}}");
  return getTokenInfos(matches);
}

function getTokenInfos(matches) {
  let tokenInfos = [];
  matches.forEach(match => {
    tokenInfos.push({
      tokenName: match.groups["token"],
      token: match[0]
    });
  });
  return tokenInfos;
}
