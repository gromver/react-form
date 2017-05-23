import Form from './Form'
import StateTracker from './StateTracker'
import { SuccessState, WarningState } from './states'
import utils from './utils'

export default class FormValidator {
    form;
    rules;
    stateTracker;

    constructor(form, rules) {
        if (!(form instanceof Form)) {
            throw new Error('FormValidator.construct() - form must be an instance of Form');
        }

        if (!utils.isObject(rules)) {
            throw new Error('FormValidator.construct() - rules must be an object of rules');
        }

        this.form = form;
        this.rules = rules;
        this.stateTracker = new StateTracker();
    }

    validate() {
        const jobs = [];

        Object.entries(this.rules).forEach(([attribute, validator]) => {
            if (validator) {
                jobs.push(this.stateTracker.validateAttribute(this.form.model, attribute, validator));
            }
        });

        return Promise.all(jobs).then(states => {
            if (states.find(state => !(state instanceof SuccessState || state instanceof WarningState))) {
                return Promise.resolve(false);
            } else {
                return Promise.resolve(true);
            }
        });
    }
}