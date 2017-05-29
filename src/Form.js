import { Model } from 'rx-model';
import { Iterable, Map } from 'immutable';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export default class Form {
  static SCENARIO_DEFAULT = 'default';

  /**
   * @type {Model}
   */
  model;

  /**
   * @type {Immutable.Map}
   */
  properties;

  /**
   * @type {Array<string>}
   */
  dirtyAttributes = [];

  observable = new Subject();

  /**
   * Create Form instance
   * @param model {Model}
   */
  constructor(model) {
    if (!(model instanceof Model)) {
      throw new Error('Form.constructor - model must be set and be an instance of Model');
    }

    this.properties = new Map();
    this.model = model;

    this.prepareForm();
  }

  /**
   * Form state stream
   * @returns {Subject}
   */
  getObservable() {
    return this.observable;
  }

  /**
   * EXTEND THIS
   * подготовка формы (подписка обработчиков на when... события)
   */
  prepareForm() { }

  /**
   * Get model object
   * @returns {Model}
   */
  getModel() {
    return this.model;
  }

  /**
   * Set model scenario
   * @param scenario
   */
  setScenario(scenario) {
    this.getModel().setScenario(scenario);
  }

  getScenario() {
    return this.getModel().getScenario();
  }

  isScenario(scenario) {
    return this.getModel().isScenario(scenario);
  }

  markAsDirty(attribute) {
    if (this.dirtyAttributes.indexOf(attribute) === -1) {
      this.dirtyAttributes.push(attribute);
    }
  }

  /**
   * Set form property value
   * @param name
   * @param value
   */
  set(name, value) {
    this.properties = this.properties.set(name, value);

    this.observable.next(name);
  }

  /**
   * Get form property value
   * @param name
   * @returns {*}
   */
  get(name) {
    const value = this.properties.get(name);

    return Iterable.isIterable(value) ? value.toJS() : value;
  }

  /**
   * Set model attribute
   * @param attribute
   * @param value
   */
  setAttribute(attribute, value) {
    this.getModel().set(attribute, value);

    this.markAsDirty(attribute);
  }

  /**
   * Get model attribute
   * @param attribute
   * @returns {*}
   */
  getAttribute(attribute) {
    return this.getModel().get(attribute);
  }

  /**
   * Get model initial attribute
   * @param attribute
   * @returns {*}
   */
  getInitialAttribute(attribute) {
    return this.getModel().getInitialAttribute(attribute);
  }

  /**
   * Set model attributes
   * @param values
   */
  setAttributes(values) {
    Object.entries(values).forEach(([k, v]) => {
      this.getModel().set(k, v);

      this.markAsDirty(k);
    });
  }

  /**
   * Get normalized model attributes
   * @returns {{}}
   */
  getAttributes() {
    return this.model.getAttributes();
  }

  isFormDirty() {
    return !!this.dirtyAttributes.length;
  }

  isFormValid() {
    return !this.getModel().hasErrors();
  }

  isFormChanged() {
    return this.getModel().isModelChanged();
  }

  isAttributeDirty(attribute) {
    const { dirtyAttributes, model } = this;

    return model.isAttributeChanged(attribute) || dirtyAttributes.indexOf(attribute) !== -1;
  }

  isAttributeChanged(attribute) {
    return this.getModel().isAttributeChanged(attribute);
  }

  validate() {
    return this.getModel().validate();
  }

  /**
   * Validate Form
   * @param attributes {Array<string>|string}
   * @param onlyDirtyAttributes {boolean}
   * @returns {Promise.<boolean>}
   */
  validateAttributes(attributes, onlyDirtyAttributes = true) {
    let attrsToCheck = (typeof attributes === 'string' ? [attributes] : attributes) || [];

    if (onlyDirtyAttributes) {
      attrsToCheck = attrsToCheck.filter(i => this.isAttributeDirty(i));
    }

    attrsToCheck = [...new Set([...this.dirtyAttributes, ...attrsToCheck])];

    this.dirtyAttributes = [...attrsToCheck];

    if (attrsToCheck.length) {
      return this.getModel().validate(attrsToCheck);
    }

    return Promise.resolve(true);
  }

  when(properties) {
    const input = this.getObservable();

    return Observable.create((observer) => {
      input.subscribe({
        next: (property) => {
          if (properties.indexOf(property) !== -1) {
            observer.next(property);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });
    });
  }
}
