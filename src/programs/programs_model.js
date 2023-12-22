export class App {
  constructor({ id, name, className, type = 'app', content, icon }) {
    this.id = `${type}__${name}__${id}`.toLocaleLowerCase();
    this.name = name;
    this.className = className;
    this.icon = icon;
    this.content = content;
    this.type = type;
    this.state = 'close';
    this.HTMLContent = '';
  }
  renderContent() {}
}
