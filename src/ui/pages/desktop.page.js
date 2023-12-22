import { logout } from '../../core/auth.core';
import {
  $fs,
  $system,
  get_fs,
  get_system,
  get_users,
} from '../../core/state.core';
import { create_resource_name, create_state } from '../../core/utils.core';
import {
  DesktopIcon,
  Window,
  WINDOW_STATES,
  RESOURCE_TYPES,
} from '../../data/data.models';

import { Shell } from '../../programs/shell';
import { Folder } from '../../programs/folder';
import { Notepad } from '../../programs/notepad';
import { Papelera } from '../../programs/papelera';
import { Terminal } from '../../programs/terminal';
import { create_new_dir, create_new_file } from '../../core/file_system.core';

export function DesktopPage() {
  var __state = {
    name: 'desktop',
  };
  var __selector = 'desktop-page';
  var __target_element = null;
  var [get_current_user, set_current_user, $current_user] = create_state({});
  var [get_windows, set_windows, $windows] = create_state([]);
  var [get_desktop_icons, set_desktop_icons, $desktop_icons] = create_state([]);
  var __subscriptions = new Set();
  //
  function init(dom_el) {
    __target_element = dom_el;
  }
  function render() {
    const node_template = create_node_template();
    set_listeners(node_template);
    __target_element.appendChild(node_template);
  }
  function mounted() {
    console.log('🪼 user', get_users().current);
    set_context_menu();
    create_all_desktop_icons();
    draw_all_desktop_icons();

    __subscriptions.add(
      $fs((new_fs) => {
        console.log('fs changed');
        update_ui_objects();
      })
    );
  }
  // ICONS
  function create_desktop_icon(node) {
    const index = get_desktop_icons().length;
    const desktop_icon = new DesktopIcon({
      id: `${node.name}_${index}`,
      icon: node.icon_name,
      name: node.name,
      app: {
        id: `${node.name}_${index}`,
        type: node.type,
        node,
      },
    });
    get_desktop_icons().push(desktop_icon);
  }
  function create_all_desktop_icons() {
    const current_user = get_users().current;
    const user_home_dir = get_user_home_dir(current_user.username);
    const user_desktop_dir = user_home_dir.children.find(
      (node) => node.name === 'Desktop'
    );

    set_desktop_icons([]);
    user_desktop_dir.children.forEach((node) => create_desktop_icon(node));
  }
  function draw_all_desktop_icons() {
    const container = document.querySelector('#icons');
    container.innerHTML = '';
    get_desktop_icons().forEach((icon) => {
      const iconHTML = icon.getHTML();
      const iconImg = iconHTML.querySelector('.img_container');
      iconImg.onclick = () => {
        open_app(icon.app.node.name);
      };
      container.appendChild(iconHTML);
    });
  }
  // WINDOWS
  function open_app(node_name) {
    const node = get_desktop_dir(get_current_user().username).children.find(
      (n) => n.name === node_name
    );
    let window_found = get_windows().find((w) => w.name === node.name);
    if (!window_found) {
      window_found = create_window(node);
    }
    window_found.open();
    updateActiveWindow(window_found);
    update_ui_objects();
  }

  function create_window(node) {
    const index = get_windows().length;
    const system_window = new Window({
      id: `${node.name}_${index}`,
      name: node.name,
      icon: node.icon_name,
      app: {
        id: `${node.name}_${index}`,
        type: node.type,
        node,
        program: get_program(node),
      },
    });
    get_windows().push(system_window);
    return system_window;
  }
  function draw_all_windows() {
    const container = document.querySelector('#windows');
    container.innerHTML = '';
    get_windows().forEach((w) => {
      const windowHTML = w.windowHTML;
      const windowName = windowHTML.querySelector('.window__header .name');
      const windowAppName = windowHTML.querySelector(
        '.window__header .app-name'
      );
      const minControl = windowHTML.querySelector('.window__controls .min');
      const closeControl = windowHTML.querySelector('.window__controls .close');
      // update name
      windowAppName.innerText = w.name;
      const windowContent = windowHTML.querySelector('.window__content');
      if (windowContent.innerHTML === '') {
        if (w.app.program) {
          w.app.program.renderContent(windowContent);
        }
      }
      windowName.onclick = () => updateActiveWindow(w);
      windowContent.onclick = () => updateActiveWindow(w);
      // controls
      minControl.onclick = () => {
        w.minimize(windowHTML);
        setTimeout(() => {
          update_ui_objects();
        }, 0.5 * 1000);
      };
      closeControl.onclick = () => {
        w.close(windowHTML);
        setTimeout(() => {
          update_ui_objects();
        }, 0.5 * 1000);
      };
      container.appendChild(windowHTML);
    });
  }
  function get_program(node) {
    let program = false;
    switch (node.type) {
      case RESOURCE_TYPES.APP:
        const app_name = node.name.toLowerCase();
        switch (app_name) {
          case 'terminal':
            const shell = new Shell(get_fs(), get_users().current);
            program = new Terminal({}, shell);
            break;
          case 'notepad':
            program = new Notepad({
              id: node.id,
              content: [],
            });
            break;
          case 'papelera':
            program = new Papelera({
              id: node.id,
            });
            break;
        }
        break;
      case RESOURCE_TYPES.FILE:
        break;
      case RESOURCE_TYPES.SHORTCUT:
        break;
      case RESOURCE_TYPES.DIRECTORY:
        program = new Folder({
          id: node.id,
          content: node.children,
        });
        break;
    }
    return program;
  }
  function updateActiveWindow(app) {
    get_windows().forEach((w) => {
      if (w.id === app.id) {
        w.isActive = true;
        w.windowHTML.classList.remove('close');
        w.windowHTML.classList.remove('min');
        w.windowHTML.classList.add('open');
        w.windowHTML.classList.add('active');
      } else {
        w.isActive = false;
        w.windowHTML.classList.remove('active');
      }
    });
  }

  //
  function get_user_home_dir(username) {
    const home_dir = get_fs().children.find((node) => node.name === 'home');
    const user_home_dir = home_dir.children.find(
      (node) => node.name === username
    );
    return user_home_dir;
  }
  function get_desktop_dir() {
    const desktop_dir = get_user_home_dir(
      get_users().current.username
    ).children.find((node) => node.name === 'Desktop');
    return desktop_dir;
  }

  function draw_opened_apps_bar() {
    const targetContainer = document.querySelector('#open_apps_bar');
    targetContainer.innerHTML = '';
    const open_windows = get_windows().filter(
      (w) => w.state !== WINDOW_STATES.CLOSED
    );
    open_windows.forEach((w) => {
      const footerApp = document.createElement('div');
      footerApp.id = w.id;
      footerApp.classList.add('min_app');
      if (w.isActive) {
        footerApp.classList.add('active');
      }
      footerApp.innerHTML = `<img width="32px" src="/icons/${w.icon}"/>`;
      footerApp.onclick = () => {
        open_app(w.app.node.name);
      };
      targetContainer.appendChild(footerApp);
    });
  }
  function update_ui_objects() {
    create_all_desktop_icons();
    draw_all_desktop_icons();
    // //
    draw_all_windows();
    draw_opened_apps_bar();
  }
  // function set_window_name(prev_name, node) {
  //   const window_found = get_windows().find((w) => w.name === prev_name);
  //   if (window_found) {
  //     window_found.name = node.name;
  //     // update_ui_objects();
  //   }
  // }
  // *******
  function before_destroy() {
    __subscriptions.forEach((s) => s.unsubscribe());
  }
  //
  function set_listeners(template) {
    template.addEventListener('click', (e) => {
      const el = e.target;
      switch (el.id) {
        case 'logout_btn':
          logout();
          break;
      }
    });
  }
  function create_node_template() {
    const node_template = document.createElement(__selector);
    const styles = `
    ${__selector}{
      height: 100%;
      background-color: var(--desktop-page-bg);
      display: flex;
      flex-direction: column;
      position: relative;
      transition:all .3s ease-in-out;

      /* ICON */

      .icon {
        cursor: pointer;
        > img {
          display: block;
        }
      }
      
      #open_apps_bar {
        position: absolute;
        bottom: 0;
        left: 40%;
        z-index: 10;
        padding: 1rem;
        display: flex;
        justify-content: center;
        gap: 0.5rem;
      
        .min_app {
          width: 48px;
          height: 48px;
          background-color: var(--desktop__min_app-bg);
          border-radius: var(--border-radius);
          border: var(--border);
      
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.7;
          &:hover {
            opacity: 0.9;
          }
          &:active {
            transition: all 0.3s ease-in-out;
            transform: scale(0.95);
            opacity: 0.9;
          }
          &.active {
            background-color: var(--desktop__min_app--active);
          }
        }
      }
      
      /* TERMINAL */
      .terminal {
        width: 100%;
        height: 100%;
        scrollbar-gutter: stable both-edges;
        font-size: 1rem;
        font-weight: normal;
      }
      .terminal_output {
        /* font-size: 1rem; */
        opacity: 0.5;
      }
      .terminal_output pre.user_input {
        /* background-color: #d5a626; */
        font-weight: bold;
        /* border: 1px solid; */
        background-color: #a59776;
      }
      .input-bar {
        font-size: 1rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        /* background-color: fuchsia; */
        /* background-color: #f0b910; */
      }
      .input-bar label {
      }
      
      .input-bar input {
        border: none;
        outline: none;
        height: 2rem;
        width: 80%;
        background-color: transparent;
        background-color: #f0b910;
        padding-left: 0.3rem;
        border-radius:var(--border-radius)
      }
      /* NOTEPAD */
      .editor {
        /* background-color: rgba(128, 128, 128, 0.3); */
        height: 100%;
        padding: 0.3rem;
        outline: none;
        border: none;
        border-bottom: 1px solid rebeccapurple;
        font-weight: bold;
        font-size: 2rem;
        overflow: auto;
        > * {
          font-size: 1rem;
          border-bottom: 2px solid gray;
          /* font-weight: 400; */
        }
      }
      
      .notification_bar {
        background-color: var(--desktop__notification-bar-bg);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
        flex-basis: 5%;
        padding-right: 0.5rem;
  
        > svg {
          opacity: 0.5;
          cursor: pointer;
          &:hover {
            opacity: 1;
          }
        }
  
        .icon {
          padding: 0.1rem 0.5rem;
          cursor: pointer;
        }
      }
      .content {
        flex-basis: 90%;
        position: relative;
  
        #icons {
          width: min-content;
          height: 100%;
  
          position: absolute;
          top: 0;
          left: 0;
  
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 0.3rem;
  
          padding: 1rem;
          padding-left: 0.5rem;
  
          .icon {
            cursor: pointer;
            /* width: 150px; */
            min-width: 120px;
            border-radius: var(--border-radius);
            padding: 1rem;
            opacity: 0.8;
            &:hover {
              background-color: var(--desktop__icon-hover);
            }
          }
        }
  
        #windows {
          position: absolute;
          width: 100%;
          height: 300px;
          z-index: 3;
          top: 0;
          height: 0;
          .window {
            border: var(--border);
            position: absolute;
            top: 20%;
            left: 20%;
            width: 650px;
            height: 300px;
            min-width: 250px;
            min-height: 250px;
            font-weight: bold;
  
            background-color: aliceblue;
            border-radius: var(--border-radius);
            resize: both;
            overflow: auto;
  
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out,
              z-index 0.3s ease-in-out;
  
            display: flex;
            flex-direction: column;
          }
          .window.active {
            /* border: 4px solid #20d19c; */
            box-shadow: var(--window__shadow);
            z-index: 5;
          }
          .window.active .window__header {
            background-color: var(--desktop__window_header-active);
          }
          .window__header {
            background-color: var(--window__header__bg-color);
            flex-basis: var(--window__header__height);
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            padding: 0.3rem;
            padding-left: 0.5rem;
            border-bottom: var(--border) black;
          }
          .window__header .name {
            flex-basis: 90%;
            height: 100%;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .window__controls {
            flex-basis: 10%;
            display: flex;
            justify-content: flex-end;
            gap: 0.1rem;
          }
          .window__controls .control {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            /* pointer-events: none; */
            width: 32px;
            height: 32px;
            border: var(--border);
            opacity: 0.7;
            border-radius: var(--window__controls__border-radius);
  
            &:hover {
              opacity: 0.9;
              background-color: #c5bead;
            }
          }
          .window__content {
            flex-basis: 95%;
            background-color: var(--window__content__bg-color);
            width: 100%;
            height: 100%;
            padding: 1rem;
            overflow: auto;
            > div {
              border: none;
              outline: none;
              font-family: 'Courier New', Courier, monospace;
            }
          }
          .window.min {
            transform: translate(0%, 250%) scale(0);
          }
          .window.close {
            transition: all 0.3s ease-in-out;
            transform: scale(0);
          }
        }
      }
      .footer {
        flex-basis: 5%;
      }
      .context_menu_container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 0rem;
  
        .overlay {
          width: 100%;
          height: 100%;
  
          position: absolute;
          z-index: 3;
          /* background-color: rgba(190, 83, 83, 0.1); */
        }
        .context_menu {
          position: absolute;
  
          z-index: 3;
  
          width: 9rem;
          /* height: 200px; */
          background-color: whitesmoke;
          border: var(--border);
          border-radius: var(--border-radius);
  
          display: flex;
          flex-direction: column;
          gap: 0rem;
  
          overflow: hidden;
          cursor: pointer;
  
          .action {
            border: none;
            border-bottom: var(--border);
  
            height: 36px;
            padding: 1rem;
  
            display: flex;
            align-items: center;
            gap: 0.5rem;
  
            cursor: pointer;
            &:hover {
              opacity: 0.9;
              background-color: rgba(0, 0, 0, 0.1);
            }
          }
          .action:nth-last-child(1) {
            border: none;
          }
        }
      }
     }`;
    const template = `
        <style>${styles}</style>
        ${create_notification_bar(get_users().current)}
        <div class="content" id="content">
          <div class="icons" id="icons"></div>
          <div class="windows" id="windows"></div>
        </div>
       <div class="footer" id="open_apps_bar"></div>
       ${create_context_menu_html()}
    `;
    node_template.innerHTML = template;

    return node_template;
  }

  function create_notification_bar(user) {
    return `
    <div class="notification_bar">
    <!-- internet -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-wifi"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z"
            />
            <path
              d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091l.016-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z"
            />
          </svg>
          <!-- bluet-->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-bluetooth"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="m8.543 3.948 1.316 1.316L8.543 6.58V3.948Zm0 8.104 1.316-1.316L8.543 9.42v2.632Zm-1.41-4.043L4.275 5.133l.827-.827L7.377 6.58V1.128l4.137 4.136L8.787 8.01l2.745 2.745-4.136 4.137V9.42l-2.294 2.274-.827-.827L7.133 8.01ZM7.903 16c3.498 0 5.904-1.655 5.904-8.01 0-6.335-2.406-7.99-5.903-7.99C4.407 0 2 1.655 2 8.01 2 14.344 4.407 16 7.904 16Z"
            />
          </svg>
  
          <!-- battery -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-battery-half"
            viewBox="0 0 16 16"
          >
            <path d="M2 6h5v4H2V6z" />
            <path
              d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"
            />
          </svg>
          <!-- volume -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-volume-down-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zm3.025 4a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z"
            />
          </svg>
          <div class="time" id="time"></div>
          <!-- settings -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-gear-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
            />
          </svg>
      <p class="username">${user.username}</p>
      <button class="icon" id="logout_btn">logout</button>
    </div>
    `;
  }
  // context-menu
  function create_context_menu_html() {
    const template = `
    <div
    class="context_menu_container"
    id="context_menu_container"
    style="display: none"
  >
    <div class="overlay" id="context_menu_overlay"></div>
    <div class="context_menu" id="context_menu">
      <button class="action" name="new-file" id="action__new-file" >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-file-earmark-plus"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"
          />
          <path
            d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"
          /></svg
        >new file
      </button>
      <button class="action" name="new-folder" id="action__new-folder">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-folder-plus"
          viewBox="0 0 16 16"
        >
          <path
            d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2Zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672Z"
          />
          <path
            d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5Z"
          /></svg
        >new folder
      </button>
      <button class="action" name="personalizar" id="action__customize">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-brush"
          viewBox="0 0 16 16"
        >
          <path
            d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04zM4.705 11.912a1.23 1.23 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.39 3.39 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3.122 3.122 0 0 0 .126-.75l-.793-.792zm1.44.026c.12-.04.277-.1.458-.183a5.068 5.068 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005a.031.031 0 0 1-.007.004zm3.582-3.043.002.001h-.002z"
          /></svg
        >Personalizar
      </button>
      <button class="action" name="settings" id="action__settings">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-gear"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
          />
          <path
            d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
          /></svg
        >Settings
      </button>
    </div>
    </div>`;
    return template;
  }
  function set_context_menu() {
    const context_menu_container = document.getElementById(
      'context_menu_container'
    );
    const context_menu = context_menu_container.querySelector('.context_menu');
    const context_menu_overlay =
      context_menu_container.querySelector('.overlay');

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (
        e.target.closest('#windows-container') ||
        e.target.closest('#navbar')
      ) {
        console.warn('invalid on window');
        return;
      }
      show_context_menu();
      context_menu.style.top = `${e.offsetY}px`;
      context_menu.style.left = `${e.offsetX}px`;
    });
    context_menu_overlay.onclick = hide_context_menu;

    const actions = context_menu.querySelectorAll('.action');
    set_actions(actions);
  }
  function show_context_menu() {
    const menu = document.querySelector('#context_menu_container');
    menu.style.display = 'flex';
  }
  function set_actions(actions) {
    actions.forEach((action) => {
      action.onclick = (e) => {
        const btn = e.target.closest('.action');
        switch (btn.name) {
          case 'new-folder':
            console.log('new-folder');

            const directory_list = get_desktop_dir(get_users().current)
              .children.filter((n) => n.type === RESOURCE_TYPES.DIRECTORY)
              .map((n) => n.name);

            const clean_folder_name = create_resource_name(
              'new_folder',
              directory_list
            );

            const folder_node = create_new_dir(
              get_desktop_dir(get_users().current),
              clean_folder_name
            );
            create_desktop_icon(folder_node);
            create_window(folder_node);
            break;
          case 'new-file':
            console.log('new-file');
            const file_list = get_desktop_dir(get_users().current)
              .children.filter((n) => n.type === RESOURCE_TYPES.FILE)
              .map((n) => n.name);
            const clean_file_name = create_resource_name('new_file', file_list);
            const file_node = create_new_file(
              get_desktop_dir(get_users().current),
              clean_file_name
            );
            create_desktop_icon(file_node);
            create_window(file_node);
            break;
          case 'personalizar':
            console.log(btn.name);
            break;
          case 'settings':
            console.log(btn.name);
            break;
          default:
            console.log(btn.name);
            break;
        }
        hide_context_menu();
      };
    });
  }
  function hide_context_menu() {
    const menu = document.querySelector('#context_menu_container');
    menu.style.display = 'none';
  }
  //
  return {
    init,
    render,
    mounted,
    before_destroy,
  };
}
