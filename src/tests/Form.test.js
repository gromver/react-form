import { Form, StateTracker } from '..';
import { SuccessState, PendingState, WarningState, ErrorState, PristineState } from '../states';
import { MultiValidator, PresenceValidator, UrlValidator, CustomValidator } from '../validators';
import { fromJS, Map } from 'immutable';
import ValidatorsFormTest from './forms/ValidatorsTestForm';

describe('Test Form.js', () => {
    const data = { presence: 'bar' };

    const form = new ValidatorsFormTest(data);

    test('construct()', () => {
        expect(form.model).toBeInstanceOf(Map);

        expect(form.model.toJS()).toMatchObject({
            ...data,
            url: ''
        });
    });

    test('buildRules', () => {
        expect(form.buildRules()).toEqual(expect.objectContaining({
            presence: expect.any(PresenceValidator),
            url: expect.any(UrlValidator),
            multi: expect.any(MultiValidator)
        }));
    });

    test('setAttributes', () => {
        form.setAttributes({
            presence: 'bar',
            url: 'http://yandex.ru',
            multi: 'http://google.com'
        });

        expect(form.model.toJS()).toMatchObject({
            presence: 'bar',
            url: 'http://yandex.ru',
            multi: 'http://google.com'
        });
    });

    test('validateAttributes', () => {
        const subscriber = jest.fn(state => console.log('ST', state));

        const subscription = form.subscribe(subscriber);

        return form.validateAttributes(['presence', 'url', 'multi']).catch(() => {
            // expect(subscriber).toHaveBeenCalledWith(expect.any(SuccessState));
            expect(subscriber.mock.calls[0][0]).toEqual(expect.any(SuccessState));
            expect(subscriber.mock.calls[1][0]).toEqual(expect.any(PendingState));
            expect(subscriber.mock.calls[2][0]).toEqual(expect.any(ErrorState));

            subscription.unsubscribe();
        });
    });

});

describe('getFirstError life cycle', () => {
    const form = new ValidatorsFormTest();

    form.setAttribute('url', 'not valid');

    test('check url', async () => {
        await form.validateAttributes('url').catch(() => Promise.resolve());

        const error = form.getFirstError();

        expect(error).toBeInstanceOf(ErrorState);
        expect(error.attribute).toBe('url');
    });

    test('check order', async () => {
        form.setAttribute('multi', 'not valid');

        await form.validateAttributes('multi').catch(() => Promise.resolve());

        let error = form.getFirstError();

        expect(error).toBeInstanceOf(ErrorState);
        expect(error.attribute).toBe('url');

        await form.validateForm().catch(() => Promise.resolve());

        error = form.getFirstError();

        expect(error).toBeInstanceOf(ErrorState);
        expect(error.attribute).toBe('presence');
    });
});