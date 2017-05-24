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

    __hash = undefined;
    __isCached = true;

    cache(bool) {
        this.__hash = undefined;
        this.__isCached = bool;

        return this;
    }

    equals(other) {
        return this.__isCached ? this.hashCode() === other.hashCode() : false;
    }

    hashCode() {
        if (this.__hash) {
            return this.__hash;
        } else {
            const map = new Map(this);

            return this.__hash = map.hashCode();
        }
    }
}
