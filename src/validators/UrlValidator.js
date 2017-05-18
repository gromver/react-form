import Validator from './Validator'
import utils from '../utils'

export default class UrlValidator extends Validator {
    static MESSAGE = '{attribute} - is not a valid url';

    constructor({
                    message,
                    schemes = ['http', 'https'],
                    allowLocal = false
    } = {}) {
        super();

        this.message = message;
        this.schemes = schemes;
        this.allowLocal = allowLocal;
    }

    validate(value, attribute) {
        // Empty values are fine
        if (!utils.isDefined(value)) {
            return Promise.resolve();
        }

        if (!utils.isString(value)) {
            return Promise.reject(this.createMessage(this.message || UrlValidator.MESSAGE, {
                attribute
            }));
        }

        // https://gist.github.com/dperini/729294
        let regex =
            "^" +
            // protocol identifier
            "(?:(?:" + this.schemes.join("|") + ")://)" +
            // user:pass authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:";

        let tld = "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))";

        if (this.allowLocal) {
            tld += "?";
        } else {
            regex +=
                // IP address exclusion
                // private & local networks
                "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})";
        }

        regex +=
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
            // host name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
            // domain name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
            tld +
            ")" +
            // port number
            "(?::\\d{2,5})?" +
            // resource path
            "(?:[/?#]\\S*)?" +
            "$";

        const PATTERN = new RegExp(regex, 'i');

        if (!PATTERN.exec(value)) {
            return Promise.reject(this.createMessage(this.message || UrlValidator.MESSAGE, {
                attribute
            }));
        }

        return Promise.resolve();
    }
}

