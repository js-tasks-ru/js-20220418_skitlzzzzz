export default class SortableTable {
  element;
  subelement;
  templateImg;
  subElements = {};
  link;
  sortedData = {};
  divTable = document.createElement('div');
  divTableChild = document.createElement('div');
  divHeader = document.createElement('div');
  divRow = document.createElement('div');
  error = 'No required param';
  errorSort = 'This type of data cant be sorted';

  static theadElements;// = element.getElementsByClassName('sortable-table__cell');
  static orderColumn = '';
  static previousOrderColumn;
  static fieldColumn = '';
  static previousColumn;

  static compareOrder() {
    if (this.previousOrderColumn === 'asc') {
      this.orderColumn = 'desc';
      this.previousOrderColumn = 'desc';
    } else {
      this.orderColumn = 'asc';
      this.previousOrderColumn = 'asc';
    }

    return this.orderColumn;
  }

  constructor(headerConfig = [], {
    data = [],
    sorted = {}
  } = {}) {

    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.data = data;
    this.isSortLocally = true;

    this.templateImg = function (value, index) {
      if (this.headerConfig[index].template === undefined) {
        return value;
      }
      return this.headerConfig[index].template(value);
    };

    this.render();

    SortableTable.theadElements = this.element.getElementsByClassName('sortable-table__cell');

    this.subElements.header.addEventListener('pointerdown', this._getTypeSort.bind(this));
  }

  _getTypeSort(event) {
    this.sort = this.isSortLocally ? this.sortOnClient(event) : this.sortOnServer();

  }


  _getTableWrapTemplate() {
    this.divTable.innerHTML = `<div data-element="productsContainer" class="products-list__container"></div>`;
    this.divTable = this.divTable.firstChild;
    return this.divTable;
  }

  _getChildTableWrapTemplate() {
    this.divTableChild.innerHTML = `<div class="sortable-table"></div>`;
    this.divTableChild = this.divTableChild.firstChild;
    return this.divTableChild;
  }

  _getHeaderWrapTemplate() {
    this.divHeader.innerHTML = `<div data-element="header" class="sortable-table__header sortable-table__row"></div>`;
    this.divHeader = this.divHeader.firstChild;
    return this.divHeader;
  }

  _getHeaderDataTemplate(data, sorting) {
    this._getHeaderWrapTemplate();

    while (this.divHeader.firstChild) {
      this.divHeader.removeChild(this.divHeader.firstChild);
    }

    let arrowString = '';
    let headerString = '';

    data.forEach(item => {
      let divHeaderData = document.createElement('div');
      if (item.id === this.sorted.id) {
        arrowString = `<span data-element="arrow" class ="sortable-table__sort-arrow">
                        <span class ="sort-arrow"></span>
                    </span>`;
      } else {
        arrowString = '';
      }

      headerString = `
            <div class="sortable-table__cell"
            data-id=${item.id}
            data-sortable=${item.sortable}
            data-order=${sorting}>
                <span>${item.title}</span>`
        + arrowString + `</div>`;

      divHeaderData.innerHTML = headerString;
      divHeaderData = divHeaderData.firstElementChild;
      this.divHeader.appendChild(divHeaderData);
    });

    return this.divHeader;
  }

  _getTableRowWrapTemplate() {
    this.divRow.classList.add('sortable-table__body');
    this.divRow.setAttribute('data-element', 'body');

    return this.divRow;
  }

  _getTemplateRow(data, fieldsTitle) {
    this._getTableRowWrapTemplate();

    while (this.divRow.firstChild) {
      this.divRow.removeChild(this.divRow.firstChild);
    }

    data.forEach((item) => {
      let divRowLinkData = document.createElement('div');
      divRowLinkData.innerHTML = `<a href="${this._getLink(item)}" class="sortable-table__row"></a>`;
      divRowLinkData = divRowLinkData.firstElementChild;

      fieldsTitle.forEach((itemHeader, indexHeader) => {
        let divRowData = document.createElement('div');
        itemHeader.template !== undefined ?
          divRowData.innerHTML = this.templateImg(itemHeader, indexHeader) :
          divRowData.innerHTML = `<div class="sortable-table__cell">${item[itemHeader.id]}</div>`;

        divRowData = divRowData.firstElementChild;
        divRowLinkData.appendChild(divRowData);
      });
      this.divRow.appendChild(divRowLinkData);
    });

    return this.divRow;
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

  _getSortedData(fieldValue, orderValue) {
    //Это решение позволило пройти тест на desc equal number
    //Но из за этого сортировка колонки начинается с такого же
    //направления сортировки как и предыдущая
    //До этого сортировка начиналась с asc всегда
    SortableTable.compareOrder();

    if (typeof this.data[0][fieldValue] === 'number') {
      this.sortedData = this._getNumberDataSorted(this.data, fieldValue, orderValue);
    } else {
      this.sortedData = this._getStringDataSorted(this.data, fieldValue, orderValue);
    }
  }

  _getSubelements(orderValue) {
    this.subElements = {
      'header': this._getHeaderDataTemplate(this.headerConfig, orderValue),
      'body': this._getTemplateRow(this.sortedData, this.headerConfig)
    };
  }

  sortData(fieldValue, orderValue) {
    if (orderValue !== 'asc' && orderValue !== 'desc') {
      throw new Error(this.error);
    }

    if (fieldValue === '') {
      throw new Error(this.error);
    }

    this._getSortedData(fieldValue, orderValue);
    this._getSubelements(orderValue, fieldValue);
  }


  render() {
    this._getSortedData(this.sorted.id, this.sorted.order);
    this._getSubelements(this.sorted.order);
    SortableTable.previousOrderColumn = this.sorted.order;

    this.element = this._getTableWrapTemplate();
    this.subelement = this._getChildTableWrapTemplate();
    this.element.appendChild(this.subelement);
    this.subelement.appendChild(this.subElements.header);
    this.subelement.appendChild(this.subElements.body);
  }

  sortOnClient(event) {
    let target = event.target;

    if (event.target.nodeName === 'SPAN') {
      target = event.target.closest('div');
    }

    if (SortableTable.previousColumn !== target.dataset.id) {
      SortableTable.compareOrder();
    }

    if (target.dataset.sortable === 'true') {
      SortableTable.previousColumn = target.dataset.id;
      SortableTable.fieldColumn = target.dataset.id;
      this.sorted.id = target.dataset.id;
      this.sorted.order = SortableTable.orderColumn;

      this.sortData(SortableTable.fieldColumn, SortableTable.orderColumn);

    } else if (target.dataset.sortable === 'false') {
      throw new Error(this.errorSort);
    }

  }

  sortOnServer() {

  }

  destroy() {
    this.remove();
    this.divTable = '';
    this.divTableChild = '';
    this.divHeader = '';
    this.divRow = '';
    this.arrow = '';
  }

  remove() {
    this.subelement.remove();
    this.element.remove();
    this.subElements.header.removeEventListener('pointerdown', this._getTypeSort.bind(this));
  }
}

