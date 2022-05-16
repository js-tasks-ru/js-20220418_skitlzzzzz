export default class DoubleSlider {
  element = document.createElement('div');
  thumbLeftElem = document.getElementsByClassName('range-slider__thumb-left');
  thumbRightElem = document.getElementsByClassName('range-slider__thumb-right');
  thumbWidth = 0;
  progressElem = document.getElementsByClassName('range-slider__progress');
  progressDivElem = document.getElementsByClassName('range-slider__inner');
  isDown = false;
  isLeft = false;
  thumbCoords;
  shiftX;
  shiftY;
  sliderCoords;
  pixelPerValue;
  from;
  to;
  static newEdgeLeft;
  static newEdgeRight;
  static edgeForRight;
  static edgeForLeft;
  static edge;

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
    this.element.ondragstart = function() {
      return false;
    };

    this.element.addEventListener('pointerdown', this.startRange.bind(this));

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
    return this.element;
  }

  startRange(event) {
    this.isDown = true;
    if (!event.target.closest('.range-slider__inner')) {
      return;
    }
    this.isLeft = event.target === this.thumbLeftElem[0];

    this.isLeft ?
      this.shiftX = event.clientX - this.thumbLeftElem[0].getBoundingClientRect().left
      : this.shiftX = event.clientX - this.thumbRightElem[0].getBoundingClientRect().left;

    this.isLeft ?
      this.thumbLeftElem[0].setPointerCapture(event.pointerId)
      : this.thumbRightElem[0].setPointerCapture(event.pointerId);

    this.startDrag(event.clientX, event.clientY);
  }


  startDrag(startClientX, startClientY) {

    this.thumbCoords = this.element.getBoundingClientRect();
    this.shiftX = startClientX - this.thumbCoords.left;
    this.shiftY = startClientY - this.thumbCoords.top;

    this.sliderCoords = this.progressDivElem[0].getBoundingClientRect();

    this.element.addEventListener('pointermove', this.changeRange.bind(this));
    this.element.addEventListener('pointerup', this.endRange.bind(this));

  }

  _getPixelPerValue() {
    this.pixelPerValue = this.max / this.progressDivElem[0].offsetWidth;
    this.from = Math.round(Number(DoubleSlider.newEdgeLeft) * this.pixelPerValue);
    this.to = Math.round(this.max - Number(DoubleSlider.newEdgeRight) * this.pixelPerValue);

    if (isNaN(this.from)) {
      this.from = this.min;
    }

    if (isNaN(this.to)) {
      this.to = this.max;
    }
  }

  _getEdge() {
    if (DoubleSlider.newEdgeRight === undefined) {
      DoubleSlider.edgeForLeft = DoubleSlider.edge;
    } else {
      DoubleSlider.edgeForLeft = this.thumbRightElem[0].getBoundingClientRect().right - this.thumbWidth;
    }

    if (DoubleSlider.newEdgeLeft === undefined) {
      DoubleSlider.edgeForRight = DoubleSlider.edge;
    } else {
      DoubleSlider.edgeForRight = DoubleSlider.edge - this.thumbLeftElem[0].getBoundingClientRect().right- this.thumbWidth;
    }
    console.log('DoubleSlider.edgeForRight ' + DoubleSlider.edgeForRight)
    console.log('this.thumbLeftElem[0].getBoundingClientRect().right ' + this.thumbLeftElem[0].getBoundingClientRect().right)
    console.log('DoubleSlider.edgeForLeft ' + DoubleSlider.edgeForLeft)
    console.log('this.thumbRightElem[0].getBoundingClientRect().right ' + this.thumbRightElem[0].getBoundingClientRect().right)

  }

  _checkLimits() {
    if (DoubleSlider.newEdgeRight < 0) {
      DoubleSlider.newEdgeRight = 0;
    }

    if (DoubleSlider.newEdgeRight > DoubleSlider.edgeForRight) {
      DoubleSlider.newEdgeRight = DoubleSlider.edgeForRight;
    }

    if (DoubleSlider.newEdgeLeft < 0) {
      DoubleSlider.newEdgeLeft = 0;
    }

    if (DoubleSlider.newEdgeLeft > DoubleSlider.edgeForLeft) {
      DoubleSlider.newEdgeLeft = DoubleSlider.edgeForLeft;
    }
  }

  _addStyle() {
    this.thumbLeftElem[0].style.left = DoubleSlider.newEdgeLeft + 'px';
    this.progressElem[0].style.left = DoubleSlider.newEdgeLeft + 'px';
    this.thumbRightElem[0].style.right = DoubleSlider.newEdgeRight + 'px';
    this.progressElem[0].style.right = DoubleSlider.newEdgeRight + 'px';
  }

  moveRange(clientX) {
    this.thumbWidth = this.thumbLeftElem[0].offsetWidth;
    this.isLeft ?
      DoubleSlider.newEdgeLeft = clientX - this.thumbWidth - this.sliderCoords.left
      : DoubleSlider.newEdgeRight = this.sliderCoords.right - clientX - this.thumbWidth;


    DoubleSlider.edge = this.progressDivElem[0].offsetWidth;
    this._checkLimits();
    this._getEdge();
    this._getPixelPerValue();
    this._addStyle();

    this.customEvent = new CustomEvent('range-select', {
      bubbles: true,
      detail: {from: this.from, to: this.to}
    });
    this.element.dispatchEvent(this.customEvent);
  }

  changeRange(event) {
    if (!this.isDown) {
      return;
    }

    this.element.addEventListener('pointerup', this.endRange.bind(this));
    this.moveRange(event.clientX);
  }

  endRange() {
    this.isDown = false;
    this.element.removeEventListener('pointermove', this.changeRange.bind(this));
    this.element.removeEventListener('pointerdown', this.startRange.bind(this));
    this.element.removeEventListener('pointerup', this.endRange.bind(this));
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}
