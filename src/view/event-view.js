import AbstractView from './abstract-view.js';

const createOfferTemplate = (offer, isChecked) => `
  <li class="event__offer">
    <span class="event__offer-title">${offer.title}</span>
    &plus;&euro;&nbsp;
    <span class="event__offer-price">${offer.price}</span>
  </li>
`;

const createEventTemplate = (point, destination, pointOffers) => {
  const {type, basePrice, dateFrom, dateTo, isFavorite} = point;
  const date = new Date(dateFrom);
  const month = date.toLocaleString('en', {month: 'short'}).toUpperCase();
  const day = date.getDate();
  
  const startTime = new Date(dateFrom).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const endTime = new Date(dateTo).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  
  const duration = calculateDuration(dateFrom, dateTo);
  
  const offersTemplate = pointOffers
    .map((offer) => createOfferTemplate(offer))
    .join('');
  
  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dateFrom.split('T')[0]}">${month} ${day}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${destination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
          </p>
          <p class="event__duration">${duration}</p>
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

function calculateDuration(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const diff = end - start;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}M`;
  } else if (minutes === 0) {
    return `${hours}H`;
  } else {
    return `${hours}H ${minutes}M`;
  }
}

export default class EventView extends AbstractView {
  constructor(point, destination, offers) {
    super();
    this.point = point;
    this.destination = destination;
    this.offers = offers;
  }

  get template() {
    return createEventTemplate(this.point, this.destination, this.offers);
  }
}