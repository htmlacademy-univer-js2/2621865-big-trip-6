import {destinations} from './destinations.js';
import {offers as offersData} from './offers.js';
import {points as pointsData} from './points.js';
import {UpdateType, UserAction} from '../const.js';

export default class Model {
  constructor() {
    this.destinations = destinations;
    this.offers = offersData;
    this.points = [...pointsData];
    this._observers = [];
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  removeObserver(observer) {
    this._observers = this._observers.filter((obs) => obs !== observer);
  }

  _notify(updateType, data) {
    this._observers.forEach((observer) => observer(updateType, data));
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
    this._notify(UpdateType.MAJOR, {action: UserAction.ADD_POINT, point});
  }

  updatePoint(updatedPoint) {
    const index = this.points.findIndex((point) => point.id === updatedPoint.id);
    if (index !== -1) {
      this.points[index] = updatedPoint;
      this._notify(UpdateType.MINOR, {action: UserAction.UPDATE_POINT, point: updatedPoint});
    }
  }

  deletePoint(pointId) {
    this.points = this.points.filter((point) => point.id !== pointId);
    this._notify(UpdateType.MAJOR, {action: UserAction.DELETE_POINT, pointId});
  }
}
