import Message from './Message'
import { Map } from 'immutable'

export default class Validator {
    createMessage(message, bindings) {
        return new Message(message, bindings);
    }

    validate(value, attribute, model) {
        return Promise.resolve();
    }

    static is(a, b) {
        if (a === b) return true;

        if (a instanceof Validator && b instanceof Validator && a.constructor === b.constructor) {
            return a.equals(b);
        }

        return false;
    }

    __hash;
    __getTrueValue;
    __isCached = true;

    // behavior modifiers
    /**
     * Enable/disable caching
     * @param bool
     * @returns {Validator}
     */
    cache(bool) {
        this.__isCached = bool;

        return this;
    }

    duration(milliseconds) {
        if (milliseconds) {
            this.__getTrueValue = this.throttledTrueValue(milliseconds);
        } else {
            this.__getTrueValue = undefined;
        }

        return this;
    }

    // valueObject interface implementation
    equals(other) {
        if (this.hashCode() === other.hashCode()) {
            const isCached = this.__isCached && other.__isCached,
                getTrueValue = this.__getTrueValue || other.__getTrueValue;

            return isCached ? true : (getTrueValue ? getTrueValue() : false);
        } else {
            return false;
        }
    }

    throttledTrueValue(duration) {
        let isThrottled = false;

        return () => {
            if (!isThrottled) {
                isThrottled = true;

                setTimeout(() => {
                    isThrottled = false;
                }, duration);

                return true;
            } else {
                return false;
            }
        };
    }

    hashCode() {
        if (this.__hash) {
            return this.__hash;
        } else {
            const props = {};

            const exclude = /^__/;

            Object.entries(this).forEach(([k, v]) => {
                if (!exclude.test(k)) {
                    props[k] = v;
                }
            });

            const map = new Map(props);

            return this.__hash = map.hashCode();
        }
    }
}
