export default class SortableTable {
  element;
  subelement;
  subElements = {};
  sortField = 'title';
  sortDirection = '';
  divTable = document.createElement('div');
  divTableChild = document.createElement('div');
  divHeader = document.createElement('div');
  divRow = document.createElement('div');
  link;
  sortedData;
  error = 'No required param';
  errorSort = 'This type of data cant be sorted';

  constructor(headerConfig = [],
              data = [],
  ) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.templateImg = function (value, index) {
      if (this.headerConfig[index].template === undefined) {
        return value;
      }
      return this.headerConfig[index].template(value);
    };

    this.render(this.sortField, this.sortDirection);
  }

  _getTableWrapTemplate() {
    this.divTable.classList.add('products-list__container');
    this.divTable.setAttribute('data-element', 'productsContainer');

    return this.divTable;
  }

  _getChildTableWrapTemplate() {
    this.divTableChild.classList.add('sortable-table');

    return this.divTableChild;
  }

  _getHeaderWrapTemplate() {
    this.divHeader.classList.add('sortable-table__header', 'sortable-table__row');
    this.divHeader.setAttribute('data-element', 'header');

    return this.divHeader;
  }

  _getHeaderDataTemplate(data, sorting) {
    this._getHeaderWrapTemplate();

    while (this.divHeader.firstChild) {
      this.divHeader.removeChild(this.divHeader.firstChild);
    }

    data.forEach(item => {
      let divHeaderData = document.createElement('div');
      divHeaderData.innerHTML = `
            <div class="sortable-table__cell"
            data-id=${item.title}
            data-sortable=${item.sortable}
            data-order=${sorting}>
                <span>${item.title}</span>
            </div>`;
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

  _randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
    //Хотя это тоже дает сортировку по умолчанию по title
    if (typeof this.data[0][fieldValue] === 'string') {
      this.sortedData = this._getStringDataSorted(this.data, fieldValue, orderValue);
    } else if (typeof this.data[0][fieldValue] === 'number') {
      this.sortedData = this._getNumberDataSorted(this.data, fieldValue, orderValue);
    } else {
      throw new Error(this.errorSort);
    }
  }

  sort(fieldValue, orderValue) {
    if (orderValue !== 'asc' && orderValue !== 'desc') {
      throw new Error(this.error);
    }

    if (fieldValue === '') {
      throw new Error(this.error);
    }
    this._getSortedData(fieldValue, orderValue);
    this.subElements.header = this._getHeaderDataTemplate(this.headerConfig, orderValue);
    this.subElements.body = this._getTemplateRow(this.sortedData, this.headerConfig);
  }



  render(fieldValue, orderValue) {

    this._getSortedData(fieldValue, orderValue);


    this.element = this._getTableWrapTemplate();
    this.subelement = this._getChildTableWrapTemplate();
    this.element.appendChild(this.subelement);
    // this.subelement.appendChild(this._getHeaderDataTemplate(this.headerConfig, orderValue));
    // this.subelement.appendChild(this._getTemplateRow(this.sortedData, this.headerConfig));

    //В данном случае это сделано для теста, но понимаю, что это можно как то использовать
    //Но как?
    this.subElements = {'header': this._getHeaderDataTemplate(this.headerConfig, orderValue),
      'body': this._getTemplateRow(this.sortedData, this.headerConfig)};
    this.subelement.appendChild(this.subElements.header);
    this.subelement.appendChild(this.subElements.body);

  }

  destroy() {
    this.remove();
    this.divTable = '';
    this.divTableChild = '';
    this.divHeader = '';
    this.divRow = '';
  }

  remove() {
    this.subelement.remove();
    this.element.remove();
  }
}
