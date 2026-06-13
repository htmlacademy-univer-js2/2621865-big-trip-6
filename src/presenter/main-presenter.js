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

const SHAKE_ANIMATION_TIMEOUT = 600;
const UI_BLOCKER_LOWER_LIMIT = 500;
const UI_BLOCKER_UPPER_LIMIT = 700;

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
    this._uiBlocker = new UiBlocker({lowerLimit: UI_BLOCKER_LOWER_LIMIT, upperLimit: UI_BLOCKER_UPPER_LIMIT});
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
      dates = `${startDay} ${startMonth} — ${endDay} ${endMonth}`.toUpperCase();
    } else {
      dates = `${startDay} ${startMonth} — ${endDay} ${endMonth}`.toUpperCase();
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

  _handleModelChange = (updateType, data) => {
    if (updateType === UpdateType.INIT) {
      this._removeLoading();
      if (data && data.isError) {
        this._renderError();
      } else if (this.model.getPoints().length === 0) {
        if (this.eventsList) {
          this.eventsList.innerHTML = '';
        }
        this._renderNoPoints();
      } else {
        this._renderTripInfo();
        this._renderPoints();
      }
    }
    if (updateType === UpdateType.PATCH || updateType === UpdateType.MAJOR) {
      this._renderTripInfo();
      this._renderPoints();
    }
  };

  _renderError() {
    this.noPointsComponent = new NoPointsView('error');
    render(this.noPointsComponent, this.eventsList);
  }

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
    const sortInputs = document.querySelectorAll('.trip-sort__input');
    sortInputs.forEach((input) => {
      input.checked = false;
      if (input.dataset.sortType === 'day' || input.id === 'sort-day') {
        input.checked = true;
      }
    });

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
      if (this.eventsList) {
        this.eventsList.innerHTML = '';
      }
      this._renderNoPoints();
      return;
    }

    if (this.noPointsComponent) {
      remove(this.noPointsComponent);
      this.noPointsComponent = null;
    }

    this.eventsList.innerHTML = '';
    points.forEach((point) => this._renderPoint(point));
  }

  _renderNoPoints() {
    if (this.noPointsComponent) {
      remove(this.noPointsComponent);
      this.noPointsComponent = null;
    }
    this.eventsList.innerHTML = '';
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
          this.model.getDestinations(),
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
                offersIds: editForm._state.selectedOffersIds,
                destinationId: editForm._state.destinationId
              };
              const result = await this._handlePointChange(updatedPoint);
              if (!result || !result.success) {
                editForm.shake();
                return;
              }
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
        if (editForm && editForm.element) {
          render(editForm, this.eventsList);
          editForm._restoreHandlers();
        }
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
    const newEventBtn = document.querySelector('.trip-main__event-add-btn');
      if (newEventBtn) newEventBtn.disabled = false;
  }

  _closeAllForms() {
    if (!this.eventsList) {
      return;
    }

    const openForms = this.eventsList.querySelectorAll('.event--edit');
    openForms.forEach((form) => {
      if (form && form.parentNode) {
        form.remove();
      }
    });
    const newEventBtn = document.querySelector('.trip-main__event-add-btn');
      if (newEventBtn) newEventBtn.disabled = false;
  }

  _handleNewEventClick = () => {
    if (this.eventsList && this.eventsList.querySelector('.event--edit')) {
      return;
    }

    this.filterModel.setFilter('FILTER_CHANGE', FilterType.EVERYTHING);
    this.currentSort = SortType.DAY;

    const sortInputs = document.querySelectorAll('.trip-sort__input');
    sortInputs.forEach((input) => {
      input.checked = false;
      if (input.dataset.sortType === 'day') {
        input.checked = true;
      }
    });

    this._closeAllForms();
    this._renderAddForm();
  };

  _renderAddForm() {
    if (this.noPointsComponent) {
      remove(this.noPointsComponent);
      this.noPointsComponent = null;
    }
    const newEventBtn = document.querySelector('.trip-main__event-add-btn');
    newEventBtn.disabled = true;

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
          const destination = this.model.getDestinationByName(addForm._state.destinationName);

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

          const result = await this.model.addPoint(newPoint);
          if (!result || !result.success) {
            addForm.shake();
            return;
          }
          this._renderPoints();
          if (addForm && addForm.element && addForm.element.parentNode) {
            addForm.element.remove();
          }
        } catch (err) {
          addForm.shake();
        } finally {
          saveBtn.textContent = originalText;
          this._uiBlocker.unblock();
          newEventBtn.disabled = false;
        }
      },
      () => {
        addForm.reset();
        if (addForm && addForm.element && addForm.element.parentNode) {
          addForm.element.remove();
        }
        newEventBtn.disabled = false;
        if (this.model.getPoints().length === 0) {
          this._renderNoPoints();
        }
      }
    );

    if (addForm && addForm.element) {
      this.eventsList.insertAdjacentElement('afterbegin', addForm.element);
      addForm.setEventListeners();
      addForm._restoreHandlers();
    }
  }

  async _handlePointChange(updatedPoint) {
    try {
      const result = await this.model.updatePoint(updatedPoint);
      return result;
    } catch (err) {
      const pointElement = document.querySelector(`.event[data-id="${updatedPoint.id}"]`);
      if (pointElement) {
        pointElement.classList.add('shake');
        setTimeout(() => pointElement.classList.remove('shake'), SHAKE_ANIMATION_TIMEOUT);
      }
      return { success: false };
    }
  }
}
