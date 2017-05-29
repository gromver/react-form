import { Model } from 'rx-model';
import { PresenceValidator, StringValidator } from 'rx-model/validators';

export default class TestModel extends Model {
// eslint-disable-next-line class-methods-use-this
  prepareSourceData(data) {
    return {
      name: '',
      password: '',
      ...data,
    };
  }

// eslint-disable-next-line class-methods-use-this
  rules() {
    return {
      name: new PresenceValidator(),
      password: [
        new PresenceValidator(),
        new StringValidator({
          minLength: 6,
        }),
      ],
    };
  }
}
