import {render} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';

export default class FilterPresenter {
  constructor(filterContainer, filterModel, pointsModel) {
    this.filterContainer = filterContainer;
    this.filterModel = filterModel;
    this.pointsModel = pointsModel;
    this.filterComponent = null;
  }

  init() {
    this._render();
    if (this.filterModel) {
      this.filterModel.addObserver(this._handleModelChange.bind(this));
    }
    if (this.pointsModel) {
      this.pointsModel.addObserver(this._handlePointsChange.bind(this));
    }
  }

  _handlePointsChange = () => {
    this._render();
  };

  _handleModelChange = () => {
    this._render();
  };

  _getFiltersDisabled() {
    if (!this.pointsModel) {
      return {
        everything: false,
        future: false,
        present: false,
        past: false
      };
    }

    const points = this.pointsModel.getPoints();

    const hasFuture = points.some((point) => new Date(point.dateFrom) > new Date());
    const hasPresent = points.some((point) => {
      const now = new Date();
      return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
    });
    const hasPast = points.some((point) => new Date(point.dateTo) < new Date());
    const hasEverything = points.length > 0;

    return {
      everything: !hasEverything,
      future: !hasFuture,
      present: !hasPresent,
      past: !hasPast
    };
  }

  _render() {
    if (!this.filterModel) {
      return;
    }

    const currentFilter = this.filterModel.getFilter();
    const filtersDisabled = this._getFiltersDisabled();

    if (this.filterComponent) {
      this.filterComponent.element.remove();
    }

    this.filterComponent = new FiltersView(currentFilter, this._handleFilterChange.bind(this), filtersDisabled);
    render(this.filterComponent, this.filterContainer);
    this.filterComponent.setEventListeners();
  }

  _handleFilterChange(filterType) {
    if (!this.filterModel) {
      return;
    }
    if (filterType === this.filterModel.getFilter()) {
      return;
    }
    this.filterModel.setFilter('FILTER_CHANGE', filterType);
  }
}
