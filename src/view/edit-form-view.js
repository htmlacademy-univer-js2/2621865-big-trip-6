import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const createEditFormTemplate = (state, destination, allOffers) => {
  const {type, basePrice, dateFrom, dateTo, selectedOffersIds} = state;

  const createOfferSelectorTemplate = (offer, isChecked) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden"
             id="event-offer-${offer.id}-1"
             type="checkbox"
             name="event-offer-${offer.id}"
             value="${offer.id}"
             ${isChecked ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}-1">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `;

  const offersForType = allOffers.find((offerGroup) => offerGroup.type === type)?.offers || [];
  const offersTemplate = offersForType.map((offer) => createOfferSelectorTemplate(offer, selectedOffersIds.includes(offer.id))).join('');

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                <div class="event__type-item">
                  <input id="event-type-taxi-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="taxi" ${type === 'taxi' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--taxi" for="event-type-taxi-1">Taxi</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-bus-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="bus" ${type === 'bus' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--bus" for="event-type-bus-1">Bus</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-train-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="train" ${type === 'train' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--train" for="event-type-train-1">Train</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-ship-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="ship" ${type === 'ship' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--ship" for="event-type-ship-1">Ship</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-drive-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="drive" ${type === 'drive' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--drive" for="event-type-drive-1">Drive</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-flight-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="flight" ${type === 'flight' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--flight" for="event-type-flight-1">Flight</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-check-in-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="check-in" ${type === 'check-in' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--check-in" for="event-type-check-in-1">Check-in</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-sightseeing-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="sightseeing" ${type === 'sightseeing' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--sightseeing" for="event-type-sightseeing-1">Sightseeing</label>
                </div>
                <div class="event__type-item">
                  <input id="event-type-restaurant-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="restaurant" ${type === 'restaurant' ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--restaurant" for="event-type-restaurant-1">Restaurant</label>
                </div>
              </fieldset>
            </div>
          </div>
          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
            <datalist id="destination-list-1">
              <option value="Amsterdam"></option>
              <option value="Geneva"></option>
              <option value="Chamonix"></option>
            </datalist>
          </div>
          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dayjs(dateFrom).format('DD/MM/YY HH:mm')}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dayjs(dateTo).format('DD/MM/YY HH:mm')}">
          </div>
          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" min="0" step="1" name="event-price" value="${basePrice}">
          </div>
          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersTemplate}
            </div>
          </section>
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destination.description}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${destination.pictures.map((pic) => `
                  <img class="event__photo" src="${pic.src}" alt="${pic.description}">
                `).join('')}
              </div>
            </div>
          </section>
        </section>
      </form>
    </li>
  `;
};

export default class EditFormView extends AbstractStatefulView {
  constructor(point, destination, allOffers, onFormSubmit, onCloseClick, onDeleteClick) {
    super();
    this._state = this._getStateFromPoint(point);
    this.destination = destination;
    this.allOffers = allOffers;
    this._flatpickrStart = null;
    this._flatpickrEnd = null;
    this._onFormSubmit = onFormSubmit;
    this._onCloseClick = onCloseClick;
    this._onDeleteClick = onDeleteClick;
  }

  _getStateFromPoint(point) {
    return {
      type: point.type,
      basePrice: point.basePrice,
      dateFrom: point.dateFrom,
      dateTo: point.dateTo,
      isFavorite: point.isFavorite,
      selectedOffersIds: [...point.offersIds]
    };
  }

  get template() {
    return createEditFormTemplate(this._state, this.destination, this.allOffers);
  }

  _restoreHandlers() {
    this.setEventListeners();
    this._initFlatpickr();
  }

  setEventListeners() {
    this.element.querySelector('form').addEventListener('submit', this._onFormSubmit);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this._onCloseClick);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this._onDeleteClick);

    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this._onTypeChange.bind(this));
    });

    const checkboxes = this.element.querySelectorAll('.event__offer-checkbox');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this._onOfferChange.bind(this));
    });

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      priceInput.addEventListener('input', this._onPriceChange.bind(this));
    }
  }

  _initFlatpickr() {
    const startDateInput = this.element.querySelector('#event-start-time-1');
    const endDateInput = this.element.querySelector('#event-end-time-1');

    if (startDateInput && !this._flatpickrStart) {
      this._flatpickrStart = flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: dayjs(this._state.dateFrom).toDate(),
        onChange: ([date]) => {
          if (date) {
            this.updateElement({ dateFrom: dayjs(date).toISOString() });
          }
        }
      });
    }

    if (endDateInput && !this._flatpickrEnd) {
      this._flatpickrEnd = flatpickr(endDateInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: dayjs(this._state.dateTo).toDate(),
        onChange: ([date]) => {
          if (date) {
            this.updateElement({ dateTo: dayjs(date).toISOString() });
          }
        }
      });
    }
  }

  shake() {
    this.element.classList.add('shake');
    setTimeout(() => {
      this.element.classList.remove('shake');
    }, 600);
  }

  setFormSubmitHandler(handler) {
    this._onFormSubmit = handler;
  }

  setCloseClickHandler(handler) {
    this._onCloseClick = handler;
  }

  setDeleteClickHandler(handler) {
    this._onDeleteClick = handler;
  }

  _onTypeChange = (evt) => {
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      selectedOffersIds: []
    });
    setTimeout(() => this._restoreHandlers(), 0);
  };

  _onOfferChange = (evt) => {
    const offerId = evt.target.value;
    const isChecked = evt.target.checked;

    let newSelectedOffersIds = [...this._state.selectedOffersIds];

    if (isChecked) {
      if (!newSelectedOffersIds.includes(offerId)) {
        newSelectedOffersIds.push(offerId);
      }
    } else {
      newSelectedOffersIds = newSelectedOffersIds.filter((id) => id !== offerId);
    }

    this.updateElement({ selectedOffersIds: newSelectedOffersIds });
  };

  _onPriceChange = (evt) => {
    const value = parseInt(evt.target.value, 10);
    this.updateElement({ basePrice: isNaN(value) ? 0 : value });
  };
}
