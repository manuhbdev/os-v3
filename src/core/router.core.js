function _router() {
  var __routes = {};
  var __current = null;
  var __target_element = null;
  //
  function init(routes) {
    routes.forEach((r) => (__routes[r.path] = r));
    __target_element = document.getElementById('app');

    window.addEventListener('popstate', (e) => {
      const path = e.state.path;
      navigate(path, false);
    });
    const initial_path = window.location.pathname;
    navigate(initial_path);
  }
  function navigate(path, push_to_history = true) {
    console.log(`navigate(${path})`);
    const route_found = __routes[path];
    if (!route_found) {
      throw new Error('invalid route');
      return;
    }

    // redirect
    if (route_found.redirect_to) {
      navigate(route_found.redirect_to);
      return;
    }

    // validate guards
    const have_guards = !!route_found.guards;

    if (have_guards && !route_found.guards.every((fn) => fn() === true)) {
      console.warn('guard rejection');
      navigate('/');
      return;
    }

    // unmount
    if (__current) {
      const component = __current.component_instance;
      component.before_destroy();
    }

    // mount
    __current = route_found;
    __current.component_instance = __current.component();

    // reset view
    window.scroll(0, 0);

    const component = __current.component_instance;
    component.init(__target_element);
    __target_element.innerHTML = '';
    component.render();
    component.mounted();

    if (push_to_history) {
      window.history.pushState({ path: __current.path }, null, __current.path);
    }
  }

  return {
    init,
    navigate,
  };
}

export const router = _router();
