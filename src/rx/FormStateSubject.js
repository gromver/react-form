import { Subject } from 'rxjs/Subject';
import { Set } from 'immutable';

export default class FormStateSubject extends Subject {
  isRunOnSubscribe = false;
  changedProperties = [];

  form;
  formSubscription;

  modelObservable;
  modelSubscription;

  constructor(form) {
    super();

    this.form = form;
  }

  unsubscribe() {
    super.unsubscribe();

    this.formSubscription.unsubscribe();

    if (this.modelSubscription) {
      this.modelSubscription.unsubscribe();
    }
  }

  subscribe(observer) {
    super.subscribe(observer);

    if (this.isRunOnSubscribe) {
      super.next({});
    }
  }

  next(changes) {
    if (this.changedProperties.length) {
      if (!this.changedProperties.filter(p => Object.hasOwnProperty.call(changes, p)).length) {
        return;
      }
    }

    super.next({ form: changes });
  }

  whenSubscribed() {
    this.isRunOnSubscribe = true;

    return this;
  }

  whenFormChanged() {
    if (!this.formSubscription) {
      this.formSubscription = this.form.observable.subscribe(this);
    }

    return this;
  }

  whenStateChanged(properties) {
    this.changedProperties = new Set([...this.changedProperties, ...properties]).toArray();

    return this.whenFormChanged();
  }

  getModelObservable() {
    if (!this.modelObservable) {
      this.modelObservable = this.form.getModel().getObservable();

      this.modelSubscription = this.modelObservable.subscribe((state) => {
        super.next({ model: state });
      });
    }

    return this.modelObservable;
  }

  whenModelChanged() {
    this.getModelObservable();

    return this;
  }

  whenAttributesChanged(attributes) {
    this.getModelObservable().when(attributes);

    return this;
  }

  whenAttributesValid(attributes) {
    this.getModelObservable().when(attributes).whenValid(attributes);

    return this;
  }

  whenAttributesSuccess(attributes) {
    this.getModelObservable().when(attributes).whenSuccess(attributes);

    return this;
  }

  whenAttributesWarning(attributes) {
    this.getModelObservable().when(attributes).whenWarning(attributes);

    return this;
  }

  whenAttributesPending(attributes) {
    this.getModelObservable().when(attributes).whenPending(attributes);

    return this;
  }

  whenAttributesError(attributes) {
    this.getModelObservable().when(attributes).whenError(attributes);

    return this;
  }
}
