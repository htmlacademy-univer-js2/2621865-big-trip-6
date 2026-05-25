import {render} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';

export default class FilterPresenter {
  constructor(filterContainer, filterModel) {
    this.filterContainer = filterContainer;
    this.filterModel = filterModel;
    this.filterComponent = null;
  }

  init() {
    const currentFilter = this.filterModel.getFilter();
    this.filterComponent = new FiltersView(currentFilter, this._handleFilterChange.bind(this));
    render(this.filterComponent, this.filterContainer);
    this.filterComponent.setEventListeners();
  }

  _handleFilterChange(filterType) {
    if (filterType === this.filterModel.getFilter()) {
      return;
    }
    this.filterModel.setFilter('FILTER_CHANGE', filterType);
  }
}
