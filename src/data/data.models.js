import { create_resource_name, dragElement } from '../core/utils.core';
import { storage } from '../core/storage.core';

export const RESOURCE_TYPES = {
  SHORTCUT: 'SHORTCUT',
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY',
  APP: 'APP',
};
export const WINDOW_STATES = {
  OPEN: 'open',
  CLOSED: 'close',
  MIN: 'min',
};
export class DesktopIcon {
  constructor({ id, icon, name, app }) {
    this.id = id;
    this.icon = icon;
    this.name = name;
    this.app = app;
  }
  getHTML() {
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('icon');

    const isFile = this.app.type === RESOURCE_TYPES.FILE;
    const isFolder = this.app.type === RESOURCE_TYPES.DIRECTORY;
    const isEditable = isFile || isFolder;
    //
    if (isEditable) {
      iconDiv.innerHTML = `
            <div class="img_container">
              <img width="32px" src="/icons/${this.icon}"/>
            </div>
            <p class="name" spellcheck="false"  contenteditable="true" ondrop="return false;"  >${this.name}</p>
          `;
      const resourceName = iconDiv.querySelector('.name');
      resourceName.addEventListener('blur', (event) => {
        const newName = event.target.firstChild?.data || '';
        const cleanName = newName.replace(/\s/g, '');
        const validName = cleanName !== '';
        if (!validName) {
          event.target.innerHTML = '';
          event.target.innerText = this.name;
          return;
        }
        //

        const list = this.app.node.children
          .filter((node) => node.type === this.type)
          .map((node) => node.name);
        const prev_name = this.app.node.name;
        this.name = create_resource_name(cleanName, list);

        this.app.node.name = cleanName;
        storage.save_fs();
        // set_window_name(prev_name, this.app.node);
      });
    } else {
      iconDiv.innerHTML = `
            <div class="img_container">
              <img width="32px" src="/icons/${this.icon}"/>
            </div>  
            <p class="name">${this.name}</p>
          `;
    }
    return iconDiv;
  }
}
export class Window {
  constructor({ id, name, icon, app }) {
    this.state = WINDOW_STATES.CLOSED;
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.app = app;
    this.isActive = false;
    this.windowHTML = this.getHTML();
  }
  getHTML() {
    const windowDIV = document.createElement('div');
    windowDIV.classList.add('window');
    windowDIV.classList.add(WINDOW_STATES.CLOSED);
    windowDIV.innerHTML = `
      <div class="window__header">
      <div class="name">
          <img width="16px" src="/icons/${this.icon}"/>
          <p class="app-name">${this.name}</p>
      </div>
  
       <div class="window__controls">
          <div class="control min">-</div>
          <div class="control close">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
          </div>
       </div>
      </div>
      <div class="window__content"></div>
      <div class="window__footer">
  
      </div>
      `;
    windowDIV.style.top = `${Math.random() * 15 + 100}px`;
    windowDIV.style.left = `${Math.random() * 100 + 100}px`;

    dragElement(windowDIV, '.window__header .name');
    //
    const minControl = windowDIV.querySelector('.window__controls .min');
    minControl.onclick = () => this.minimize(windowDIV);
    //
    const closeControl = windowDIV.querySelector('.window__controls .close');
    closeControl.onclick = () => this.close(windowDIV);

    return windowDIV;
  }
  open() {
    this.state = WINDOW_STATES.OPEN;
    this.isActive = true;
    this.windowHTML.classList.add('open');
    this.windowHTML.classList.remove('min');
    this.windowHTML.classList.remove('active');
    this.windowHTML.classList.remove('close');
  }
  minimize(windowHTML) {
    this.state = WINDOW_STATES.MIN;
    this.isActive = false;
    windowHTML.classList.add('min');
    windowHTML.classList.remove('open');
    windowHTML.classList.remove('active');
    windowHTML.classList.remove('close');
  }
  close(windowHTML) {
    this.state = WINDOW_STATES.CLOSED;
    const window_content = windowHTML.querySelector('.window__content');
    window_content.innerHTML = '';

    this.isActive = false;
    windowHTML.classList.add('close');
    windowHTML.classList.remove('open');
    windowHTML.classList.remove('active');
    windowHTML.classList.remove('min');
  }
}
