export default class DoubleSlider {
  element = document.createElement('div');
  thumbLeftElem;
  thumbRightElem;
  progressLine;
  progressDivElem;
  progressCoords;
  isDown = false;
  isLeft;
  shiftX;
  sliderCoords;
  pixelPerValue;
  from;
  to;
  newEdgeLeft;
  newEdgeRight;


  constructor({
                min = 0,
                max = 100,
                formatValue = value => value,
              } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = function (value) {
      return formatValue(value);
    };

    this.render();

    this.element.ondragstart = function () {
      return false;
    };

    this.element.addEventListener('range-select', function (event) {
      for (let i = 0; i < event.target.children.length; i++) {

        if (event.target.children[i].dataset.element === 'from') {
          event.target.children[i].textContent = event.detail.from;
        }

        if (event.target.children[i].dataset.element === 'to') {
          event.target.children[i].textContent = event.detail.to;
        }
      }

    });
  }

  _getTemplate(from = this.min, to = this.max) {
    return `<div class="range-slider">
      <span data-element="from">${this.formatValue(from)}</span>
      <div class="range-slider__inner">
        <span class="range-slider__progress"></span>
        <span class="range-slider__thumb-left"></span>
        <span class="range-slider__thumb-right"></span>
      </div>
      <span data-element="to">${this.formatValue(to)}</span>
    </div>`;
  }

  render() {
    this.element.innerHTML = this._getTemplate(this.from, this.to);
    this.element = this.element.firstChild;

    this.identifyThumbs(this.element);
    this.addEventListenersToThumb();

    return this.element;
  }

  identifyThumbs(elem) {
    this.thumbLeftElem = elem.getElementsByClassName('range-slider__thumb-left')[0];
    this.thumbRightElem = elem.getElementsByClassName('range-slider__thumb-right')[0];
  }

  addEventListenersToThumb() {
    this.thumbLeftElem.addEventListener('pointerdown', this.startRange.bind(this));
    this.thumbRightElem.addEventListener('pointerdown', this.startRange.bind(this));
  }

  startRange(event) {

    this.isLeft = event.target === this.thumbLeftElem;
    this.isDown = true;
    if (this.isLeft) {
      this.shiftX = event.clientX - this.thumbLeftElem.getBoundingClientRect().left;
      this.thumbLeftElem.setPointerCapture(event.pointerId);
    } else {
      this.shiftX = event.clientX - this.thumbRightElem.getBoundingClientRect().right;
      this.thumbRightElem.setPointerCapture(event.pointerId);
    }

    this.progressDivElem = this.element.getElementsByClassName('range-slider__inner')[0];
    this.progressLine = this.element.getElementsByClassName('range-slider__progress')[0];

    this.sliderCoords = this.progressDivElem.getBoundingClientRect();
    this.progressCoords = this.progressLine.getBoundingClientRect();

    this.element.addEventListener('pointermove', this.changeRange.bind(this));
    this.element.addEventListener('pointerup', this.endRange.bind(this));
  }

  changeRange(event) {
    if (!this.isDown) {
      return;
    }

    if (this.isLeft) {
      this.newEdgeLeft = event.clientX - this.sliderCoords.left - this.shiftX;

      if (this.newEdgeLeft < 0) {
        this.newEdgeLeft = 0;
      }

      const right = parseFloat(this.progressCoords.right);

      if (this.newEdgeLeft + this.sliderCoords.left > right) {
        this.newEdgeLeft = right - this.sliderCoords.left;
      }

      this.thumbLeftElem.style.left = this.newEdgeLeft + 'px';
      this.progressLine.style.left = this.newEdgeLeft + 'px';

    } else {
      this.newEdgeRight = this.sliderCoords.right - event.clientX - this.shiftX;

      console.log(this.newEdgeRight);

      if (this.newEdgeRight < 0) {
        this.newEdgeRight = 0;
      }

      const left = parseFloat(this.progressCoords.left);

      if (this.sliderCoords.right - this.newEdgeRight < left) {
        this.newEdgeRight = left;
      }

      this.thumbRightElem.style.right = this.newEdgeRight + 'px';
      this.progressLine.style.right = this.newEdgeRight + 'px';

    }

  }

  _getPixelPerValue() {
    this.pixelPerValue = this.max / this.progressDivElem.offsetWidth;
    this.from = Math.round(Number(this.newEdgeLeft) * this.pixelPerValue);
    this.to = Math.round(this.max - Number(this.newEdgeRight) * this.pixelPerValue);

    if (isNaN(this.from)) {
      this.from = this.min;
    }

    if (isNaN(this.to)) {
      this.to = this.max;
    }
  }

  endRange(event) {
    this.isDown = false;
    this._getPixelPerValue();

    this.customEvent = new CustomEvent('range-select', {
      bubbles: true,
      detail: {from: this.from, to: this.to}
    });
    this.element.dispatchEvent(this.customEvent);

    document.removeEventListener('pointermove', this.changeRange.bind(this));
    document.removeEventListener('pointerup', this.endRange.bind(this));
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}
