function bind(element, object) {
//  console.log(`Bind ${element.getAttribute("name")} to object ${object.name}`, element, object);
  let addEventHandler = true;

  let numberParameters = element.querySelectorAll(`:scope > .ModuleParameters > article.Parameter input`);
  numberParameters.forEach(element => {
    bindNumberInputElement(element, object, addEventHandler);
  });

  let optionParameters = element.querySelectorAll(`:scope > .ModuleParameters > article.Parameter select`);
  optionParameters.forEach(element => {
    bindOptionSelectElement(element, object, addEventHandler);
  });

  let partialCountParameters = element.querySelectorAll(":scope > .ModuleParameters > article.Parameter input[name='partialCount']");
  partialCountParameters.forEach(element => {
    let oscillatorTypeParameterSelectElement = element.parentElement.parentElement.querySelector(".Parameter select[name='type']");
    let oscillatorTypeOptionElements = oscillatorTypeParameterSelectElement.querySelectorAll("option");
    let currentPartialCountSuffix = element.value > 0 ? `${element.value}` : "";
    element.addEventListener("change", () => {
      let newPartialCountSuffix = element.value > 0 ? `${element.value}` : "";
      oscillatorTypeOptionElements.forEach(option => option.innerText = option.innerText.replace(currentPartialCountSuffix, "") + newPartialCountSuffix);
      currentPartialCountSuffix = newPartialCountSuffix;
    })
  });

  let childModules = element.querySelectorAll(`:scope > .ModuleParameters > article.Module`);
  childModules.forEach(childModuleElement => {
    bind(childModuleElement, object[childModuleElement.getAttribute("name")]);
  });

//  console.log(`Bind finished ${element.getAttribute("name")} to object ${object.name}`, element, object);
}

function bindNumberInputElement(element, object, addEventHandler) {
  let namespace = getParameterNamespace(element);
  let parameterOwner = getParameterOwner(object, namespace);
  let parameterName = element.name;
  let isNumberProperty = (typeof parameterOwner[parameterName] === "number");
  let valueElement = element.parentElement.querySelector(`value[for="${element.name}"]`);

  //console.log(`Connecting input event for parameter "${namespace}"`, parameterOwner, parameterOwner[parameterName]);

  element.value = isNumberProperty ? parameterOwner[parameterName] : parameterOwner[parameterName].value;
  if (valueElement)
    valueElement.innerHTML = element.value;

  if (addEventHandler) {
    element.addEventListener("input", () => {
      let oldValue = isNumberProperty ? parameterOwner[parameterName] : parameterOwner[parameterName].value;
      if (isNumberProperty)
        parameterOwner[parameterName] = element.value;
      else
        parameterOwner[parameterName].value = element.value;
      if (valueElement)
        valueElement.innerHTML = element.value;
      //console.log(`Updated "${namespace}" from ${oldValue} to ${element.value}`);
    })
  }
}

function bindOptionSelectElement(element, object, addEventHandler) {
  let namespace = getParameterNamespace(element);
  let parameterOwner = getParameterOwner(object, namespace);
  let parameterName = element.name;

  //console.log(`Connecting select event for parameter "${namespace}"`, parameterOwner, parameterOwner[parameterName]);

  element.value = parameterOwner[parameterName];

  if (addEventHandler) {
    element.addEventListener("input", () => {
      let oldValue = parameterOwner[parameterName];
      parameterOwner[parameterName] = element.value;
      //console.log(`Updated "${namespace}" from ${oldValue} to ${element.value}`);
    });
  }
}

function getParameterNamespace(element) {
  let parentName = "";
  let parentElement = element.parentElement;
  while (parentElement && !parentName) {
    if (parentElement.classList.contains("Component") || parentElement.classList.contains("Source")) {
      parentName = parentElement.getAttribute("name");
    }
    else {
      parentElement = parentElement.parentElement;
    }
  }

  let namespace = parentName ? `${parentName}.${element.name}` : element.name;

  return namespace;
}

function getParameterOwner(object, namespace) {
  let namespaceParts = namespace.split(".");
  let parameterOwner = object;
  for (let namespacePartIndex = 0; namespacePartIndex < namespaceParts.length - 1; namespacePartIndex++) {
    parameterOwner = parameterOwner[namespaceParts[namespacePartIndex]];
  }

  if (!parameterOwner) {
    if (namespaceParts.length == 2) {
      return object;
    }
    else
      throw "Parameter owner object not found for parameter " + namespaceParts[namespaceParts.length - 1];
  }

  return parameterOwner;
}