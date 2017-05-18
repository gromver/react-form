import Validator from './Validator'
import utils from '../utils'

export default class EmailValidator extends Validator {
    static PATTERN = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
    static MESSAGE = '{attribute} - is not a valid email';

    constructor({ message } = {}) {
        super();

        this.message = message;
    }

    validate(value, attribute) {
        const message = this.createMessage(this.message || EmailValidator.MESSAGE, {
            attribute
        });

        // Empty values are fine
        if (!utils.isDefined(value) || utils.isEmpty(value)) {
            return Promise.resolve();
        }
        if (!utils.isString(value)) {
            return Promise.reject(message);
        }
        if (!EmailValidator.PATTERN.exec(value)) {
            return Promise.reject(message);
        }
    }
}

