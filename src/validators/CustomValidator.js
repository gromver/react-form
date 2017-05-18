import Validator from './Validator';

export default class CustomValidator extends Validator {
    func;

    constructor({ func }) {
        super();

        if (typeof func !== 'function') {
            throw new Error('CustomValidator::construct - func must be set.');
        }

        this.func = func;
    }

    validate(value, attribute) {
        return this.func(value, attribute);
    }
}

