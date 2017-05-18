export default class Message extends String {
    constructor(message, bindings) {
        super();

        this.message = message;
        this.bindings = bindings;
    }

    static formatMessage(message, bindings) {
        Object.entries(bindings).forEach(([k, v]) => {
            message = message.replace(new RegExp("\\{" + k + "\\}", "g"), v);
        });

        return message;
    }

    toString() {
        return Message.formatMessage(this.message, this.bindings);
    }
}