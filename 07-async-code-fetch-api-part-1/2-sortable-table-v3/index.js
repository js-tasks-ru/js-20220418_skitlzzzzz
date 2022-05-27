import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  templateColumn;
  subElements = {};
  link;
  data;
  sortedData = {};
  divTable = document.createElement('div');
  divHeader = document.createElement('div');
  error = 'No required param';
  errorSort = 'This type of data cant be sorted';
  previousOrderColumn;
  previousColumn;
  theadElements;
  orderColumn = '';
  selectedColumn;
  sortInit = {id: 'title', order: 'asc'};
  page = 0;
  step = 30;
  pageEnd = this.page + this.step;
  isLoading = false;
  shouldLoad = true;
  promise;


  constructor(headerConfig = [], {
    url = '',
    sorted,
    isSortLocally = false,
  } = {}) {

    this.headerConfig = headerConfig;
    this.url = url;
    this.sorted = sorted ? sorted : this.sortInit;
    this.isSortLocally = isSortLocally;
    this.chooseSort = this._chooseTypeSorting.bind(this);
    this.scrollUpdate = this._checkPosition.bind(this);

    this.templateColumn = function (value, index, item) {
      if (this.headerConfig[index].template === undefined) {
        return `<div class="sortable-table__cell"> ${item[value[index].id]} </div>`;
      }
      return this.headerConfig[index].template(value);
    };

    this.compareOrder = () => {
      if (this.previousOrderColumn === 'asc') {
        this.orderColumn = 'desc';
        this.previousOrderColumn = 'desc';
      } else {
        this.orderColumn = 'asc';
        this.previousOrderColumn = 'asc';
      }

      return this.orderColumn;
    };

    this.render();
  }

  _chooseTypeSorting(event) {
    let target = event.target;

    target = event.target.closest('div');

    this.compareOrder();

    if (target.dataset.sortable === 'true') {
      this.previousColumn = target.dataset.id;
      this.sorted.id = target.dataset.id;
      this.sorted.order = this.orderColumn;
    } else if (target.dataset.sortable === 'false') {
      throw new Error(this.errorSort);
    }

    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    } else {
      this.sortOnServer(this.sorted.id, this.sorted.order);
    }

    this._addArrow();
  }

  async _checkPosition() {
    let bottomScroll = this.element.getBoundingClientRect().bottom;
    let documentHeight = document.documentElement.clientHeight;

    if (bottomScroll < documentHeight && !this.isLoading && this.shouldLoad && !this.isSortLocally) {
      this.isLoading = true;
      this.page = this.pageEnd;
      this.pageEnd = this.page + this.step;

      let data = await this.loadData(this.sorted.id, this.sorted.order, this.page, this.pageEnd);

      for (let i = 0; i < this._getTableBodyTemplate(data).children.length; i++) {
        this.subElements.body.append(this._getTableBodyTemplate(data).children[i]);
      }
      this.isLoading = false;
      if (data.length < this.step) {
        this.shouldLoad = false;
      }
    }

  }

  _getTableWrapTemplate() {
    this.divTable.innerHTML = `<div data-element="productsContainer" class="products-list__container"></div>`;
    this.divTable = this.divTable.firstChild;
    return this.divTable;
  }

  _getTableHeaderTemplate() {
    this.divHeader.innerHTML = `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(
      (item) => `
                    <div class="sortable-table__cell"
                     data-id=${item.id}
                     data-sortable=${item.sortable}
                     data-order=${this.orderColumn}>
                        <span>${item.title}</span>
                     </div>`
    ).join('')}
      </div>
      `;

    this.divHeader = this.divHeader.firstElementChild;
    return this.divHeader;
  }

  _getTableBodyTemplate(data = this.data) {
    let divTableChild = document.createElement('div');
    divTableChild.innerHTML = `
      <div data-element="body" class="sortable-table__body">
           ${data
      .map(
        (item) => `
                  <a href=${this._getLink(item)} class="sortable-table__row">
                      ${this.headerConfig.map(
          ({id, template},
           indexHeader,
           itemHeader) =>

            `${this.templateColumn(itemHeader, indexHeader, item)}`
        ).join('')}
                  </a>
          `
      )
      .join('')}
      </div>
      `;

    divTableChild = divTableChild.firstElementChild;
    return divTableChild;
  }

  _addArrow() {
    let divArrow = document.createElement('div');
    divArrow.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
                             <span class="sort-arrow"></span>
                          </span>`;
    if (this.previousColumn !== undefined) {
      this.subElements.header.querySelector(`span.sortable-table__sort-arrow[data-element = 'arrow']`).remove();
    }
    this.selectedColumn = this.subElements.header.querySelector(`div.sortable-table__cell[data-id=${this.sorted.id}]`)
    this.selectedColumn.dataset.order = this.orderColumn ? this.orderColumn : this.sorted.order;
    divArrow = divArrow.firstElementChild;
    this.selectedColumn.append(divArrow);
  }

  _getLink(item) {
    let product = item.id ? item.id : '#';

    if (item.subcategory === undefined || item.subcategory.category === undefined) {
      return this.link = product;
    }

    let category = item.subcategory.category.id ? item.subcategory.category.id + '/' : '';
    let subcategory = item.subcategory.id ? item.subcategory.id + '/' : '';

    this.link = category + subcategory + product;

    return this.link;
  }

  _getStringDataSorted(data, fieldToSort, sortDirection) {
    let collator = new Intl.Collator('ru-en', {sensitivity: 'case', caseFirst: 'upper'});

    if (sortDirection === 'desc') {
      data.sort(function (b, a) {
        return collator.compare(a[fieldToSort], b[fieldToSort]);
      });
    } else {
      data.sort(function (a, b) {
        return collator.compare(a[fieldToSort], b[fieldToSort]);
      });
    }

    return data;
  }

  _getNumberDataSorted(data, fieldToSort, sortDirection) {
    if (sortDirection === 'desc') {
      data.sort(function (b, a) {
        return Number(a[fieldToSort]) - Number(b[fieldToSort]);
      });
    } else {
      data.sort(function (a, b) {
        return Number(a[fieldToSort]) - Number(b[fieldToSort]);
      });
    }

    return data;
  }

  _sortingDataByType(fieldValue, orderValue) {
    this.compareOrder();

    if (typeof this.data[0][fieldValue] === 'number') {
      this.sortedData = this._getNumberDataSorted(this.data, fieldValue, orderValue);
    } else {
      this.sortedData = this._getStringDataSorted(this.data, fieldValue, orderValue);
    }
  }

  _getSubelements() {
    this.subElements = {
      'header': this._getTableHeaderTemplate(),
      'body': this._getTableBodyTemplate()
    };
  }

  sortData(fieldValue, orderValue) {
    if (orderValue !== 'asc' && orderValue !== 'desc') {
      throw new Error(this.error);
    }

    if (fieldValue === '') {
      throw new Error(this.error);
    }

    this._sortingDataByType(fieldValue, orderValue);
    this.subElements.body.innerHTML = this._getTableBodyTemplate().innerHTML;
    this._addArrow();
  }

  async loadData(fieldValue = this.sorted.id,
                 orderValue = this.sorted.order,
                 pageStart = 0,
                 pageEnd = pageStart + this.step) {
    let url = new URL(BACKEND_URL + '/' + this.url);

    let urlParams = {
      '_embed': 'subcategory.category',
      '_sort': fieldValue,
      '_order': orderValue,
      '_start': pageStart,
      '_end': pageEnd
    };

    url.search = new URLSearchParams(urlParams);
    let response = await fetchJson(url);
    let result = await response;

    return result;
  }


  async render() {
    this.element = this._getTableWrapTemplate();
    this.previousOrderColumn = this.sorted.order;


    this.data = await this.loadData();

    this._getSubelements();

    this.element.append(this.subElements.header);
    this.element.append(this.subElements.body);

    this._addArrow();
    this.addListeners();

  }

  addListeners() {
    this.subElements.header.addEventListener('pointerdown', this.chooseSort);
    window.addEventListener("scroll", this.scrollUpdate);
    // window.addEventListener("resize", this.checkPosition.bind(this));

  }

  sortOnClient(fieldValue, orderValue) {
    this.sortData(fieldValue, orderValue);
  }

  async sortOnServer(fieldValue, orderValue) {
    let loadedData = await this.loadData(fieldValue, orderValue, 0);

    this.subElements.body.innerHTML = this._getTableBodyTemplate(loadedData).innerHTML;
  }

  destroy() {
    this.remove();
  }

  remove() {
    document.removeEventListener('scroll', this.scrollUpdate);
    this.element.remove();
  }
}
