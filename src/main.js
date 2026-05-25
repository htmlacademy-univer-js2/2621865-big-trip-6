import MainPresenter from './presenter/main-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import Model from './model/model.js';
import Api from './api.js';

const filtersContainer = document.querySelector('.trip-controls__filters');
const eventsContainer = document.querySelector('.trip-events');

const api = new Api();
const filterModel = new FilterModel();
const model = new Model(api);
const mainPresenter = new MainPresenter(eventsContainer, filterModel);
const filterPresenter = new FilterPresenter(filtersContainer, filterModel);

mainPresenter.setModel(model);
filterPresenter.init();
mainPresenter.init();

model.init();
