import { Model } from 'rx-model';
import { UnvalidatedState } from 'rx-model/states';
import { Subject } from 'rxjs/Subject';
import FormStateSubject from './rx/FormStateSubject';
import MutationState from './states/MutationState';

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
   * Подписка на прослушивание модели. Форма следит за атрибутами
   * Если приходит UnvalidatedState - автоматически перевалидируем аттрибут
   * @type {Subscription}
   */
  subscription;

  /**
   * Create Form instance
   * @param model {Model}
   */
  constructor(model) {
    if (!(model instanceof Model)) {
      throw new Error('Form.constructor - model must be set and be an instance of Model');
    }

    this.model = model;

    this.subscription = model.getValidationObservable().subscribe((state) => {
      if (state instanceof UnvalidatedState) {
        return this.validateAttributes([state.attribute]);
      }

      return null;
    });
  }

  /**
   * Form state stream
   * @returns {FormStateSubject}
   */
  getObservable() {
    return new FormStateSubject(this);
  }

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
   * Установка сценария
   * Сценариев может быть несколько
   * @param {Array<string>|string} scenario
   */
  addScenario(scenario) {
    this.getModel().addScenario(scenario);
  }

  /**
   * Установка сценария
   * Сценариев может быть несколько
   * @param {Array<string>|string} scenario
   */
  removeScenario(scenario) {
    this.getModel().removeScenario(scenario);
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

    this.observable.next(new MutationState({ [name]: value }));
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

    this.observable.next(new MutationState(values));
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
   * Set model attribute and validate it
   * @param attribute
   * @param value
   * @returns {Promise.<boolean>}
   */
  setAttributeAndValidate(attribute, value) {
    this.setAttribute(attribute, value);

    return this.validateAttributes([attribute]);
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
   * Set model attributes and validate them
   * @param values
   * @returns {Promise.<boolean>}
   */
  setAttributesAndValidate(values) {
    this.setAttributes(values);

    return this.validateAttributes(Object.keys(values));
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

  isAttributeSafe(attribute) {
    return this.getModel().isAttributeSafe(attribute);
  }

  validate() {
    Object.keys(this.getModel().getValidators()).forEach(attribute => this.markAsDirty(attribute));

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
    } else {
      this.dirtyAttributes = [...new Set([...this.dirtyAttributes, ...attrsToCheck])];
    }

    if (attrsToCheck.length) {
      return this.getModel().validate(attrsToCheck);
    }

    return Promise.resolve(true);
  }

  /**
   * Validate Form's dirty attributes
   * @returns {Promise.<boolean>}
   */
  validateDirtyAttributes() {
    if (this.dirtyAttributes.length) {
      return this.getModel().validate(this.dirtyAttributes);
    }

    return Promise.resolve(true);
  }

  invalidateValidators() {
    return this.getModel().invalidateValidators();
  }

  /**
   * Get attribute's validation state object
   * @param attribute
   * @returns {PendingState|WarningState|SuccessState|ErrorState|PristineState|UnvalidatedState}
   */
  getAttributeState(attribute) {
    return this.getModel().getAttributeState(attribute);
  }

  /**
   * Returns current attribute state object or null
   * @param attribute
   * @returns {PendingState|WarningState|SuccessState|ErrorState|PristineState|UnvalidatedState}
   */
  getValidationState(attribute) {
    return this.getModel().getValidationState(attribute);
  }

  /**
   * Returns current attribute state object or null
   * @param {string} attribute
   * @returns {string}
   */
  getValidationStatus(attribute) {
    return this.getModel().getValidationStatus(attribute);
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
   * Get attributes's warning validation message
   * @param {string} attribute
   * @returns {boolean}
   */
  getValidationPending(attribute) {
    return this.getModel().getValidationPending(attribute);
  }

  /**
   * Returns an array of error states if exists
   * @returns {Array<ErrorState>}
   */
  getValidationErrors() {
    return this.getModel().getValidationErrors();
  }

  /**
   * Returns an array of warning states if exists
   * @returns {Array<WarningState>}
   */
  getValidationWarnings() {
    return this.getModel().getValidationWarnings();
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
}
