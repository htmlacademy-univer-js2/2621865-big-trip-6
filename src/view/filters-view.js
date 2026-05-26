import AbstractView from '../framework/view/abstract-view.js';

const createFiltersTemplate = (currentFilter, filtersDisabled) => `
  <form class="trip-filters" action="#" method="get">
    <div class="trip-filters__filter">
      <input id="filter-everything" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="everything" data-filter-type="everything" ${currentFilter === 'everything' ? 'checked' : ''} ${filtersDisabled.everything ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-future" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="future" data-filter-type="future" ${currentFilter === 'future' ? 'checked' : ''} ${filtersDisabled.future ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-future">Future</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-present" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="present" data-filter-type="present" ${currentFilter === 'present' ? 'checked' : ''} ${filtersDisabled.present ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-present">Present</label>
    </div>

    <div class="trip-filters__filter">
      <input id="filter-past" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="past" data-filter-type="past" ${currentFilter === 'past' ? 'checked' : ''} ${filtersDisabled.past ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-past">Past</label>
    </div>

    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>
`;

export default class FiltersView extends AbstractView {
  constructor(currentFilter, onFilterChange, filtersDisabled) {
    super();
    this._currentFilter = currentFilter;
    this._onFilterChange = onFilterChange;
    this._filtersDisabled = filtersDisabled;
  }

  get template() {
    return createFiltersTemplate(this._currentFilter, this._filtersDisabled);
  }

  setEventListeners() {
    const filterButtons = this.element.querySelectorAll('.trip-filters__filter-input:not([disabled])');
    filterButtons.forEach((button) => {
      button.addEventListener('change', () => {
        const filterType = button.dataset.filterType;
        this._onFilterChange(filterType);
      });
    });
  }
}
