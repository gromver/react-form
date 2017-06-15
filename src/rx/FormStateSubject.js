import { Subject } from 'rxjs/Subject';
import { Set } from 'immutable';
import FormMutationState from '../states/MutationState';

export default class FormStateSubject extends Subject {
  isRunOnSubscribe = false;
  changedProperties = [];

  form;
  formSubscription;

  validationObservable;
  validationSubscription;

  mutationObservable;
  mutationSubscription;

  constructor(form) {
    super();

    this.form = form;
  }

  unsubscribe() {
    super.unsubscribe();

    this.formSubscription.unsubscribe();

    if (this.validationSubscription) {
      this.validationSubscription.unsubscribe();
    }

    if (this.mutationSubscription) {
      this.mutationSubscription.unsubscribe();
    }
  }

  subscribe(observer) {
    super.subscribe(observer);

    if (this.isRunOnSubscribe) {
      super.next({});
    }
  }

  next(state) {
    if (this.changedProperties.length && state instanceof FormMutationState) {
      if (
        !this.changedProperties.filter(p => Object.hasOwnProperty.call(state.mutations, p)).length
      ) {
        return;
      }
    }

    super.next(state);  // Form.MutationState
  }

  whenSubscribed() {
    this.isRunOnSubscribe = true;

    return this;
  }

  subscribeToForm() {
    if (!this.formSubscription) {
      this.formSubscription = this.form.observable.subscribe(this);
    }
  }

  getValidationObservable() {
    if (!this.validationObservable) {
      this.validationObservable = this.form.getModel().getValidationObservable();

      this.validationSubscription = this.validationObservable.subscribe((state) => {
        super.next(state);  // SuccessState, WarningState, ErrorState, PendingState
      });
    }

    return this.validationObservable;
  }

  getMutationObservable() {
    if (!this.mutationObservable) {
      this.mutationObservable = this.form.getModel().getMutationObservable();

      this.mutationSubscription = this.mutationObservable.subscribe((state) => {
        super.next(state);  // Model.MutationState
      });
    }

    return this.mutationObservable;
  }


  /**
   * When form changed
   * @param {Array<string>} properties - a list of filtered by properties
   * @returns {*}
   */
  whenForm(properties = []) {
    this.subscribeToForm();

    this.changedProperties = new Set([...this.changedProperties, ...properties]).toArray();

    return this;
  }

  /**
   * When model changed
   * @param {Array<string>} attributes - a list of filtered by attributes
   * @returns {*}
   */
  whenModel(attributes = []) {
    this.getMutationObservable().when(attributes);

    return this;
  }

  /**
   * When validation changed
   * @param {Array<string>} attributes - a list of filtered by attributes
   * @returns {*}
   */
  whenValidation(attributes = []) {
    this.getValidationObservable().when(attributes);

    return this;
  }

  whenValidationValid(attributes) {
    this.getValidationObservable().when(attributes).whenValid(attributes);

    return this;
  }

  whenValidationSuccess(attributes) {
    this.getValidationObservable().when(attributes).whenSuccess(attributes);

    return this;
  }

  whenValidationWarning(attributes) {
    this.getValidationObservable().when(attributes).whenWarning(attributes);

    return this;
  }

  whenValidationPending(attributes) {
    this.getValidationObservable().when(attributes).whenPending(attributes);

    return this;
  }

  whenValidationError(attributes) {
    this.getValidationObservable().when(attributes).whenError(attributes);

    return this;
  }
}
