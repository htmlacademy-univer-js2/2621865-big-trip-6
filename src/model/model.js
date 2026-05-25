import {UpdateType, UserAction} from '../const.js';

export default class Model {
  constructor(api) {
    this._api = api;
    this._destinations = [];
    this._offers = [];
    this._points = [];
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

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this._api.getPoints(),
        this._api.getDestinations(),
        this._api.getOffers()
      ]);
      this._points = points;
      this._destinations = destinations;
      this._offers = offers;
      this._notify(UpdateType.INIT);
    } catch (err) {
      this._notify(UpdateType.INIT);
    }
  }

  getDestinations() {
    return this._destinations;
  }

  getOffers() {
    return this._offers;
  }

  getPoints() {
    return this._points;
  }

  getDestinationById(id) {
    return this._destinations.find((dest) => dest.id === id);
  }

  getOffersByType(type) {
    const offerGroup = this._offers.find((offer) => offer.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  async updatePoint(updatedPoint) {
    try {
      const response = await this._api.updatePoint(updatedPoint);
      const index = this._points.findIndex((point) => point.id === response.id);
      if (index !== -1) {
        this._points[index] = response;
        this._notify(UpdateType.PATCH, {action: UserAction.UPDATE_POINT, point: response});
      }
    } catch (err) {
      throw new Error('Не удалось обновить точку');
    }
  }
}
