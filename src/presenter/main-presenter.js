import {render, remove} from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import AddFormView from '../view/add-form-view.js';
import EventView from '../view/event-view.js';
import NoPointsView from '../view/no-points-view.js';
import LoadingView from '../view/loading-view.js';
import {FilterType, SortType, UpdateType} from '../const.js';
import TripInfoView from '../view/trip-info-view.js';

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
    this._uiBlocker = new UiBlocker({lowerLimit: 500, upperLimit: 700});
    this.tripInfoComponent = null;
  }

  setModel(model) {
    this.model = model;
    this.model.addObserver(this._handleModelChange.bind(this));
  }

  init() {
    this._renderTripInfo();
    this._renderSort();
    this._renderEventsList();
    this._renderLoading();

    this.filterModel.addObserver(this._handleFilterChange.bind(this));
    document.querySelector('.trip-main__event-add-btn').addEventListener('click', this._handleNewEventClick.bind(this));
  }

  _renderTripInfo() {
    const points = this.model.getPoints();

    const uniqueDestinations = [...new Set(points.map((point) => {
      const destination = this.model.getDestinationById(point.destinationId);
      return destination ? destination.name : '';
    }).filter(Boolean))];

    let route = '';
    if (uniqueDestinations.length === 0) {
      route = '';
    } else if (uniqueDestinations.length <= 3) {
      route = uniqueDestinations.join(' &mdash; ');
    } else {
      route = `${uniqueDestinations[0]} &mdash; ... &mdash; ${uniqueDestinations[uniqueDestinations.length - 1]}`;
    }

    if (points.length === 0) {
      const tripInfoElement = document.querySelector('.trip-info');
      if (tripInfoElement) {
        tripInfoElement.remove();
      }
      return;
    }
    const sortedPoints = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    const startDate = new Date(sortedPoints[0].dateFrom);
    const endDate = new Date(sortedPoints[sortedPoints.length - 1].dateTo);

    const formatMonth = (date) => date.toLocaleString('en', {month: 'short'}).toUpperCase();
    const formatDay = (date) => date.getDate();

    const startMonth = formatMonth(startDate);
    const startDay = formatDay(startDate);
    const endMonth = formatMonth(endDate);
    const endDay = formatDay(endDate);

    let dates = '';
    if (startMonth === endMonth) {
      dates = `${startMonth} ${startDay}&nbsp;&mdash;&nbsp;${endDay}`;
    } else {
      dates = `${startMonth} ${startDay}&nbsp;&mdash;&nbsp;${endMonth} ${endDay}`;
    }

    let totalCost = 0;
    points.forEach((point) => {
      totalCost += point.basePrice;
      point.offersIds.forEach((offerId) => {
        const offer = this.model.getOfferById(point.type, offerId);
        if (offer) {
          totalCost += offer.price;
        }
      });
    });
    const tripInfoContainer = document.querySelector('.trip-main');
    const oldTripInfo = tripInfoContainer.querySelector('.trip-info');

    this.tripInfoComponent = new TripInfoView(route, dates, totalCost);

    if (oldTripInfo) {
      oldTripInfo.remove();
    }

    tripInfoContainer.insertBefore(this.tripInfoComponent.element, tripInfoContainer.firstChild);
  }

  _handleModelChange = (updateType) => {
    if (updateType === UpdateType.INIT) {
      this._removeLoading();
      this._renderTripInfo();
      this._renderPoints();
    }
    if (updateType === UpdateType.PATCH || updateType === UpdateType.MAJOR) {
      this._renderTripInfo();
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
    }, async () => {
      const updatedPoint = {...point, isFavorite: !point.isFavorite};
      await this._handlePointChange(updatedPoint);
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
        const editForm = new EditFormView(
          point,
          destination,
          this.model.getOffers(),
          async (evt) => {
            evt.preventDefault();

            this._uiBlocker.block();
            const saveBtn = editForm.element.querySelector('.event__save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';

            try {
              const updatedPoint = {
                ...point,
                type: editForm._state.type,
                basePrice: editForm._state.basePrice,
                dateFrom: editForm._state.dateFrom,
                dateTo: editForm._state.dateTo,
                isFavorite: editForm._state.isFavorite,
                offersIds: editForm._state.selectedOffersIds
              };
              await this._handlePointChange(updatedPoint);
              this._renderPoints();
            } catch (err) {
              editForm.shake();
            } finally {
              saveBtn.textContent = originalText;
              this._uiBlocker.unblock();
            }
          },
          () => {
            this._renderPoints();
          },
          async () => {
            this._uiBlocker.block();
            const deleteBtn = editForm.element.querySelector('.event__reset-btn');
            const originalText = deleteBtn.textContent;
            deleteBtn.textContent = 'Deleting...';

            try {
              await this.model.deletePoint(point.id);
              this._renderPoints();
            } catch (err) {
              editForm.shake();
            } finally {
              deleteBtn.textContent = originalText;
              this._uiBlocker.unblock();
            }
          }
        );
        render(editForm, this.eventsList);
        editForm.setEventListeners();
        editForm._restoreHandlers();
      } else {
        const eventComponent = new EventView(point, destination, pointOffers, () => {
          this._showFormForPoint(point);
        }, async () => {
          const updatedPoint = {...point, isFavorite: !point.isFavorite};
          await this._handlePointChange(updatedPoint);
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
        this._uiBlocker.block();
        const saveBtn = addForm.element.querySelector('.event__save-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';

        try {
          const destination = this.model.getDestinations().find(
            (dest) => dest.name === addForm._state.destinationName
          );

          if (!destination) {
            throw new Error('Выберите пункт назначения');
          }

          const newPoint = {
            type: addForm._state.type,
            basePrice: addForm._state.basePrice,
            dateFrom: addForm._state.dateFrom,
            dateTo: addForm._state.dateTo,
            isFavorite: false,
            destinationId: destination.id,
            offersIds: addForm._state.selectedOffersIds
          };

          const createdPoint = await this.model.addPoint(newPoint);
          if (createdPoint) {
            this._renderPoints();
            addForm.element.remove();
          }
        } catch (err) {
          addForm.shake();
        } finally {
          saveBtn.textContent = originalText;
          this._uiBlocker.unblock();
        }
      },
      () => {
        addForm.element.remove();
      }
    );

    this.eventsList.insertAdjacentElement('afterbegin', addForm.element);
    addForm.setEventListeners();
    addForm._restoreHandlers();
  }

  async _handlePointChange(updatedPoint) {
    await this.model.updatePoint(updatedPoint);
  }
}
