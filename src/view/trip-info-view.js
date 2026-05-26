import AbstractView from '../framework/view/abstract-view.js';

const createTripInfoTemplate = (route, dates, cost) => `
  <section class="trip-main__trip-info  trip-info">
    <div class="trip-info__main">
      <h1 class="trip-info__title">${route}</h1>
      <p class="trip-info__dates">${dates}</p>
    </div>
    <p class="trip-info__cost">
      Total: &euro;&nbsp;<span class="trip-info__cost-value">${cost}</span>
    </p>
  </section>
`;

export default class TripInfoView extends AbstractView {
  constructor(route, dates, cost) {
    super();
    this._route = route;
    this._dates = dates;
    this._cost = cost;
  }

  get template() {
    return createTripInfoTemplate(this._route, this._dates, this._cost);
  }
}
