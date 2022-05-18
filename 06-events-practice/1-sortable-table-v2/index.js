export default class SortableTable {
  element;
  templateColumn;
  subElements = {};
  link;
  sortedData = {};
  divTable = document.createElement('div');
  divTableChild = document.createElement('div');
  divHeader = document.createElement('div');
  error = 'No required param';
  errorSort = 'This type of data cant be sorted';
  previousOrderColumn;
  previousColumn;
  theadElements;
  orderColumn = '';
  arrow = '';
  selectedColumn;


  constructor(headerConfig = [], {
    data = [],
    sorted = {}
  } = {}) {

    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.data = data;
    this.isSortLocally = true;

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
    this.subElements.header.addEventListener('pointerdown', this._getTypeSorting.bind(this));
  }

  _getTypeSorting(event) {
    this.sort = this.isSortLocally ? this.sortOnClient(event) : this.sortOnServer();

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

  _getTableBodyTemplate() {
    this.divTableChild.innerHTML = `
      <div data-element="body" class="sortable-table__body">
           ${this.data
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

    this.divTableChild = this.divTableChild.firstElementChild;
    return this.divTableChild;
  }

  _addArrow(){
    this.arrow = `<span data-element="arrow" class="sortable-table__sort-arrow">
                             <span class="sort-arrow"></span>
                          </span>`;
    if(this.previousColumn !== undefined){
      this.subElements.header.querySelector(`span.sortable-table__sort-arrow[data-element = 'arrow']`).remove();
    }
    this.selectedColumn = this.subElements.header.querySelector(`div.sortable-table__cell[data-id=${this.sorted.id}]`)
    this.selectedColumn.dataset.order = this.orderColumn;
    this.selectedColumn.insertAdjacentHTML('beforeend', this.arrow);
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

    this._getSortedData(fieldValue, orderValue);
    this.subElements.body = this._getTableBodyTemplate();
    this._addArrow();
  }


  render() {
    this._getSortedData(this.sorted.id, this.sorted.order);
    this._getSubelements();
    this._addArrow();
    this.previousOrderColumn = this.sorted.order;

    this.element = this._getTableWrapTemplate();
    this.element.append(this.subElements.header);
    this.element.append(this.subElements.body);
  }

  sortOnClient(event) {
    let target = event.target;

    if (event.target.nodeName === 'SPAN') {
      target = event.target.closest('div');
    }

    if (this.previousColumn !== target.dataset.id) {
      this.compareOrder();
    }

    if (target.dataset.sortable === 'true') {
      this.previousColumn = target.dataset.id;
      this.sorted.id = target.dataset.id;
      this.sorted.order = this.orderColumn;

      this.sortData(this.sorted.id, this.orderColumn);

    } else if (target.dataset.sortable === 'false') {
      throw new Error(this.errorSort);
    }

  }

  sortOnServer() {

  }

  destroy() {
    this.remove();
  }

  remove() {
    this.subElements.header.removeEventListener('pointerdown', this._getTypeSorting.bind(this));
    this.element.remove();
  }
}


// getChildTableWrapTemplate() {
//   this.divTableChild.innerHTML = `<div class="sortable-table"></div>`;
//   this.divTableChild = this.divTableChild.firstChild;
//   return this.divTableChild;
// }
//
// _getHeaderWrapTemplate() {
//   this.divHeader.innerHTML = `<div data-element="header" class="sortable-table__header sortable-table__row"></div>`;
//   this.divHeader = this.divHeader.firstChild;
//   return this.divHeader;
// }
//
// _getHeaderDataTemplate(data, sorting) {
//   this._getHeaderWrapTemplate();
//
//   while (this.divHeader.firstChild) {
//     this.divHeader.removeChild(this.divHeader.firstChild);
//   }
//
//   let arrowString = '';
//   let headerString = '';
//
//   data.forEach(item => {
//     let divHeaderData = document.createElement('div');
//     if (item.id === this.sorted.id) {
//       arrowString = `<span data-element="arrow" class ="sortable-table__sort-arrow">
//                         <span class ="sort-arrow"></span>
//                     </span>`;
//     } else {
//       arrowString = '';
//     }
//
//     headerString = `
//             <div class="sortable-table__cell"
//             data-id=${item.id}
//             data-sortable=${item.sortable}
//             data-order=${sorting}>
//                 <span>${item.title}</span>`
//       + arrowString + `</div>`;
//
//     divHeaderData.innerHTML = headerString;
//     divHeaderData = divHeaderData.firstElementChild;
//     this.divHeader.appendChild(divHeaderData);
//   });
//
//   return this.divHeader;
// }
//
// _getTableWrapTemplate() {
//   this.divRow.classList.add('sortable-table__body');
//   this.divRow.setAttribute('data-element', 'body');
//
//   return this.divRow;
// }
//
// _getTemplate (data, fieldsTitle) {
//   this._getTableWrapTemplate();
//
//   while (this.divRow.firstChild) {
//     this.divRow.removeChild(this.divRow.firstChild);
//   }
//
//   data.forEach((item) => {
//     let divRowLinkData = document.createElement('div');
//     divRowLinkData.innerHTML = `<a href="${this._getLink(item)}" class="sortable-table__row"></a>`;
//     divRowLinkData = divRowLinkData.firstElementChild;
//
//     fieldsTitle.forEach((itemHeader, indexHeader) => {
//       let divRowData = document.createElement('div');
//       divRowData.innerHTML = this.templateColumn(itemHeader, indexHeader);
//       divRowData = divRowData.firstElementChild;
//       divRowLinkData.appendChild(divRowData);
//     });
//     this.divRow.appendChild(divRowLinkData);
//   });
//
//   return this.divRow;
//}
