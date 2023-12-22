import { App } from './programs_model.js';

export class Terminal extends App {
  constructor(shape, shell) {
    shape.name = 'terminal';
    shape.icon = 'terminal.svg';
    super(shape);
    this.shell = shell;
  }
  renderContent(targetHTMLElement) {
    // template
    const terminal_div = document.createElement('div');
    const terminal_HTML = `
      <div id="terminal_${this.id}" class="terminal">
        <div id="terminal__output" class="terminal_output"></div>
        <div class="input-bar">
          <label
            for="terminal__input"
            id="terminal__input-label"
            class="unselectable"
            ></label
          >
          <input type="text" id="terminal__input" autocomplete="off" />
        </div>
      </div>
      `;
    terminal_div.innerHTML = terminal_HTML;
    // input_label
    const input_label = terminal_div.querySelector(`#terminal__input-label`);
    // input
    const input_control = terminal_div.querySelector(`#terminal__input`);
    input_control.addEventListener('keyup', (event) => {
      const isEnter = event.key === 'Enter';
      if (isEnter) {
        const user_input = event.target;
        this.shell.read(user_input.value);
      }
    });
    // output
    const output = terminal_div.querySelector(`#terminal__output`);
    // connecting UI to shell
    this.shell.container_HTML = targetHTMLElement;
    this.shell.input_HTML = input_control;
    this.shell.input_label_HTML = input_label;
    this.shell.output_HTML = output;
    this.shell.update_label();
    // inject in window
    targetHTMLElement.appendChild(terminal_div);
  }
}
