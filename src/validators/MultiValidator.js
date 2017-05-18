import Validator from './Validator';

export default class MultiValidator extends Validator {
    validators;

    constructor({ message, validators }) {
        super();

        this.validators = validators || [];
    }

    validate(value, attribute, model) {
        const jobs = this.validators.map(validator => validator.validate(value, attribute, model));

        return Promise.all(jobs).then(messages => messages.find(i => i) || null);
    }
}

