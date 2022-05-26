import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element = document.createElement('div');
  chartHeight = 50;
  subElements = {};
  data = [];
  value = 0;
  isRendered = false;

  constructor({
                url = '',
                range = {},
                label = '',
                link = '',
                formatHeading = value => value,
              } = {}) {
    this.url = url;
    this.htmlTitle = label;
    this.range = range;
    this.link = link;
    this.formatHeading = formatHeading

    this.render();
  }

  _updateBody() {
    let isClassLoading = this.element.classList.contains('column-chart_loading');

    if (this._isData() && isClassLoading) {
      this.element.classList.remove('column-chart_loading');
    } else if (!this._isData() && !isClassLoading) {
      this.element.classList.add('column-chart_loading');
    }

    this.subElements.header.innerHTML = this._getHeader();
    this.subElements.body.innerHTML = this._getColumnChart();
  }

  _isData() {
    return this.data.length !== 0;
  }

  _getTemplate() {
    return `<div class="column-chart column-chart_loading" style=${this.chartHeight}>
      <div class="column-chart__title">
        Total ${this.htmlTitle}
        ${this._getLink()}
      </div>
      <div class="column-chart__container">
      <div data-element="header" class="column-chart__header">${this._getHeader()}</div>
        <div data-element="body" class="column-chart__chart">
          ${this._getColumnChart()}
        </div>
      </div>
    </div>`;
  }

  _getHeader() {

    if (this.data.length === 0) {
      return;
    }

    return this.formatHeading(this.value);
  }

  _getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  async _getDataFromServer() {

    let url = new URL(BACKEND_URL + '/' + this.url);

    if (isNaN(Date.parse(this.range.from)) || isNaN(Date.parse(this.range.to))) {
      this.data = [];
      this.value = 0;
      this.isRendered ? this._updateBody() : this.render();
      return;
    }

    this.range = Object.entries(this.range)
      .map(([key, value]) => [key, JSON.stringify(value).replace(/"/g, "")]);

    this.range = Object.fromEntries(this.range);
    url.search = new URLSearchParams(this.range);

    let response = await fetchJson(url);
    let result = response;

    this.data = Object.values(result);
    this.value = this.data.reduce((sum, current) => sum + current, 0);
    this._updateBody();

    return result;
  }

  _getColumnChart() {

    if (this.data.length === 0) {
      return;
    }

    let max = Math.max(...this.data);

    return this.data.map((item) => {
      let stylePercent = ((item / max) * 100).toFixed(0) + '%';
      let valueStyle = (Math.floor((this.chartHeight / max) * item));
      return `<div style="--value: ${valueStyle}" data-tooltip=${stylePercent}></div>`;

    }).join('');
  }

  render() {

    this.element.innerHTML = this._getTemplate();
    this.element = this.element.firstChild;

    if (this._isData()) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this._getFractions(this.element);
    this.isRendered = true;
  }

  _getFractions(element) {
    const elements = element.querySelectorAll('[data-element]');
    let elementsArray = [...elements];
    let fractionDiv = {};
    for (let i = 0; i < elementsArray.length; i++) {
      fractionDiv[elementsArray[i].dataset.element] = elementsArray[i];
    }
    return fractionDiv;
  }

  update(from = '', to = '') {
    this.range.from = from;
    this.range.to = to;
    let updating = this._getDataFromServer().then(result => {
      return result;
    });
    return updating;
  }

  destroy() {
    this.remove();
    this.fractions = {};
  }

  remove() {
    this.element.remove();
  }
}
