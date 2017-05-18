import Validator from './Validator'
import utils from '../utils'

export default class StringValidator extends Validator {
    static MESSAGE_NOT_STRING = '{attribute} - must be a string';
    static MESSAGE_MIN_LENGTH = '{attribute} - is too short (minimum is {count} characters)';
    static MESSAGE_MAX_LENGTH = '{attribute} - is too long (maximum is {count} characters)';
    static MESSAGE_PATTERN = '{attribute} - is invalid';

    constructor({
                    messageNotString,
                    messageMaxLength,
                    messageMinLength,
                    messagePattern,
                    maxLength,
                    minLength,
                    pattern,
                    flags
    } = {}) {
        super();

        this.messageNotString = messageNotString;
        this.messageMaxLength = messageMaxLength;
        this.messageMinLength = messageMinLength;
        this.messagePattern = messagePattern;
        this.maxLength = maxLength;
        this.minLength = minLength;
        this.pattern = pattern;
        this.flags = flags;
    }

    validate(value, attribute) {
        // Empty values are fine
        if (!utils.isDefined(value)) {
            return Promise.resolve();
        }

        if (!utils.isString(value)) {
            return Promise.reject(this.createMessage(this.messageNotString || StringValidator.MESSAGE_NOT_STRING, {
                attribute
            }));
        }

        const length = value.length;

        if (this.minLength && utils.isNumber(this.minLength) && !(length >= this.minLength)) {
            return Promise.reject(this.createMessage(this.messageMinLength || StringValidator.MESSAGE_MIN_LENGTH, {
                attribute,
                count: this.minLength
            }));
        }

        if (this.maxLength && utils.isNumber(this.maxLength) && !(length <= this.maxLength)) {
            return Promise.reject(this.createMessage(this.messageMaxLength || StringValidator.MESSAGE_MAX_LENGTH, {
                attribute,
                count: this.maxLength
            }));
        }

        let pattern = this.pattern;

        if (pattern) {
            if (utils.isString(pattern)) {
                pattern = new RegExp(pattern, this.flags);
            }

            const match = pattern.exec(value);

            if (!match) {
                return Promise.reject(this.createMessage(this.messagePattern || StringValidator.MESSAGE_PATTERN, {
                    attribute
                }));
            }
        }

        return Promise.resolve();
    }
}

