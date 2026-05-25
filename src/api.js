const AUTHORIZATION = 'Basic bigtrip123456';
const END_POINT = 'https://21.objects.pages.academy/big-trip';

export default class Api {
  constructor(endPoint = END_POINT, authorization = AUTHORIZATION) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  async _load({url, method = 'GET', body = null, headers = new Headers()}) {
    headers.append('Authorization', this._authorization);

    const response = await fetch(`${this._endPoint}/${url}`, {method, body, headers});

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  async getPoints() {
    const response = await this._load({url: 'points'});
    const points = await response.json();
    return points.map(this._adaptToClient);
  }

  async getDestinations() {
    const response = await this._load({url: 'destinations'});
    const destinations = await response.json();
    return destinations;
  }

  async getOffers() {
    const response = await this._load({url: 'offers'});
    const offers = await response.json();
    return offers;
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(this._adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'})
    });
    const updatedPoint = await response.json();
    return this._adaptToClient(updatedPoint);
  }

  _adaptToServer(point) {
    const adaptedPoint = {
      'base_price': point.basePrice,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'destination': point.destinationId,
      'id': point.id,
      'is_favorite': point.isFavorite,
      'offers': point.offersIds,
      'type': point.type
    };
    return adaptedPoint;
  }

  _adaptToClient(point) {
    const adaptedPoint = {
      id: point.id,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      destinationId: point['destination'],
      isFavorite: point['is_favorite'],
      offersIds: point['offers'],
      type: point['type']
    };
    return adaptedPoint;
  }
}
