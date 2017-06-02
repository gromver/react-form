import { Model } from 'rx-model';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import FormStateSubject from './rx/FormStateSubject';
/**
 * TODO: разработать свой observable с методами:
 * whenAttributeChanged, whenAttributeValid, whenAttribute...
 * whenStateChanged, whenSubscribed,
 * */
export default class Form {
  static SCENARIO_DEFAULT = 'default';

  /**
   * @type {Model}
   */
  model;

  /**
   * @type {{}}
   */
  state = {};

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

    this.model = model;

    this.prepareForm();
  }

  /**
   * Form state stream
   * @returns {FormStateSubject}
   */
  getObservable() {
    return new FormStateSubject(this);
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
   * @param scenario {Array<string>|string}
   */
  setScenario(scenario) {
    this.getModel().setScenario(scenario);
  }

  /**
   * Get Model scenarios
   * @returns {Array<string>}
   */
  getScenario() {
    return this.getModel().getScenario();
  }

  /**
   * @param scenario
   * @returns {boolean}
   */
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
    this.state = {
      ...this.state,
      [name]: value,
    };

    this.observable.next({ [name]: value });
  }

  /**
   * Get form property value
   * @param name
   * @returns {*}
   */
  get(name) {
    return this.state[name];
  }

  /**
   * Set state values
   * @param values
   */
  setState(values) {
    this.state = {
      ...this.state,
      ...values,
    };

    this.observable.next(values);
  }

  /**
   * Set model attribute
   * @param attribute
   * @param value
   * @param cb
   */
  setAttribute(attribute, value, cb) {
    this.getModel().set(attribute, value);

    this.markAsDirty(attribute);

    if (cb) {
      cb.call(this);
    } else {
      this.getModel().markAsPristine([attribute]);
    }
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
   * @param cb
   */
  setAttributes(values, cb) {
    Object.entries(values).forEach(([k, v]) => {
      this.getModel().set(k, v);

      this.markAsDirty(k);
    });

    if (cb) {
      cb.call(this);
    } else {
      this.getModel().markAsPristine(Object.keys(values));
    }
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

  isAttributeEditable(attribute) {
    return this.getModel().isAttributeEditable(attribute);
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

  invalidateValidators() {
    return this.getModel().invalidateValidators();
  }

  /**
   * Returns current attribute state object or null
   * @param attribute
   * @returns {PendingState|WarningState|SuccessState|ErrorState|null}
   */
  getValidationState(attribute) {
    return this.getModel().getValidationState(attribute);
  }

  /**
   * Get attribute's validation error message is exist
   * @param attribute
   * @returns {Message|string|null}
   */
  getValidationError(attribute) {
    return this.getModel().getValidationError(attribute);
  }

  /**
   *
   * @returns {Array.<SuccessState|WarningState|ErrorState|PendingState>}
   */
  getValidationErrors() {
    return this.getModel().getValidationErrors();
  }

  // сообщение вне зависимости от типа состояния
  /**
   * Get attributes's any validation message
   * @param attribute
   * @returns {Message|string|null}
   */
  getValidationMessage(attribute) {
    return this.getModel().getValidationMessage(attribute);
  }

  /**
   * Get attributes's warning validation message
   * @param attribute
   * @returns {Message|string|null}
   */
  getValidationWarning(attribute) {
    return this.getModel().getValidationWarning(attribute);
  }

  /**
   * Get first error state is exists
   * @returns {ErrorState|undefined}
   */
  getFirstError() {
    return this.getModel().getFirstError();
  }

  hasErrors() {
    return this.getModel().hasErrors();
  }

  /**
   * @deprecated use getObservable()
   * @param properties
   * @returns {*}
   */
  when(properties) {
    const input = this.observable;

    return Observable.create((observer) => {
      input.subscribe({
        next: (changes) => {
          if (properties.find(p => Object.hasOwnProperty.call(changes, p))) {
            observer.next(changes);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });
    });
  }
}
