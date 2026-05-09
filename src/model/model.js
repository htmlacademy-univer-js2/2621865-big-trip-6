import {destinations} from './destinations.js';
import {offers as offersData} from './offers.js';
import {points as pointsData} from './points.js';

class Model {
  constructor() {
    this.destinations = destinations;
    this.offers = offersData;
    this.points = [...pointsData];
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

  addPoint(point) {
    this.points = [point, ...this.points];
  }

  updatePoint(updatedPoint) {
    const index = this.points.findIndex((point) => point.id === updatedPoint.id);
    if (index !== -1) {
      this.points[index] = updatedPoint;
    }
  }

  deletePoint(pointId) {
    this.points = this.points.filter((point) => point.id !== pointId);
  }
}

export default Model;