export default class NotificationMessage {
  element = document.createElement('div');
  static notificationDiv = document.getElementsByClassName('notification');
  static canShow = true;

  static checkDiv() {
    return this.notificationDiv.length === 0 ?
      this.canShow = true :
      this.canShow = false;
  }

  constructor(text,
              {
                duration = 2000,
                type = 'success',
              } = {}) {

    this.text = text;
    this.duration = duration;
    this.type = type;

    this._render(this.element);
  }

  _getTemplate() {
    return `
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
          ${this.text}
         </div>
        </div>
    `;
  }

  _getParentBlock() {
    this.element.classList.add('notification', this.type);
    this.element.style.setProperty(`--value`, `${this.duration / 1000}s`);
    return this.element;
  }

  show(targetElem = this.element) {
    NotificationMessage.checkDiv();

    let message = this._render(targetElem);

    if (NotificationMessage.canShow) {
      document.body.append(message);
    } else {
      NotificationMessage.notificationDiv[0].remove();
      document.body.append(message);
    }

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  _render(targetElem){
    this.element = targetElem;
    this.element = this._getParentBlock();
    this.element.innerHTML = this._getTemplate();
    return this.element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element = null;
  }
}

// Необходимо реализовать компонент «NotificationMessage» цель которого показывать сообщения пользователям.
// Сообщения могут быть двух типов: «success» и «error» и будут отличаться визуально (См. файл стилей)
//
// К примеру, при успешной загрузке данных на сервер будет показано сообщений типа «success»,
// при возникновении какой-либо ошибки пользователя можно будет предупредить с помощью сообщения типа «error».
//
// Также, данный компонент должен обладать функционалом, который скроет сообщение автоматически через
// некоторый промежуток времени.
//
// В один момент времени на странице может быть показано только одно сообщение, другими словами,
// если на странице уже присутствовало сообщение – его необходимо скрыть.
// Подсказка: Постарайтесь реализовать данную проверку без лишних обращений к DOM (Document Object Model)
