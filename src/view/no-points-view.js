import AbstractView from '../framework/view/abstract-view.js';

const createNoPointsTemplate = (filterType) => {
  const messages = {
    everything: 'Click New Event to create your first point',
    future: 'There are no future events now',
    present: 'There are no present events now',
    past: 'There are no past events now'
  };

  const message = messages[filterType] || messages.everything;

  return `<p class="trip-events__msg">${message}</p>`;
};

export default class NoPointsView extends AbstractView {
  constructor(filterType = 'everything') {
    super();
    this.filterType = filterType;
  }

  get template() {
    return createNoPointsTemplate(this.filterType);
  }
}
