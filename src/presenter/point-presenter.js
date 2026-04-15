import {render, replace, remove} from '../framework/render.js';
import EventView from '../view/event-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  constructor(pointsContainer, changeData, changeMode) {
    this.pointsContainer = pointsContainer;
    this.changeData = changeData;
    this.changeMode = changeMode;
    this.pointComponent = null;
    this.editFormComponent = null;
  }

  init(point, destination, offers) {
    this.point = point;
    this.destination = destination;
    this.offers = offers;

    this.pointComponent = new EventView(
      point,
      destination,
      offers,
      this.handleEditClick,
      this.handleFavoriteClick
    );

    this.editFormComponent = new EditFormView(
      point,
      destination,
      offers,
      this.handleFormSubmit,
      this.handleCloseClick
    );

    render(this.pointComponent, this.pointsContainer);
    this.pointComponent.setEventListeners();
  }

  destroy() {
    if (this.pointComponent) {
      remove(this.pointComponent);
    }
    if (this.editFormComponent) {
      remove(this.editFormComponent);
    }
  }

  resetView() {
    if (this.editFormComponent !== null && this.pointComponent !== null) {
      replace(this.pointComponent, this.editFormComponent);
    }
  }

  handleEditClick = () => {
    this.changeMode();
    replace(this.editFormComponent, this.pointComponent);
    this.editFormComponent.setEventListeners();
  };

  handleFavoriteClick = () => {
    this.changeData({...this.point, isFavorite: !this.point.isFavorite});
  };

  handleFormSubmit = (evt) => {
    evt.preventDefault();
    replace(this.pointComponent, this.editFormComponent);
    this.pointComponent.setEventListeners();
  };

  handleCloseClick = () => {
    replace(this.pointComponent, this.editFormComponent);
    this.pointComponent.setEventListeners();
  };
}
