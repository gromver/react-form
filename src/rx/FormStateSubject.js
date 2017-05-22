import { Subject } from 'rxjs/Subject'
import { Set } from 'immutable'
import { SuccessState, WarningState, ErrorState, PendingState } from '../states'

export default class FormStateSubject extends Subject {
    changedFields = [];
    validFields = [];
    successFields = [];
    warningFields = [];
    pendingFields = [];
    errorFields = [];

    subscription;
    form;

    constructor(form) {
        super();

        this.form = form;
        this.subscription = form.observable.subscribe(this);
    }

    unsubscribe() {
        super.unsubscribe();

        this.subscription.unsubscribe();
    }

    next(state) {
        if (this.changedFields.length) {
            if (this.changedFields.indexOf(state.attribute) === -1) return;
        }

        if (this.validFields.length) {
            if (this.validFields.find((attribute) => {
                const state = this.form.getAttributeState(attribute);

                return !((state instanceof SuccessState) || (state instanceof WarningState));
            })) return;
        }

        if (this.successFields.length) {
            if (this.successFields.find((attribute) => {
                    const state = this.form.getAttributeState(attribute);

                    return !state instanceof SuccessState;
                })) return;
        }

        if (this.warningFields.length) {
            if (this.warningFields.find((attribute) => {
                    const state = this.form.getAttributeState(attribute);

                    return !state instanceof WarningState;
                })) return;
        }

        if (this.pendingFields.length) {
            if (this.pendingFields.find((attribute) => {
                    const state = this.form.getAttributeState(attribute);

                    return !state instanceof PendingState;
                })) return;
        }

        if (this.errorFields.length) {
            if (this.errorFields.find((attribute) => {
                    const state = this.form.getAttributeState(attribute);

                    return !state instanceof ErrorState;
                })) return;
        }

        super.next(state);
    }

    whenChanged(attributes) {
        this.changedFields = new Set([ ...this.changedFields, ...attributes ]).toArray();

        return this;
    }

    whenValid(attributes) {
        this.validFields = new Set([ ...this.validFields, ...attributes ]).toArray();

        return this;
    }

    whenSuccess(attributes) {
        this.successFields = new Set([ ...this.successFields, ...attributes ]).toArray();

        return this;
    }

    whenWarning(attributes) {
        this.warningFields = new Set([ ...this.warningFields, ...attributes ]).toArray();

        return this;
    }

    whenPending(attributes) {
        this.pendingFields = new Set([ ...this.pendingFields, ...attributes ]).toArray();

        return this;
    }

    whenError(attributes) {
        this.errorFields = new Set([ ...this.errorFields, ...attributes ]).toArray();

        return this;
    }
}