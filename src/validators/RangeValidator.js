import Validator from './Validator'
import utils from '../utils'

export default class RangeValidator extends Validator {
    static MESSAGE_IN_RANGE = '{attribute} - must be in range';
    static MESSAGE_EXCEPT_RANGE = '{attribute} - must not be in range';

    constructor({
                    messageInRange,
                    messageExceptRange,
                    inRange,
                    exceptRange
    } = {}) {
        super();

        if (!inRange && !exceptRange) {
            throw new Error('either inRange or exceptRange prop must be set.')
        }

        this.messageInRange = messageInRange;
        this.messageExceptRange = messageExceptRange;
        this.inRange = inRange;
        this.exceptRange = exceptRange;
    }

    validate(value, attribute) {
        // Empty values are fine
        if (!utils.isDefined(value) || utils.isEmpty(value)) {
            return Promise.resolve();
        }

        if (this.inRange && this.inRange.indexOf(value) === -1) {
            return Promise.reject(this.createMessage(this.messageInRange || RangeValidator.MESSAGE_IN_RANGE, {
                attribute
            }));
        }

        if (this.exceptRange && this.exceptRange.indexOf(value) !== -1) {
            return Promise.reject(this.createMessage(this.messageExceptRange || RangeValidator.MESSAGE_EXCEPT_RANGE, {
                attribute
            }));
        }

        return Promise.resolve();
    }
}

