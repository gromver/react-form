import Validator from './Validator'
import utils from '../utils'

export default class PresenceValidator extends Validator {
    static MESSAGE = '{attribute} - can\'t be blank';

    constructor({ message, allowEmpty = false } = {}) {
        super();

        this.message = message;
        this.allowEmpty = allowEmpty;
    }

    validate(value, attribute) {
        if (this.allowEmpty ? !utils.isDefined(value) : utils.isEmpty(value)) {
            return Promise.reject(this.createMessage(this.message || PresenceValidator.MESSAGE, {
                attribute
            }));
        } else {
            return Promise.resolve();
        }
    }
}

