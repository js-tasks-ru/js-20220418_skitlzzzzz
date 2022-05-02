export default class ColumnChart {
  element;
  chartHeight = 50;
  fractions = {};

  constructor({
                data = [],
                label = '',
                value = 0,
                link = '',
                formatHeading = value=>value,
              } = {}) {
    this.data = data;
    this.htmlTitle = label;
    this.value = value;
    this.link = link;

    this.formatHeading = function (value) {
      return formatHeading(value);
    };

    this.render();
  }

  _getData() {
    return this.data.length !== 0;
  }

  _getTemplate() {
    return `<div class="column-chart column-chart_loading" style=${this.chartHeight}>
      <div class="column-chart__title">
        Total ${this.htmlTitle}
        ${this._getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this._getValue()}</div>
        <div data-element="body" class="column-chart__chart">
          ${this._getColumnChart(this.data)}
        </div>
      </div>
    </div>`;
  }

  _getValue() {
    return this.formatHeading(this.value);
  }

  _getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  _getColumnChart(data) {
    let max = Math.max(...data);

    return data.map((item) => {
      let stylePercent = ((item / max) * 100).toFixed(0) + '%';
      let valueStyle = (Math.floor((this.chartHeight / max) * item));
      return `<div style="--value: ${valueStyle}" data-tooltip=${stylePercent}></div>`;

    }).join('');
  }

  render() {
    let div = document.createElement('div');
    div.innerHTML = this._getTemplate();
    div = div.firstChild;

    if (this._getData()) {
      div.classList.remove('column-chart_loading');
    }

    this.element = (div);
    this.fractions = this._getFractions(this.element);
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

  update(newArray) {
    this.fractions.body.innerHTML = this._getColumnChart(newArray);
  }

  destroy() {
    this.remove();
    this.fractions = {};
  }

  remove() {
    this.element.remove();
  }
}

// Компонент должен отобразить переданные данные

// Если данные в компонент не переданы, необходимо отобразить «скелетон» –
// специальную картинку charts-skeleton.svg, которую вы видите выше слева.
//
// Компонент должен иметь метод update с помощью которого можно передать другой массив данных для отображения колонок
// чарта

// Подсказка: Высота колонок чарта имеет фиксированную высоту: «–chart-height: 50», для
// корректного отображения данных внутри чарта необходимо пропорционально изменить
// величины данных по отношению к высоте колонок.
//Типа 50 это 100% высоты,
