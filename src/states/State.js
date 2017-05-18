/**
 * Created by roman on 25.04.17.
 */

export default class State {
    attribute;
    message;

    constructor({ attribute, message }) {
        this.attribute = attribute;
        this.message = message;
    }
}
