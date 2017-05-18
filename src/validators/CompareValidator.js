import Validator from './Validator'
import utils from '../utils'

export default class CompareValidator extends Validator {
    static MESSAGE = '{attribute} - must equals "{value}" value';

    constructor({
                    message,
                    compareAttribute,
                    compareValue,
                    operator
    } = {}) {
        super();

        if (!utils.isDefined(compareAttribute) && !utils.isDefined(compareValue)) {
            throw new Error('either compareAttribute or compareValue prop must be set.')
        }

        // todo add operator support ('==', '===', '!==', '!=', '<=', '>=')
        this.message = message;
        this.compareAttribute = compareAttribute;
        this.compareValue = compareValue;
        this.operator = operator;
    }

    validate(value, attribute, model) {
        // Empty values are fine
        if (!utils.isDefined(value)) {
            return Promise.resolve();
        }

        let compareValue;

        if (this.compareAttribute) {
            compareValue = utils.getModelAttribute(model, this.compareAttribute);
        } else {
            compareValue = this.compareValue;
        }

        if (value !== compareValue) {
            return Promise.reject(this.createMessage(this.message || CompareValidator.MESSAGE, {
                attribute,
                value: compareValue
            }));
        }

        return Promise.resolve();
    }
}

