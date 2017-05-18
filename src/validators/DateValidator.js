import Validator from './Validator'
import utils from '../utils'

export default class DateValidator extends Validator {
    static MESSAGE_NOT_DATE = '{attribute} - must be a date';
    static MESSAGE_MIN_DATE = '{attribute} - must be later than {date}';
    static MESSAGE_MAX_DATE = '{attribute} - must be earlier than {date}';

    constructor({
                    messageNotDate,
                    messageMaxDate,
                    messageMinDate,
                    maxDate,
                    minDate
    } = {}) {
        super();

        if (minDate && !(utils.isDate(minDate) || utils.isMoment(minDate))) {
            throw new Error('DateValidator - minDate must be a Date or moment instance');
        }

        if (maxDate && !(utils.isDate(maxDate) || utils.isMoment(maxDate))) {
            throw new Error('DateValidator - maxDate must be a Date or moment instance');
        }

        this.messageNotDate = messageNotDate;
        this.messageMaxDate = messageMaxDate;
        this.messageMinDate = messageMinDate;
        this.maxDate = maxDate;
        this.minDate = minDate;
    }

    validate(value, attribute) {
        // Empty values are fine
        if (!utils.isDefined(value)) {
            return Promise.resolve();
        }

        if (!(utils.isDate(value) || utils.isMoment(value))) {
            return Promise.reject(this.createMessage(this.messageNotDate || DateValidator.MESSAGE_NOT_DATE, {
                attribute
            }));
        }

        if (this.minDate && !(value >= this.minDate)) {
            return Promise.reject(this.createMessage(this.messageMinDate || DateValidator.MESSAGE_MIN_DATE, {
                attribute,
                date: this.minDate
            }));
        }

        if (this.maxDate && !(value <= this.maxDate)) {
            return Promise.reject(this.createMessage(this.messageMaxDate || DateValidator.MESSAGE_MAX_DATE, {
                attribute,
                date: this.maxDate
            }));
        }

        return Promise.resolve();
    }
}

