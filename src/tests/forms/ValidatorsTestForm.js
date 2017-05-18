import { Form } from '../..';
import { MultiValidator, PresenceValidator, UrlValidator, CustomValidator } from '../../validators';

export default class ValidatorsTestForm extends Form {
    prepareSourceModel(model) {
        return {
            ...model,
            url: ''
        }
    }

    getRules() {
        return {
            presence: new PresenceValidator(),
            url: new UrlValidator(),
            multi: [
                new PresenceValidator(),
                new UrlValidator(),
                new CustomValidator({
                    func: (value, attribute) => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                if (value === 'http://yandex.ru') {
                                    resolve();
                                } else {
                                    reject(value + ' is wrong!');
                                }
                            }, 500);
                        })
                    }
                })
            ]
        }
    }
}