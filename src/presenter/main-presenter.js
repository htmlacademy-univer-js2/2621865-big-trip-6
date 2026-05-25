import {render, remove} from '../framework/render.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import AddFormView from '../view/add-form-view.js';
import EventView from '../view/event-view.js';
import NoPointsView from '../view/no-points-view.js';
import LoadingView from '../view/loading-view.js';
import {FilterType, SortType, UpdateType} from '../const.js';

export default class MainPresenter {
  constructor(eventsContainer, filterModel) {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = eventsContainer;
    this.filterModel = filterModel;
    this.model = null;
    this.noPointsComponent = null;
    this.currentFilter = FilterType.EVERYTHING;
    this.currentSort = SortType.DAY;
    this.sortComponent = null;
    this.eventsList = null;
    this.isAddFormOpen = false;
    this.loadingComponent = null;
  }

  setModel(model) {
    this.model = model;
    this.model.addObserver(this._handleModelChange.bind(this));
  }

  init() {
    this._renderSort();
    this._renderEventsList();
    this._renderLoading();

    this.filterModel.addObserver(this._handleFilterChange.bind(this));
    document.querySelector('.trip-main__event-add-btn').addEventListener('click', this._handleNewEventClick.bind(this));
  }

  _handleModelChange = (updateType) => {
    if (updateType === UpdateType.INIT) {
      this._removeLoading();
      this._renderPoints();
    }
    if (updateType === UpdateType.PATCH) {
      this._renderPoints();
    }
  };

  _renderLoading() {
    this.loadingComponent = new LoadingView();
    render(this.loadingComponent, this.eventsContainer);
  }

  _removeLoading() {
    if (this.loadingComponent) {
      remove(this.loadingComponent);
      this.loadingComponent = null;
    }
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

  _handleFilterChange = () => {
    this.currentFilter = this.filterModel.getFilter();
    this.currentSort = SortType.DAY;
    this._closeAllForms();
    this._renderPoints();
  };

  _handleSortChange = (evt) => {
    const newSort = evt.target.dataset.sortType;
    if (newSort === this.currentSort) {
      return;
    }
    this.currentSort = newSort;
    this._closeAllForms();
    this._renderPoints();
  };

  _getFilteredAndSortedPoints() {
    if (!this.model) {
      return [];
    }

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
      default:
        points.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
    }

    return points;
  }

  _renderPoints() {
    if (!this.model) {
      return;
    }

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
      const updatedPoint = {...point, isFavorite: !point.isFavorite};
      this._handlePointChange(updatedPoint);
    });

    render(eventComponent, this.eventsList);
    eventComponent.setEventListeners();
  }

  _showFormForPoint(targetPoint) {
    this._closeAllForms();

    const points = this._getFilteredAndSortedPoints();

    this.eventsList.innerHTML = '';

    points.forEach((point) => {
      const destination = this.model.getDestinationById(point.destinationId);
      const pointOffers = this.model.getOffersByType(point.type)
        .filter((offer) => point.offersIds.includes(offer.id));

      if (point.id === targetPoint.id) {
        const editForm = new EditFormView(point, destination, pointOffers,
          (evt) => {
            evt.preventDefault();
            const updatedPoint = {
              ...point,
              type: editForm._state.type,
              basePrice: editForm._state.basePrice,
              dateFrom: editForm._state.dateFrom,
              dateTo: editForm._state.dateTo,
              isFavorite: editForm._state.isFavorite,
              offersIds: editForm._state.selectedOffersIds
            };
            this._handlePointChange(updatedPoint);
          },
          () => {
            this._renderPoints();
          },
          () => {
            this.deletePoint(point.id);
          }
        );
        render(editForm, this.eventsList);
        editForm.setEventListeners();
        editForm._restoreHandlers();
      } else {
        const eventComponent = new EventView(point, destination, pointOffers, () => {
          this._showFormForPoint(point);
        }, () => {
          const updatedPoint = {...point, isFavorite: !point.isFavorite};
          this._handlePointChange(updatedPoint);
        });
        render(eventComponent, this.eventsList);
        eventComponent.setEventListeners();
      }
    });
  }

  _closeAllForms() {
    if (this.eventsList) {
      const openForms = this.eventsList.querySelectorAll('.event--edit');
      openForms.forEach((form) => form.remove());
    }
  }

  _handleNewEventClick = () => {
    if (this.eventsList.querySelector('.event--edit')) {
      return;
    }

    this.filterModel.setFilter('FILTER_CHANGE', FilterType.EVERYTHING);
    this.currentSort = SortType.DAY;
    this._closeAllForms();
    this._renderAddForm();
  };

  _renderAddForm() {
    const addForm = new AddFormView(
      this.model.getDestinations(),
      this.model.getOffers(),
      async (evt) => {
        evt.preventDefault();
        const destination = this.model.getDestinations().find(
          (dest) => dest.name === addForm._state.destinationName
        );

        if (!destination) {
          return;
        }

        const newPoint = {
          id: Date.now().toString(),
          type: addForm._state.type,
          basePrice: addForm._state.basePrice,
          dateFrom: addForm._state.dateFrom,
          dateTo: addForm._state.dateTo,
          isFavorite: false,
          destinationId: destination.id,
          offersIds: addForm._state.selectedOffersIds
        };

        this.model.addPoint(newPoint);
        this._renderPoints();
      },
      () => {
        this._renderPoints();
      }
    );

    this.eventsList.insertAdjacentElement('afterbegin', addForm.element);
    addForm.setEventListeners();
    addForm._restoreHandlers();
  }

  async _handlePointChange(updatedPoint) {
    try {
      await this.model.updatePoint(updatedPoint);
    } catch (err) {
      this._renderPoints();
    }
  }

  deletePoint(pointId) {
    this.model.deletePoint(pointId);
    this._renderPoints();
  }
}
