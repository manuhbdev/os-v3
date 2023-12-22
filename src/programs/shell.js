import { RESOURCE_TYPES } from '../data/data.models.js';
import { create_resource_name } from '../core/utils.core.js';
import { TreeNode, add_tree_prototypes } from '../core/file_system.core.js';
import { storage } from '../core/storage.core.js';

export class Shell {
  constructor(fileSystem, user) {
    this.root = fileSystem;
    this.current_user = user;

    this.user_home_diretory = this.get_home_dir();
    this.current_node = this.user_home_diretory;
    // UI
    this.container_HTML = null;
    this.input_label_HTML = null;
    this.input_HTML = null;
    this.output_HTML = null;
  }
  read(input) {
    this.print_user_command(input); // print user_input
    this.input_HTML.value = ''; // clear user_input

    const [command, ...args] = input.split(' ');
    switch (command) {
      case 'ls':
        const printContent = (node, indent = 0) => {
          const indentation = '  '.repeat(indent);
          const nodeType = node.isDirectory ? '/' : '';
          this.print(`${indentation}${node.name}${nodeType}`);
          for (const child of node.children) {
            printContent(child, indent + 1);
          }
        };
        printContent(this.current_node);
        break;
      case 'pwd':
        this.print(`current directory: ${this.current_node.name}`);
        break;
      case 'mkdir':
        const dir_list = this.current_node.children
          .filter((node) => node.type === RESOURCE_TYPES.DIRECTORY)
          .map((node) => node.name);
        const newDirectoryName = create_resource_name(args[0], dir_list);

        this.current_node.addChild(
          new TreeNode(newDirectoryName, true, this.current_node)
        );
        storage.save_fs();
        break;
      case 'touch':
        const file_list = this.current_node.children
          .filter((node) => node.type === RESOURCE_TYPES.FILE)
          .map((node) => node.name);
        const new_file_name = create_resource_name(args[0], file_list);

        this.current_node.addChild(
          new TreeNode(
            new_file_name,
            false,
            this.current_node,
            RESOURCE_TYPES.FILE,
            'file.svg'
          )
        );
        storage.save_fs();
        break;
      case 'rm':
        const itemNameToRemove = args[0];
        const indexToRemove = this.current_node.children.findIndex(
          (child) => child.name === itemNameToRemove
        );
        const itemFound = indexToRemove !== -1;

        if (itemFound) {
          this.current_node.children.splice(indexToRemove, 1);
          this.print(`'${itemNameToRemove}' removed.`);
        } else {
          this.print(`'${itemNameToRemove}' not found.`);
        }

        storage.save_fs();
        break;
      case 'cd':
        const invalidConditions = [!args[0]];
        const target_invalid = invalidConditions.some((cond) => cond === true);
        const target_parent = args[0] === '..';
        const target_root = args[0] === '/';
        const target_user_home = args[0] === '~';

        if (target_invalid) {
          this.print("Invalid command. Type 'help' for a list of commands.");
        } else if (target_root) {
          this.current_node = this.root;
          this.print('go to root.');
        } else if (target_user_home) {
          this.current_node = this.user_home_diretory;
          this.print('go to home.');
        } else if (target_parent) {
          const isRoot = this.current_node === this.root;
          if (isRoot) {
            //
            this.print('already at Root');
            //
          } else {
            this.current_node = this.current_node.parent;
            this.print('go to parent.');
          }
        } else {
          // target__children
          const targetNodeName = args[0];
          const nodeFound = this.current_node.children
            // .filter((node) => node.isDirectory === true)
            .find((node) => node.name === targetNodeName);

          if (!nodeFound) {
            console.warn('not-found', targetNodeName);
          } else {
            this.current_node = nodeFound;
          }
        }
        this.update_label();
        break;
      case 'clear':
      case 'cls':
        this.clear();
        break;
      case 'help':
        this.print(`
      Available Commands:
          ls          List files and directories
          cd ..       Move up one level
          cd [dir]    Change directory
          pwd         Print current directory
          mkdir       Create a new directory
          touch       Create a new file
          rm          Remove a file or directory
          clear       Clear the screen
          help        Display this help message`);
        break;
      default:
        this.print("Invalid command. Type 'help' for a list of commands.");
        break;
    }

    this.update_label();
    this.scroll_bottom();
  }
  print(text) {
    console.log('⌨️', text);
    // HTML_print
    const output_record = document.createElement('pre');
    output_record.innerText = text;
    //
    this.output_HTML.appendChild(output_record);
    //
    this.update_label();
    this.scroll_bottom();
  }
  print_user_command(text) {
    const output_record = document.createElement('pre');
    output_record.classList.add('user_input');
    // output_record.innerText = `/${this.current_node.get_full_path()} ${text}`;
    if (!(this.current_node instanceof TreeNode)) {
      add_tree_prototypes(this.current_node);
    }
    output_record.innerText = `/${this.current_node.get_full_path()} ${text}`;
    this.output_HTML.appendChild(output_record);
    this.scroll_bottom();
  }

  get_home_dir() {
    const home = this.root.children.find((node) => node.name === 'home');
    return home.children.find(
      (node) => node.name === this.current_user.username
    );
  }
  update_label() {
    if (!(this.current_node instanceof TreeNode)) {
      add_tree_prototypes(this.current_node);
    }
    this.input_label_HTML.innerText = `/${this.current_node.get_full_path()}`;
  }
  scroll_bottom() {
    this.container_HTML.scrollTo({
      top: this.output_HTML.scrollHeight,
    });
    this.input_HTML.focus();
  }
  clear() {
    console.clear();
    this.output_HTML.innerHTML = '';
  }
}
