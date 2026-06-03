import {render, replace, remove} from '../framework/render.js';
import EventView from '../view/event-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  constructor(pointsContainer, changeData, changeMode, allOffers) {
    this.pointsContainer = pointsContainer;
    this.changeData = changeData;
    this.changeMode = changeMode;
    this.allOffers = allOffers;

    this.pointComponent = null;
    this.editFormComponent = null;

    this.point = null;
    this.destination = null;
    this.offers = null;

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  init(point, destination, offers) {
    this.point = point;
    this.destination = destination;
    this.offers = offers;

    const prevPointComponent = this.pointComponent;
    const prevEditFormComponent = this.editFormComponent;

    this.pointComponent = new EventView(
      point,
      destination,
      offers,
      this.handleEditClick,
      this.handleFavoriteClick
    );

    this.editFormComponent = new EditFormView(
      point,
      this.destinations || [],
      this.allOffers,
      this.handleFormSubmit,
      this.handleCloseClick,
      this.handleDeleteClick
    );

    if (prevPointComponent === null || prevEditFormComponent === null) {
      render(this.pointComponent, this.pointsContainer);
      this.pointComponent.setEventListeners();
      return;
    }

    if (prevEditFormComponent && prevEditFormComponent.element && this.pointsContainer.contains(prevEditFormComponent.element)) {
      replace(this.editFormComponent, prevEditFormComponent);
    }

    if (prevPointComponent && prevPointComponent.element && this.pointsContainer.contains(prevPointComponent.element)) {
      replace(this.pointComponent, prevPointComponent);
    }

    if (prevPointComponent) {
      remove(prevPointComponent);
    }
    if (prevEditFormComponent) {
      remove(prevEditFormComponent);
    }

    if (this.pointComponent) {
      this.pointComponent.setEventListeners();
    }
  }

  destroy() {
    if (this.pointComponent) {
      remove(this.pointComponent);
    }
    if (this.editFormComponent) {
      remove(this.editFormComponent);
    }

    document.removeEventListener('keydown', this._escKeyDownHandler);
  }

  resetView() {
    if (
      this.editFormComponent &&
      this.editFormComponent.element &&
      this.pointComponent &&
      this.pointComponent.element &&
      this.pointsContainer.contains(this.editFormComponent.element)
    ) {
      if (this.editFormComponent.reset) {
        this.editFormComponent.reset(this.point);
      }

      replace(this.pointComponent, this.editFormComponent);

      this.pointComponent.setEventListeners();

      document.removeEventListener('keydown', this._escKeyDownHandler);
    }
  }

  handleEditClick = () => {
    this.changeMode();

    if (this.editFormComponent && this.editFormComponent.element && this.pointComponent && this.pointComponent.element) {
      replace(this.editFormComponent, this.pointComponent);
    }

    if (this.editFormComponent) {
      this.editFormComponent._restoreHandlers();
    }

    document.addEventListener('keydown', this._escKeyDownHandler);
  };

  handleFavoriteClick = () => {
    this.changeData({
      ...this.point,
      isFavorite: !this.point.isFavorite
    });
  };

  handleFormSubmit = (evt) => {
    evt.preventDefault();

    if (!this.editFormComponent || !this.pointComponent) return;

    const updatedPoint = {
      ...this.point,
      type: this.editFormComponent._state.type,
      basePrice: this.editFormComponent._state.basePrice,
      dateFrom: this.editFormComponent._state.dateFrom,
      dateTo: this.editFormComponent._state.dateTo,
      isFavorite: this.editFormComponent._state.isFavorite,
      offersIds: this.editFormComponent._state.selectedOffersIds,
      destinationId: this.editFormComponent._state.destinationId
    };

    this.changeData(updatedPoint);

    if (this.editFormComponent.element && this.pointComponent.element) {
      replace(this.pointComponent, this.editFormComponent);
    }

    if (this.pointComponent) {
      this.pointComponent.setEventListeners();
    }

    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  handleCloseClick = () => {
    if (!this.editFormComponent || !this.pointComponent) return;

    if (this.editFormComponent.reset) {
      this.editFormComponent.reset(this.point);
    }

    if (this.editFormComponent.element && this.pointComponent.element) {
      replace(this.pointComponent, this.editFormComponent);
    }

    if (this.pointComponent) {
      this.pointComponent.setEventListeners();
    }

    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  handleDeleteClick = () => {
    this.changeData(null, {
      action: 'DELETE',
      pointId: this.point.id
    });

    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  _escKeyDownHandler(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.handleCloseClick();
    }
  }
}