import { RESOURCE_TYPES } from '../data/data.models.js';
import { App } from './programs_model.js';

export class Folder extends App {
  constructor(shape) {
    shape.icon = 'folder.svg';
    shape.type = RESOURCE_TYPES.FOLDER;
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
      fileIcon.src = `/icons/${file.icon_name}`;
      const fileName = document.createElement('p');
      fileName.innerText = `${file.name}`;
      divFile.appendChild(fileIcon);
      divFile.appendChild(fileName);

      containerDIV.appendChild(divFile);
    });
    targetHTMLElement.appendChild(containerDIV);
  }
}
