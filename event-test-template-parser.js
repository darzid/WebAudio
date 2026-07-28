var missingTemplates = [];

function applyTemplate(item) {
  let objectName = item.descriptor ? item.value.name : item.name;

  let query = `template[data-object-names*="${objectName}"]`;
  let template = document.querySelector(query);

  if (template) {
    return parseTokenizedTemplate(template.innerHTML, item);
  }

  if (item.value && item.value.name) {
    query = `template[data-object-names*="${item.value.name}"]`;
    template = document.querySelector(query);
    if (template) {
      return parseTokenizedTemplate(template.innerHTML, item);
    }
  }

  if (item.type) {
    query = `template[data-property-types*="${item.type}"][data-property-names*="${item.name}"]`;
    template = document.querySelector(query);
    if (template) {
      return parseTokenizedTemplate(template.innerHTML, item);
    } else {
      query = `template[data-property-types*="${item.type}"]`;
      template = document.querySelector(query);
      if (template) {
        return parseTokenizedTemplate(template.innerHTML, item);
      } else {
        if (item.name) {
          query = `template[data-property-names*="${item.name}"]`;
          template = document.querySelector(query);
          if (template) {
            return parseTokenizedTemplate(template.innerHTML, item);
          }
        }

        if (!missingTemplates.includes(item.type)) {
          console.warn(`No property template found for ${item.type}`, item);
          missingTemplates.push(item.type);
        }
      }
    }
  }

  if (!missingTemplates.includes(item.name)) {
    console.warn(`No object template found for ${item.name}`, item);
    missingTemplates.push(item.name);
  }
}

function parseTokenizedTemplate(templateHtml, item) {
  let valueTokens = getValueTokens(templateHtml);
  let valueTokenReplacements = {};
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

  let listTokens = getListTokens(templateHtml);
  listTokens.forEach(tokenInfo => {
    let propertyName = tokenInfo.tokenName.replace("item.", "");
    let listItems = item[propertyName];
    if (listItems) {
      let listHtml = "";
      listItems.forEach(listItem => {
        if (typeof listItem === "object") {
          let listItemHtml = applyTemplate(listItem);
          if (listItemHtml) {
            listHtml += listItemHtml;
          }
        }
        else {
          console.warn(`Cannot apply template to property ${propertyName} item of type ${typeof listItem}`, listItem);
        }
      });

      templateHtml = templateHtml.replace(tokenInfo.token, listHtml);
    }
    else {
      console.warn(`No list items found for property ${item.name}.${propertyName}`, item);
    }
    // if (!listItems) {
    //   listItems = getObjectInfo(item).properties;
    // }
  })
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

// function htmlDecode(html) {
//   var el = document.createElement('DIV');
//   el.innerHTML = html;
//   return el.innerHTML;
// }

// function htmlEncode(html) {
//   var el = document.createElement('DIV');
//   el.textContent = html;
//   return el.innerHTML;
// }

const objectInfosCache = {};

function getObjectInfo(object) {
  if (object.name && objectInfosCache[object.name]) {
    return objectInfosCache[object.name];
  }

  let objectInfo = {
    name: object.name ? object.name : "object",
    properties: []
  }

  getPropertiesFromObjectPrototype(object, objectInfo);

  let objectPrototype = Object.getPrototypeOf(object);
  while (objectPrototype) {
    getPropertiesFromObjectPrototype(objectPrototype, objectInfo);
    objectPrototype = Object.getPrototypeOf(objectPrototype);
  }

  if (object.name) {
    objectInfosCache[object.name] = objectInfo;
  }
  return objectInfo;
}

function getObjectPropertyNames(object) {
  return getObjectInfo(object).properties.map(propertyInfo => propertyInfo.name);
}

function getPropertiesFromObjectPrototype(object, objectInfo) {
  let objectPrototype = Object.getPrototypeOf(object);
  while (objectPrototype) {
    getPropertiesFromObjectPrototype(objectPrototype, objectInfo);
    objectPrototype = Object.getPrototypeOf(objectPrototype);
  }
  return objectInfo;
}

function getPropertiesFromObjectPrototype(objectPrototype, objectInfo) {
  var getPropertyValue = (propertyName) => objectPrototype[propertyName];

  Object.getOwnPropertyNames(objectPrototype)
    .filter(name => !name.startsWith("_"))
    .filter(name => isValidPropertyType(objectPrototype, name))
    .forEach(propertyName => {
      objectInfo.properties.push({
        name: propertyName,
        type: typeof objectPrototype[propertyName],
        descriptor: Object.getOwnPropertyDescriptor(objectPrototype, propertyName),
        value: getPropertyValue(propertyName)
      })
    });
}

function isValidPropertyType(objectPrototype, propertyName) {
  try {
    let propertyType = typeof objectPrototype[propertyName];
    let isValid = propertyType != "constructor" && propertyType != "function" && propertyType != "undefined";
    return isValid;
  }
  catch (error) {
    return false;
  }
}
