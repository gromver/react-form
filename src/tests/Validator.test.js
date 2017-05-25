import { Validator } from '../validators';
import { is } from 'immutable';

describe('Test Validator.js', () => {
    test('Validator.construct() test', () => {
        const validator = new Validator();

        expect(validator).toBeInstanceOf(Validator);
    });

    test('Immutable is() test', async () => {
        const validatorA = new Validator();
        let validatorB = new Validator();

        validatorA.foo = validatorB.foo = 'bar';

        expect(is(validatorA, validatorB)).toBe(true);
        expect(is(validatorA, validatorB.cache(false))).toBe(false);

        validatorB.duration(250);

        const fn = jest.fn();

        await new Promise((resolve) => {
            let steps = 6;

            const tick = () => {
                if (steps--) {
                    setTimeout(() => {
                        fn(is(validatorA, validatorB));

                        tick();
                    }, 50);
                } else {
                    resolve();
                }
            };

            tick();
        });

        expect(fn.mock.calls).toEqual([[true], [false], [false], [false], [false], [true]]);

        expect(is(validatorA, validatorB.cache(true))).toBe(true);

        validatorB = new Validator();
        validatorB.foo = 'abc';

        expect(is(validatorA, validatorB)).toBe(false);
    });

    test('Validator is() test', () => {
        const validatorA = new Validator();
        let validatorB = new Validator();

        validatorA.foo = validatorB.foo = 'bar';

        expect(Validator.is(validatorA, validatorB)).toBe(true);
        expect(Validator.is(validatorA, validatorB.cache(false))).toBe(false);
        expect(Validator.is(validatorA, validatorB.cache(true))).toBe(true);

        validatorB = new Validator();
        validatorB.foo = 'abc';

        expect(Validator.is(validatorA, validatorB)).toBe(false);
    });
});