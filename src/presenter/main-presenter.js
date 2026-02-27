import {render, RenderPosition} from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import EventView from '../view/event-view.js';
import Model from '../model/model.js';

export default class MainPresenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.model = new Model();
  }

  init() {
    render(new FiltersView(), this.filtersContainer);
    render(new SortView(), this.eventsContainer);

    const eventsList = document.createElement('ul');
    eventsList.classList.add('trip-events__list');
    this.eventsContainer.appendChild(eventsList);

    const points = this.model.getPoints();
    const destinations = this.model.getDestinations();
    const offers = this.model.getOffers();
    const firstPoint = points[0];
    const firstDestination = this.model.getDestinationById(firstPoint.destinationId);
    const firstOffers = this.model.getOffersByType(firstPoint.type);
    
    render(new EditFormView(firstPoint, firstDestination, firstOffers), eventsList);

    points.forEach((point) => {
      const destination = this.model.getDestinationById(point.destinationId);
      const pointOffers = this.model.getOffersByType(point.type)
        .filter((offer) => point.offersIds.includes(offer.id));
      
      render(new EventView(point, destination, pointOffers), eventsList);
    });
  }
}