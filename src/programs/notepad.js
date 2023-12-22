import { RESOURCE_TYPES } from '../data/data.models.js';
import { App } from './programs_model.js';

export class Notepad extends App {
  constructor(shape) {
    shape.name = 'notes';
    shape.icon = 'notepad.svg';
    shape.type = RESOURCE_TYPES.APP;
    super(shape);
  }
  renderContent(targetHTMLElement) {
    const textArea = document.createElement('div');
    textArea.classList.add('editor');
    textArea.setAttribute('contenteditable', true);
    textArea.setAttribute('autofocus', true);
    textArea.setAttribute('spellcheck', false);
    textArea.ondrop = () => {
      return false;
    };
    textArea.style.width = `${100}%`;
    textArea.style.height = `${100}%`;
    textArea.innerHTML = 'Untitled Note';
    //
    targetHTMLElement.appendChild(textArea);
  }
}
