import {render, remove} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import NoPointsView from '../view/no-points-view.js';
import PointPresenter from './point-presenter.js';
import Model from '../model/model.js';
import {FilterType} from '../const.js';


export default class MainPresenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.model = new Model();
    this.pointPresenters = new Map();
    this.noPointsComponent = null;
    this.currentFilter = FilterType.EVERYTHING;
  }

  init() {
    render(new FiltersView(), this.filtersContainer);
    render(new SortView(), this.eventsContainer);

    this.eventsList = document.createElement('ul');
    this.eventsList.classList.add('trip-events__list');
    this.eventsContainer.appendChild(this.eventsList);

    this._renderPoints();
  }

  _getFilteredPoints() {
    const points = this.model.getPoints();

    switch (this.currentFilter) {
      case FilterType.FUTURE:
        return points.filter((point) => new Date(point.dateFrom) > new Date());
      case FilterType.PRESENT:
        return points.filter((point) => {
          const now = new Date();
          return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
        });
      case FilterType.PAST:
        return points.filter((point) => new Date(point.dateTo) < new Date());
      default:
        return points;
    }
  }

  _renderPoints() {
    const points = this._getFilteredPoints();

    if (points.length === 0) {
      this._renderNoPoints();
      return;
    }

    if (this.noPointsComponent) {
      remove(this.noPointsComponent);
      this.noPointsComponent = null;
    }

    points.forEach((point) => {
      this._renderPoint(point);
    });
  }

  _renderNoPoints() {
    this.noPointsComponent = new NoPointsView(this.currentFilter);
    render(this.noPointsComponent, this.eventsList);
  }

  _renderPoint(point) {
    const destination = this.model.getDestinationById(point.destinationId);
    const pointOffers = this.model.getOffersByType(point.type)
      .filter((offer) => point.offersIds.includes(offer.id));

    const pointPresenter = new PointPresenter(
      this.eventsList,
      this._handlePointChange.bind(this),
      this._handleModeChange.bind(this)
    );

    pointPresenter.init(point, destination, pointOffers);
    this.pointPresenters.set(point.id, pointPresenter);
  }

  _handlePointChange = (updatedPoint) => {
    const points = this.model.getPoints();
    const index = points.findIndex((point) => point.id === updatedPoint.id);
    points[index] = updatedPoint;
    this._renderPoints();
  };

  _handleModeChange = () => {
    this.pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
