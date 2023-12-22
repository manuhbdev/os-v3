import { login } from '../../core/auth.core';
import { router } from '../../core/router.core';
import { get_users } from '../../core/state.core';

export function LoginPage() {
  var __state = {
    name: 'login',
  };
  var __selector = 'login-page';
  var __target_element = null;
  function init(dom_el) {
    __target_element = dom_el;
  }
  function render() {
    const template_node = create_template_node();
    set_listeners(template_node);
    __target_element.appendChild(template_node);
  }
  function mounted() {}
  function before_destroy() {}
  //
  function set_listeners(template) {
    template.addEventListener('click', (event) => {
      //
      const el = event.target;
      switch (el.tagName) {
        case 'BUTTON':
          const username = el.dataset.username;
          if (username) {
            login(username);
          }
          break;
      }
    });
  }
  function create_template_node() {
    const user_cards = get_users()
      .list.map((user) => create_user_card(user).innerHTML)
      .join('');
    const styles = `
        ${__selector}{
          height: 100%;
          background-color: var(--login-page-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: white;
          transition:all .3s ease-in-out;
          .users {
            display: flex;
            gap: 1rem;
          }
          .user {
            height: 300px;
            width: 250px;
      
            border: 5px double;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.3rem;
            font-size: 1.5rem;
      
            > button {
              padding: 0.5rem 1rem;
              background: rgb(229, 228, 228);
              border: 0;
              outline: none;
            }
            > button:hover {
              cursor: pointer;
              background: white;
            }
          }
         }`;
    const template = `
      <style>${styles}</style>
      <div class="users">
        ${user_cards}
      </div>
      `;
    const node = document.createElement(__selector);
    node.innerHTML = template;
    return node;
  }
  function create_user_card(user) {
    const card = document.createElement('div');
    card.innerHTML = `
      <div class="user">
        <div class="avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
            <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
          </svg>
         </div>
        <p class="username">${user.username}</p>
        <button class="user_login" data-username="${user.username}">iniciar sesion</button>
        </div>
      `;
    return card;
  }
  return {
    init,
    render,
    mounted,
    before_destroy,
  };
}
