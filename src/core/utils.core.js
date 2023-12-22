export function create_state(value = null) {
  var notification_list = new Set();

  const read = () => value;
  const write = (next_value) => {
    const prev = value;
    value = next_value;

    notification_list.forEach((fn) => fn(value, prev));
  };
  const observable = (fn) => {
    notification_list.add(fn);

    const unsubscribe = () => {
      notification_list.delete(fn);
    };
    return { unsubscribe };
  };

  return [read, write, observable];
}
export function create_resource_name(initialName, list) {
  let newName = initialName;
  let counter = 1;
  while (list.includes(newName)) {
    newName = `${initialName}_${counter}`;
    counter++;
  }
  return newName;
}
export function dragElement(elmnt, zone) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const dragZone = elmnt.querySelector(zone);
  if (dragZone) {
    dragZone.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
    elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const newArray = [];
    for (let i = 0; i < obj.length; i++) {
      newArray[i] = deepClone(obj[i]);
    }
    return newArray;
  }

  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key]);
    }
  }

  return newObj;
}
export function deepFreeze(obj) {
  const clonedObj = deepClone(obj);
  Object.freeze(clonedObj);

  // Recursively freeze nested objects
  Object.getOwnPropertyNames(clonedObj).forEach(function (prop) {
    if (
      clonedObj[prop] !== null &&
      (typeof clonedObj[prop] === 'object' ||
        typeof clonedObj[prop] === 'function') &&
      !Object.isFrozen(clonedObj[prop])
    ) {
      deepFreeze(clonedObj[prop]);
    }
  });

  return clonedObj;
}
