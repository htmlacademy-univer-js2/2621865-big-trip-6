import MainPresenter from './presenter/main-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';

const filtersContainer = document.querySelector('.trip-controls__filters');
const eventsContainer = document.querySelector('.trip-events');

const filterModel = new FilterModel();
const mainPresenter = new MainPresenter(eventsContainer, filterModel);
const filterPresenter = new FilterPresenter(filtersContainer, filterModel);

filterPresenter.init();
mainPresenter.init();
