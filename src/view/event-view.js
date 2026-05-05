import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

const createOfferTemplate = (offer) => `
  <li class="event__offer">
    <span class="event__offer-title">${offer.title}</span>
    &plus;&euro;&nbsp;
    <span class="event__offer-price">${offer.price}</span>
  </li>
`;

const createEventTemplate = (point, destination, pointOffers) => {
  const {type, basePrice, dateFrom, dateTo, isFavorite} = point;

  const date = dayjs(dateFrom);
  const month = date.format('MMM').toUpperCase();
  const day = date.format('DD');

  const startTime = dayjs(dateFrom).format('HH:mm');
  const endTime = dayjs(dateTo).format('HH:mm');

  const durationMs = dayjs(dateTo).diff(dayjs(dateFrom));
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  let durationText = '';
  if (durationHours === 0) {
    durationText = `${durationMinutes}M`;
  } else if (durationMinutes === 0) {
    durationText = `${durationHours}H`;
  } else {
    durationText = `${durationHours}H ${durationMinutes}M`;
  }

  const offersTemplate = pointOffers
    .map((offer) => createOfferTemplate(offer))
    .join('');

  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dayjs(dateFrom).format('YYYY-MM-DD')}">${month} ${day}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${destination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dayjs(dateFrom).format('YYYY-MM-DDTHH:mm')}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${dayjs(dateTo).format('YYYY-MM-DDTHH:mm')}">${endTime}</time>
          </p>
          <p class="event__duration">${durationText}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${offersTemplate}
        </ul>
        <button class="event__favorite-btn ${favoriteClass}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
};

export default class EventView extends AbstractView {
  constructor(point, destination, offers, onEditClick, onFavoriteClick) {
    super();
    this.point = point;
    this.destination = destination;
    this.offers = offers;
    this._onEditClick = onEditClick;
    this._onFavoriteClick = onFavoriteClick;
  }

  get template() {
    return createEventTemplate(this.point, this.destination, this.offers);
  }

  setEventListeners() {
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this._onEditClick);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this._onFavoriteClick);
  }
}
