import { RESOURCE_TYPES } from '../data/data.models';
import { storage } from './storage.core';

export class TreeNode {
  constructor(
    name,
    is_directory,
    parent = null,
    type = RESOURCE_TYPES.DIRECTORY,
    icon_name = 'folder.svg'
  ) {
    this.name = name;
    this.type = type;
    this.icon_name = icon_name;
    this.is_directory = is_directory;
    this.parent = parent;
    this.children = [];
  }
  addChild(childNode) {
    childNode.parent = this;
    this.children.push(childNode);
  }
  get_full_path() {
    // up
    if (this.parent) {
      if (!(this.parent instanceof TreeNode)) {
        add_tree_prototypes(this.parent);
      }
      const parentPath = this.parent.get_full_path();
      return `${parentPath}/${this.name}`;
    } else {
      return `${this.name}`;
    }
  }
}
export function create_default_file_system() {
  const root = new TreeNode('root', true);
  // create-nodes
  const bin__directory = new TreeNode('bin', true); // User Binaries
  const sbin__directory = new TreeNode('sbin', true); // System Binaries
  const etc__directory = new TreeNode('etc', true); // Configuration file
  const dev__directory = new TreeNode('dev', true); // Device Files
  const proc__directory = new TreeNode('proc', true); // Process Information
  const var__directory = new TreeNode('var', true); // Variable Files
  const tmp__directory = new TreeNode('tmp', true); // Temporary Files
  const usr__directory = new TreeNode('usr', true); // User Programs
  const home__directory = new TreeNode('home', true); // Home Directories
  const boot__directory = new TreeNode('boot', true); // Boot Loader Files
  const lib__directory = new TreeNode('lib', true); // System Libraries
  const opt__directory = new TreeNode('opt', true); // Optional Add-On file
  const mnt__directory = new TreeNode('mnt', true); // Mount Directory
  const media__directory = new TreeNode('media', true); // Removable Devices
  const srv__directory = new TreeNode('srv', true); // Service Data

  // connect-nodes
  root.addChild(bin__directory);
  // root.addChild(sbin__directory);
  // root.addChild(etc__directory);
  // root.addChild(dev__directory);
  // root.addChild(proc__directory);
  // root.addChild(var__directory);
  // root.addChild(tmp__directory);
  // root.addChild(usr__directory);
  root.addChild(home__directory);
  // root.addChild(boot__directory);
  // root.addChild(lib__directory);
  // root.addChild(opt__directory);
  // root.addChild(mnt__directory);
  // root.addChild(media__directory);
  // root.addChild(srv__directory);
  //
  home__directory.addChild(create_vfs_user('invitado'));
  home__directory.addChild(create_vfs_user('administrador'));

  return root;
}
//
function create_vfs_user(username) {
  const user_directory = new TreeNode(username, true);
  // create-nodes
  const desktop__directory = new TreeNode('Desktop', true);
  const documents__directory = new TreeNode('Documents', true);
  const downloads__directory = new TreeNode('Downloads', true);
  const pictures__directory = new TreeNode('Pictures', true);
  const code__directory = new TreeNode('Code', true);
  const projects__directory = new TreeNode('Projects', true);
  // connect-nodes
  user_directory.addChild(desktop__directory);
  user_directory.addChild(documents__directory);
  user_directory.addChild(downloads__directory);
  user_directory.addChild(pictures__directory);
  user_directory.addChild(code__directory);
  // inside desktop
  desktop__directory.addChild(projects__directory);
  const app_terminal = new TreeNode(
    'Terminal',
    false,
    null,
    RESOURCE_TYPES.APP,
    'terminal.svg'
  );
  const app_notepad = new TreeNode(
    'Notepad',
    false,
    null,
    RESOURCE_TYPES.APP,
    'notepad.svg'
  );

  desktop__directory.addChild(app_terminal);
  desktop__directory.addChild(app_notepad);
  // inside projects
  const my_os_folder = new TreeNode('my_os', true);
  projects__directory.addChild(my_os_folder);

  return user_directory;
}
export function create_new_dir(node, name) {
  const new_dir = new TreeNode(name, true);

  if (!(node instanceof TreeNode)) {
    add_tree_prototypes(node);
  }

  node.addChild(new_dir);
  storage.save_fs();
  return new_dir;
}
export function create_new_file(node, name) {
  const new_file = new TreeNode(
    name,
    false,
    null,
    RESOURCE_TYPES.FILE,
    'file.svg'
  );
  if (!(node instanceof TreeNode)) {
    add_tree_prototypes(node);
  }

  node.addChild(new_file);
  storage.save_fs();
  return new_file;
}
export function add_tree_prototypes(node) {
  const base_node = new TreeNode('base_node');
  Object.setPrototypeOf(node, base_node);
}
