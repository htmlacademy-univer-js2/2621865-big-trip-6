import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const createEditFormTemplate = (state, destinations, allOffers) => {
  const {type, basePrice, dateFrom, dateTo, selectedOffersIds, destinationName} = state;

  const createOfferSelectorTemplate = (offer, isChecked) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer-${offer.id}" value="${offer.id}" ${isChecked ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}-1">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `;

  const offersForType = allOffers.find((offerGroup) => offerGroup.type === type)?.offers || [];
  const offersTemplate = offersForType.map((offer) => createOfferSelectorTemplate(offer, selectedOffersIds.includes(offer.id))).join('');

  const selectedDestination = destinations.find((dest) => dest.name === destinationName);
  const description = selectedDestination?.description || '';
  const pictures = selectedDestination?.pictures || [];

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'].map((eventType) => `
                  <div class="event__type-item">
                    <input id="event-type-${eventType}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${eventType}" ${type === eventType ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType}</label>
                  </div>
                `).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName || ''}" list="destination-list-1" autocomplete="off">
            <datalist id="destination-list-1">
              ${destinations.map((dest) => `<option value="${dest.name}"></option>`).join('')}
            </datalist>
            <input type="hidden" name="event-destination-id" value="${state.destinationId || ''}">
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dayjs(dateFrom).format('DD/MM/YY HH:mm')}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dayjs(dateTo).format('DD/MM/YY HH:mm')}">
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1"><span class="visually-hidden">Price</span>&euro;</label>
            <input class="event__input event__input--price" id="event-price-1" type="number" min="0" step="1" name="event-price" value="${basePrice}">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="button">Delete</button>
          <button class="event__rollup-btn" type="button"><span class="visually-hidden">Open event</span></button>
        </header>
        <section class="event__details">
          ${offersForType.length > 0 ? `
            <section class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers">${offersTemplate}</div>
            </section>
          ` : ''}
          ${description || pictures.length > 0 ? `
            <section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              ${description ? `<p class="event__destination-description">${description}</p>` : ''}
              ${pictures.length > 0 ? `
                <div class="event__photos-container">
                  <div class="event__photos-tape">
                    ${pictures.map((pic) => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          ` : ''}
        </section>
      </form>
    </li>
  `;
};

export default class EditFormView extends AbstractStatefulView {
  constructor(point, destinations, allOffers, onFormSubmit, onCloseClick, onDeleteClick) {
    super();
    this.destinations = destinations;
    this.allOffers = allOffers;
    this._state = this._getStateFromPoint(point);
    this._flatpickrStart = null;
    this._flatpickrEnd = null;
    this._onFormSubmit = onFormSubmit;
    this._onCloseClick = onCloseClick;
    this._onDeleteClick = onDeleteClick;
    this.destinations = destinations || [];
  }

  get template() {
    return createEditFormTemplate(this._state, this.destinations, this.allOffers);
  }

  _getStateFromPoint(point) {
    const destination = this.destinations.find((dest) => dest.id === point.destinationId);
    return {
      type: point.type,
      basePrice: point.basePrice,
      dateFrom: point.dateFrom,
      dateTo: point.dateTo,
      isFavorite: point.isFavorite,
      selectedOffersIds: [...point.offersIds],
      destinationName: destination ? destination.name : '',
      destinationId: point.destinationId
    };
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
    
    const typeLabel = this.element.querySelector('.event__type-output');
    if (typeLabel && this._state.type) {
      typeLabel.textContent = this._state.type.charAt(0).toUpperCase() + this._state.type.slice(1);
    }
    
    document.addEventListener('keydown', this._escKeyDownHandler);
  }

  removeElement() {
    super.removeElement();
    document.removeEventListener('keydown', this._escKeyDownHandler);
    if (this._flatpickrStart) {
      this._flatpickrStart.destroy();
      this._flatpickrStart = null;
    }
    if (this._flatpickrEnd) {
      this._flatpickrEnd.destroy();
      this._flatpickrEnd = null;
    }
  }

  setEventListeners() {
    this.element.querySelector('form').addEventListener('submit', this._onFormSubmit);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this._onCloseClick);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this._onDeleteClick);
    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this._onTypeChange.bind(this));
    });
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this._onDestinationChange.bind(this));
    }
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => {
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

  reset(point) {
    this.updateElement(this._getStateFromPoint(point));
  }

  shake() {
    this.element.classList.add('shake');
    setTimeout(() => {
      this.element.classList.remove('shake');
    }, 600);
  }

  _onTypeChange = (evt) => {
    const newType = evt.target.value;
    
    setTimeout(() => {
      this.updateElement({
        type: newType,
        selectedOffersIds: []
      });
      
      setTimeout(() => {
        const typeLabel = this.element.querySelector('.event__type-output');
        if (typeLabel) {
          typeLabel.textContent = newType.charAt(0).toUpperCase() + newType.slice(1);
        }
      }, 50);
    }, 100);
  };

  _onDestinationChange = (evt) => {
    const destinationName = evt.target.value;
    const selectedDestination = this.destinations.find((dest) => dest.name === destinationName);
    
    this.updateElement({ 
      destinationName: destinationName,
      destinationId: selectedDestination ? selectedDestination.id : ''
    });
  };

  _onOfferChange = (evt) => {
    const offerId = evt.target.value;
    let selectedOffersIds = [...this._state.selectedOffersIds];
    if (evt.target.checked) {
      if (!selectedOffersIds.includes(offerId)) {
        selectedOffersIds.push(offerId);
      }
    } else {
      selectedOffersIds = selectedOffersIds.filter((id) => id !== offerId);
    }
    this.updateElement({ selectedOffersIds });
  };

  _onPriceChange = (evt) => {
    this.updateElement({ basePrice: Number(evt.target.value) });
  };

  _escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      if (this._onCloseClick) {
        this._onCloseClick();
      }
    }
  };
}