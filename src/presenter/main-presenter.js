import {render, RenderPosition} from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import EventView from '../view/event-view.js';

export default class MainPresenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
  }

  init() {
    // Рендерим фильтры
    render(new FiltersView(), this.filtersContainer);

    // Рендерим сортировку
    render(new SortView(), this.eventsContainer);

    // Создаём контейнер для списка событий (как обычный DOM-элемент)
    const eventsList = document.createElement('ul');
    eventsList.classList.add('trip-events__list');
    
    // Вставляем eventsList напрямую, без использования render
    this.eventsContainer.appendChild(eventsList);

    // Рендерим форму редактирования первой
    render(new EditFormView(), eventsList);

    // Рендерим 3 точки маршрута
    for (let i = 0; i < 3; i++) {
      render(new EventView(), eventsList);
    }
  }
}