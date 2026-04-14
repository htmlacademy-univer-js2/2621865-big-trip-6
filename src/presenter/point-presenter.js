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

    const prevPointComponent = this.pointComponent;
    const prevEditFormComponent = this.editFormComponent;

    this.pointComponent = new EventView(point, destination, offers, this.handleEditClick);
    this.editFormComponent = new EditFormView(point, destination, offers, this.handleFormSubmit, this.handleCloseClick);

    if (prevPointComponent === null && prevEditFormComponent === null) {
      render(this.pointComponent, this.pointsContainer);
      return;
    }

    if (this.pointsContainer.contains(prevPointComponent.element)) {
      replace(this.pointComponent, prevPointComponent);
    }

    if (this.pointsContainer.contains(prevEditFormComponent.element)) {
      replace(this.editFormComponent, prevEditFormComponent);
    }

    remove(prevPointComponent);
    remove(prevEditFormComponent);
  }

  destroy() {
    remove(this.pointComponent);
    remove(this.editFormComponent);
  }

  resetView() {
    if (this.editFormComponent !== null) {
      replace(this.pointComponent, this.editFormComponent);
    }
  }

  handleEditClick = () => {
    this.changeMode();
    replace(this.editFormComponent, this.pointComponent);
  }

  handleFormSubmit = (evt) => {
    evt.preventDefault();
    this.changeData({...this.point, isFavorite: !this.point.isFavorite});
    replace(this.pointComponent, this.editFormComponent);
  }

  handleCloseClick = () => {
    replace(this.pointComponent, this.editFormComponent);
  }
}