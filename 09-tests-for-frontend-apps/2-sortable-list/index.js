export default class SortableList {
  element;
  draggingEl;
  placeholderEl;
  x;
  y;

  constructor({items} = {}) {
    this.items = [...items];
    this.mouseDown = this.dragDrop.bind(this);
    this.mouseMove = this.mouseMoveHandler.bind(this);
    this.mouseUp = this.mouseUpHandler.bind(this);
    this.render();
    this.element.ondragstart = function () {
      return false;
    };
  }

  _addList() {
    for (let item of this.items) {
      item.classList.add('sortable-list__item');
    }
    this.element.append(...this.items)
  }

  render() {
    console.log(this.items)
    this.element = document.createElement('div');
    this.element.classList.add('sortable-list');

    this._addList();
    this.addListeners();
  }

  swapPlaceholder(index) {
    const currentElement = this.element.children[index];

    if (currentElement !== this.placeholderEl) {
      this.element.insertBefore(this.placeholderEl, currentElement);
    }
  }

  dragDrop(event) {
    if (event.which !== 1) {
      return;
    }

    const draggingElem = event.target.closest('.sortable-list__item');

    if (draggingElem) {
      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();

        draggingElem.remove();
      } else if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();

        this.mouseStartHandler(draggingElem, event);
      }
    }
  }

  mouseStartHandler(elem, event) {
    console.log(elem);
    const rect = elem.getBoundingClientRect();

    this.x = event.pageX - rect.left;
    this.y = event.pageY - rect.top;

    this.draggingEl = elem;

    elem.style.width = `${elem.offsetWidth}px`;
    elem.style.height = `${elem.offsetHeight}px`;

    this.placeholderEl = document.createElement('li');
    this.placeholderEl.classList.add('sortable-list__placeholder');
    this.placeholderEl.style.width = `${elem.offsetWidth}px`;
    this.placeholderEl.style.height = `${elem.offsetHeight}px`;

    elem.classList.add('sortable-list__item_dragging');
    elem.after(this.placeholderEl);

    this.element.append(elem);

    this.element.addEventListener('pointermove', this.mouseMove);
    this.element.addEventListener('pointerup', this.mouseUp);
  }

  mouseMoveHandler(event) {
    this.replacingMove(event);

    const {firstElementChild, lastElementChild, children} = this.element;
    const firstElementChildTop = firstElementChild.getBoundingClientRect().top;
    const lastElementChildBottom = lastElementChild.getBoundingClientRect().bottom;

    if (event.clientY < firstElementChildTop) {
      this.swapPlaceholder(0);
    } else if (event.clientY > lastElementChildBottom) {
      this.swapPlaceholder(children.length);
    } else {
      for (let i = 0; i < children.length; i++) {
        const liEl = children[i];

        if (liEl !== this.draggingEl) {
          const {top, bottom} = liEl.getBoundingClientRect();
          const height = liEl.offsetHeight;

          if (event.clientY > top && event.clientY < bottom) {
            if (event.clientY < top + height / 2) {
              this.swapPlaceholder(i);
              return;
            } else {
              this.swapPlaceholder(i + 1);
              return;
            }
          }
        }
      }
    }
  }

  replacingMove(event) {
    this.draggingEl.style.top = `${event.clientY - this.y}px`;
    this.draggingEl.style.left = `${event.clientX - this.x}px`;
  }

  mouseUpHandler() {

    this.placeholderEl.replaceWith(this.draggingEl);
    this.draggingEl.classList.remove('sortable-list__item_dragging');

    this.draggingEl.style.removeProperty('top');
    this.draggingEl.style.removeProperty('left');
    this.draggingEl.style.removeProperty('width');
    this.draggingEl.style.removeProperty('height');

    this.draggingEl = null;

    document.removeEventListener('pointermove', this.mouseMove);
    document.removeEventListener('pointerup', this.mouseUp);
  }

  addListeners() {
    this.element.addEventListener('pointerdown', this.mouseDown);
  }

  remove() {
    this.element.remove();
    document.removeEventListener('pointermove', this.mouseMove);
    document.removeEventListener('pointerup', this.mouseUp);
  }

  destroy() {
    this.remove();
  }
}
