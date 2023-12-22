import { RESOURCE_TYPES } from '../data/data.models.js';
import { App } from './programs_model.js';

export class Papelera extends App {
  constructor(shape) {
    shape.name = 'papelera';
    shape.icon = 'trash-can.svg';
    shape.type = RESOURCE_TYPES.APP;
    super(shape);
  }
  renderContent(targetHTMLElement) {
    const containerDIV = document.createElement('div');
    containerDIV.classList.add('file-list');
    this.content.forEach((file) => {
      //
      const divFile = document.createElement('div');
      divFile.classList.add('file');
      const fileIcon = document.createElement('img');
      fileIcon.width = 32;

      fileIcon.src = `/icons/${file.icon}`;
      const fileName = document.createElement('p');
      fileName.innerText = `${file.name}`;
      divFile.appendChild(fileIcon);
      divFile.appendChild(fileName);

      containerDIV.appendChild(divFile);
    });
    targetHTMLElement.appendChild(containerDIV);
  }
}
