import {render, remove} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import EventView from '../view/event-view.js';
import NoPointsView from '../view/no-points-view.js';
import Model from '../model/model.js';
import {FilterType, SortType} from '../const.js';

export default class MainPresenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.model = new Model();
    this.noPointsComponent = null;
    this.currentFilter = FilterType.EVERYTHING;
    this.currentSort = SortType.DAY;
    this.sortComponent = null;
    this.eventsList = null;
  }

  init() {
    render(new FiltersView(), this.filtersContainer);
    this._renderSort();
    this._renderEventsList();
    this._renderPoints();
  }

  _renderSort() {
    this.sortComponent = new SortView(this._handleSortChange.bind(this));
    render(this.sortComponent, this.eventsContainer);
    this.sortComponent.setEventListeners();
  }

  _renderEventsList() {
    this.eventsList = document.createElement('ul');
    this.eventsList.classList.add('trip-events__list');
    this.eventsContainer.appendChild(this.eventsList);
  }

  _handleSortChange = (evt) => {
    const newSort = evt.target.dataset.sortType;
    if (newSort === this.currentSort) {
      return;
    }
    this.currentSort = newSort;
    this._renderPoints();
  };

  _getFilteredAndSortedPoints() {
    let points = [...this.model.getPoints()];

    switch (this.currentFilter) {
      case FilterType.FUTURE:
        points = points.filter((point) => new Date(point.dateFrom) > new Date());
        break;
      case FilterType.PRESENT:
        points = points.filter((point) => {
          const now = new Date();
          return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
        });
        break;
      case FilterType.PAST:
        points = points.filter((point) => new Date(point.dateTo) < new Date());
        break;
      default:
        break;
    }

    switch (this.currentSort) {
      case SortType.PRICE:
        points.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case SortType.TIME:
        points.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });
        break;
      default: // SortType.DAY
        points.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
    }

    return points;
  }

  _renderPoints() {
    const points = this._getFilteredAndSortedPoints();

    if (points.length === 0) {
      this._renderNoPoints();
      return;
    }

    if (this.noPointsComponent) {
      remove(this.noPointsComponent);
      this.noPointsComponent = null;
    }

    this.eventsList.innerHTML = '';

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

    const eventComponent = new EventView(point, destination, pointOffers, () => {
      this._showFormForPoint(point);
    }, () => {
      const points = this.model.getPoints();
      const index = points.findIndex((p) => p.id === point.id);
      points[index] = {...point, isFavorite: !point.isFavorite};
      this._renderPoints();
    });

    render(eventComponent, this.eventsList);
    eventComponent.setEventListeners();
  }

  _showFormForPoint(targetPoint) {
    const points = this._getFilteredAndSortedPoints();

    this.eventsList.innerHTML = '';

    points.forEach((point) => {
      const destination = this.model.getDestinationById(point.destinationId);
      const pointOffers = this.model.getOffersByType(point.type)
        .filter((offer) => point.offersIds.includes(offer.id));

      if (point.id === targetPoint.id) {
        const editForm = new EditFormView(point, destination, pointOffers, (evt) => {
          evt.preventDefault();
          this._renderPoints();
        }, () => {
          this._renderPoints();
        });
        render(editForm, this.eventsList);
        editForm.setEventListeners();
      } else {
        const eventComponent = new EventView(point, destination, pointOffers, () => {
          this._showFormForPoint(point);
        }, () => {
          const pointsArr = this.model.getPoints();
          const index = pointsArr.findIndex((p) => p.id === point.id);
          pointsArr[index] = {...point, isFavorite: !point.isFavorite};
          this._renderPoints();
        });
        render(eventComponent, this.eventsList);
        eventComponent.setEventListeners();
      }
    });
  }
}
