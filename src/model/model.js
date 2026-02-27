import {destinations} from './destinations.js';
import {offers} from './offers.js';
import {points} from './points.js';

class Model {
  constructor() {
    this.destinations = destinations;
    this.offers = offers;
    this.points = points;
  }

  getDestinations() {
    return this.destinations;
  }

  getOffers() {
    return this.offers;
  }

  getPoints() {
    return this.points;
  }

  getDestinationById(id) {
    return this.destinations.find((dest) => dest.id === id);
  }

  getOffersByType(type) {
    const offerGroup = this.offers.find((offer) => offer.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  getOfferById(type, offerId) {
    const offers = this.getOffersByType(type);
    return offers.find((offer) => offer.id === offerId);
  }
}

export default Model;