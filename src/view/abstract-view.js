import {createElement} from '../render.js';

export default class AbstractView {
  constructor() {
    if (new.target === AbstractView) {
      throw new Error('Can\'t instantiate AbstractView, only concrete one');
    }
    this.element = null;
  }

  get template() {
    throw new Error('Abstract method not implemented: get template');
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.template);
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}