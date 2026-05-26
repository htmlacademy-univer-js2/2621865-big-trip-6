import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const createAddFormTemplate = (state, destinations, allOffers) => {
  const {type, basePrice, dateFrom, dateTo, selectedOffersIds, destinationName} = state;

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

  const destinationsOptions = destinations.map((dest) => `<option value="${dest.name}"></option>`).join('');

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
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1" autocomplete="off">
            <datalist id="destination-list-1">
              ${destinationsOptions}
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
          <button class="event__reset-btn" type="reset">Cancel</button>
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
            <p class="event__destination-description"></p>
            <div class="event__photos-container">
              <div class="event__photos-tape"></div>
            </div>
          </section>
        </section>
      </form>
    </li>
  `;
};

export default class AddFormView extends AbstractStatefulView {
  constructor(destinations, allOffers, onFormSubmit, onCancelClick) {
    super();
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    this._state = {
      type: 'flight',
      basePrice: 0,
      dateFrom: now.toISOString(),
      dateTo: oneHourLater.toISOString(),
      selectedOffersIds: [],
      destinationName: ''
    };
    this.destinations = destinations;
    this.allOffers = allOffers;
    this._flatpickrStart = null;
    this._flatpickrEnd = null;
    this._onFormSubmit = onFormSubmit;
    this._onCancelClick = onCancelClick;
  }

  get template() {
    return createAddFormTemplate(this._state, this.destinations, this.allOffers);
  }

  _restoreHandlers() {
    if (this._flatpickrStart) {
      this._flatpickrStart.destroy();
      this._flatpickrStart = null;
    }
    if (this._flatpickrEnd) {
      this._flatpickrEnd.destroy();
      this._flatpickrEnd = null;
    }
    this.setEventListeners();
    this._initFlatpickr();
  }

  setEventListeners() {
    this.element.querySelector('form').addEventListener('submit', this._onFormSubmit);

    const cancelBtn = this.element.querySelector('.event__reset-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this._onCancelClick);
    }

    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this._onTypeChange.bind(this));
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this._onDestinationChange.bind(this));
    }

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      priceInput.addEventListener('input', this._onPriceChange.bind(this));
    }

    const checkboxes = this.element.querySelectorAll('.event__offer-checkbox');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this._onOfferChange.bind(this));
    });
  }

  _initFlatpickr() {
    setTimeout(() => {
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
    }, 50);
  }

  shake() {
    this.element.classList.add('shake');
    setTimeout(() => {
      this.element.classList.remove('shake');
    }, 600);
  }

  _onTypeChange = (evt) => {
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      selectedOffersIds: []
    });
  };

  _onDestinationChange = (evt) => {
    this.updateElement({ destinationName: evt.target.value });
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
