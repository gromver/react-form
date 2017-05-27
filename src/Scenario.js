/**
 * Created by roman on 19.04.17.
 */

export default class Scenario {
    static APPLY_IN = 'IN';
    static APPLY_EXCEPT = 'EXCEPT';

    apply = Scenario.APPLY_EXCEPT;
    scenarios = [];
    validator;

    constructor(apply, scenarios, validator) {
        if (!(apply === Scenario.APPLY_EXCEPT || apply === Scenario.APPLY_IN)) {
            throw new Error('Scenario::constructor apply property has invalid value');
        }

        if (!Array.isArray(scenarios)) {
            throw new Error('Scenario::constructor scenarios property must be an array');
        }

        if (!validator) {
            throw new Error('Scenario::constructor validator property must be set');
        }

        this.apply = apply;
        this.scenarios = scenarios;
        this.validator = validator;
    }

    static in(scenarios, validator) {
        return new Scenario(Scenario.APPLY_IN, scenarios, validator);
    }

    static except(scenarios, validator) {
        return new Scenario(Scenario.APPLY_EXCEPT, scenarios, validator);
    }
}