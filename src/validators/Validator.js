import Message from './Message'

export default class Validator {
    createMessage(message, bindings) {
        return new Message(message, bindings);
    }

    validate(value, attribute, model) {
        return Promise.resolve();
    }
}
