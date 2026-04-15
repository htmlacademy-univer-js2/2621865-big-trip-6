import AbstractView from '../framework/view/abstract-view.js';
import {FilterType, NoPointsMessage} from '../const.js';

const createNoPointsTemplate = (filterType) => {
  const message = NoPointsMessage[filterType] || NoPointsMessage[FilterType.EVERYTHING];
  return `<p class="trip-events__msg">${message}</p>`;
};

export default class NoPointsView extends AbstractView {
  constructor(filterType = FilterType.EVERYTHING) {
    super();
    this.filterType = filterType;
  }

  get template() {
    return createNoPointsTemplate(this.filterType);
  }
}
