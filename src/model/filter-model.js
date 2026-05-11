import {FilterType} from '../const.js';

export default class FilterModel {
  constructor() {
    this._currentFilter = FilterType.EVERYTHING;
    this._observers = [];
  }

  getFilter() {
    return this._currentFilter;
  }

  setFilter(updateType, filter) {
    this._currentFilter = filter;
    this._notify(updateType, filter);
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
}
