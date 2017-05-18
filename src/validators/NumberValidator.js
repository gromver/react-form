import Validator from './Validator'
import utils from '../utils'

export default class NumberValidator extends Validator {
    static MESSAGE_NOT_NUMBER = '{attribute} - must be a valid number';
    static MESSAGE_ONLY_INTEGER = '{attribute} - must be an integer';
    static MESSAGE_GREATER_THAN = '{attribute} - must be greater than {count}';
    static MESSAGE_GREATER_THAN_OR_EQUAL_TO = '{attribute} - must be greater than or equal to {count}';
    static MESSAGE_EQUAL_TO = '{attribute} - must be equal to {count}';
    static MESSAGE_LESS_THAN = '{attribute} - must be less than {count}';
    static MESSAGE_LESS_THAN_OR_EQUAL_TO = '{attribute} - must be less than or equal to {count}';
    static MESSAGE_DIVISIBLE_BY = '{attribute} - must be divisible by {count}';
    static MESSAGE_NOT_ODD = '{attribute} - must be odd';
    static MESSAGE_NOT_EVEN = '{attribute} - must be even';

    constructor({
                    messageNotNumber,
                    messageOnlyInteger,
                    messageGreaterThan,
                    messageGreaterThanOrEqualTo,
                    messageEqualTo,
                    messageLessThan,
                    messageLessThanOrEqualTo,
                    messageDivisibleBy,
                    messageNotOdd,
                    messageNotEven,
                    strict = false,
                    onlyInteger = false,
                    greaterThan,
                    greaterThanOrEqualTo,
                    equalTo,
                    lessThan,
                    lessThanOrEqualTo,
                    divisibleBy = 0,
                    odd = false,
                    even = false

    } = {}) {
        super();

        this.messageNotNumber = messageNotNumber;
        this.messageOnlyInteger = messageOnlyInteger;
        this.messageGreaterThan = messageGreaterThan;
        this.messageGreaterThanOrEqualTo = messageGreaterThanOrEqualTo;
        this.messageEqualTo = messageEqualTo;
        this.messageLessThan = messageLessThan;
        this.messageLessThanOrEqualTo = messageLessThanOrEqualTo;
        this.messageDivisibleBy = messageDivisibleBy;
        this.messageNotOdd = messageNotOdd;
        this.messageNotEven = messageNotEven;
        this.strict = strict;
        this.onlyInteger = onlyInteger;
        this.greaterThan = greaterThan;
        this.greaterThanOrEqualTo = greaterThanOrEqualTo;
        this.equalTo = equalTo;
        this.lessThan = lessThan;
        this.lessThanOrEqualTo = lessThanOrEqualTo;
        this.divisibleBy = divisibleBy;
        this.odd = odd;
        this.even = even;
    }

    validate(value, attribute) {
        // Empty values are fine
        if (!utils.isDefined(value) || utils.isEmpty(value)) {
            return Promise.resolve();
        }

        // Strict will check that it is a valid looking number
        if (utils.isString(value) && this.strict) {
            let pattern = "^(0|[1-9]\\d*)";
            if (!this.onlyInteger) {
                pattern += "(\\.\\d+)?";
            }
            pattern += "$";

            if (!(new RegExp(pattern).test(value))) {
                return Promise.reject(this.createMessage(this.messageNotNumber || NumberValidator.MESSAGE_NOT_NUMBER, {
                    attribute
                }));
            }
        }

        // Coerce the value to a number unless we're being strict.
        // if (options.noStrings !== true && utils.isString(value) && !utils.isEmpty(value)) {
        //     value = +value;
        // }

        value = +value;

        // If it's not a number we shouldn't continue since it will compare it.
        if (!utils.isNumber(value)) {
            return Promise.reject(this.createMessage(this.messageNotNumber || NumberValidator.MESSAGE_NOT_NUMBER, {
                attribute
            }));
        }

        // Same logic as above, sort of. Don't bother with comparisons if this
        // doesn't pass.
        if (this.onlyInteger && !utils.isInteger(value)) {
            return Promise.reject(this.createMessage(this.messageOnlyInteger || NumberValidator.MESSAGE_ONLY_INTEGER, {
                attribute
            }));
        }

        if (this.greaterThan && utils.isNumber(this.greaterThan) && !(value > this.greaterThan)) {
            return Promise.reject(this.createMessage(this.messageGreaterThan || NumberValidator.MESSAGE_GREATER_THAN, {
                attribute,
                count: this.greaterThan
            }));
        }

        if (this.greaterThanOrEqualTo && utils.isNumber(this.greaterThanOrEqualTo) && !(value >= this.greaterThan)) {
            return Promise.reject(this.createMessage(this.messageGreaterThanOrEqualTo || NumberValidator.MESSAGE_GREATER_THAN_OR_EQUAL_TO, {
                attribute,
                count: this.greaterThanOrEqualTo
            }));
        }

        if (this.equalTo && utils.isNumber(this.equalTo) && !(value === this.equalTo)) {
            return this.createMessage(this.messageEqualTo || NumberValidator.MESSAGE_EQUAL_TO, {
                attribute,
                count: this.equalTo
            });
        }

        if (this.lessThan && utils.isNumber(this.lessThan) && !(value < this.lessThan)) {
            return Promise.reject(this.createMessage(this.messageLessThan || NumberValidator.MESSAGE_LESS_THAN, {
                attribute,
                count: this.lessThan
            }));
        }

        if (this.lessThanOrEqualTo && utils.isNumber(this.lessThanOrEqualTo) && !(value <= this.lessThan)) {
            return this.createMessage(this.messageLessThanOrEqualTo || NumberValidator.MESSAGE_LESS_THAN_OR_EQUAL_TO, {
                attribute,
                count: this.lessThanOrEqualTo
            });
        }

        if (this.divisibleBy && utils.isNumber(this.divisibleBy) && !(value % this.divisibleBy === 0)) {
            return Promise.reject(this.createMessage(this.messageDivisibleBy || NumberValidator.MESSAGE_DIVISIBLE_BY, {
                attribute,
                count: this.divisibleBy
            }));
        }

        if (this.odd && value % 2 !== 1) {
            return Promise.reject(this.createMessage(this.messageNotOdd || NumberValidator.MESSAGE_NOT_ODD, {
                attribute
            }));
        }

        if (this.even && value % 2 !== 0) {
            return Promise.reject(this.createMessage(this.messageNotEven || NumberValidator.MESSAGE_NOT_EVEN, {
                attribute
            }));
        }

        return Promise.resolve();
    }
}

