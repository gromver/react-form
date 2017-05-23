import { is } from 'immutable'
import { PendingState, SuccessState, WarningState, ErrorState, PristineState } from './states'
import utils from './utils'

export default class StateTracker {
    constructor(onPushState) {
        this.onPushState = onPushState;
    }

    cache = {};
    state = {};

    onPushState;

    // todo uncachable validator?
    validateAttribute(model, attribute, validator) {
        const cached = this.cache[attribute];
        const value = utils.getModelAttribute(model, attribute);

        let isChanged = true;

        if (cached) {
            const [ cachedValue, cachedValidator ] = cached;

            isChanged = !is(value, cachedValue) || !is(validator, cachedValidator);
        }

        if (isChanged) {
            let skip = false;

            const curState = this.getAttributeState(attribute);

            if (curState instanceof PendingState) {
                curState.abort();
            }

            const job = validator.validate(value, attribute, model).then(warningMessage => {
                if (!skip) {
                    const state = warningMessage ? new WarningState({
                        attribute,
                        message: warningMessage
                    }) : new SuccessState({
                        attribute
                    });

                    this.cache[attribute] = [ value, validator ];

                    this.setAttributeState(attribute, state);

                    this.pushState(state);

                    return state;
                }
            }).catch(errorMessage => {
                if (!skip) {
                    const state = new ErrorState({
                        attribute,
                        message: errorMessage
                    });

                    this.cache[attribute] = [ value, validator ];

                    this.setAttributeState(attribute, state);

                    this.pushState(state);

                    return state;
                }
            });

            Promise.race([job, new Promise(r => setTimeout(() => r(new PendingState({
                attribute
            }, () => skip = true)), 0))]).then(state => {
                if (state instanceof PendingState) {
                    this.setAttributeState(attribute, state);

                    this.pushState(state);
                }
            });

            return job;
        } else {
            return Promise.resolve(this.getAttributeState(attribute));
        }
    }

    changingAttribute(attribute) {
        const state = new PristineState({
            attribute
        });

        this.setAttributeState(attribute, state);

        this.pushState(state);
    }

    pushState(changes) {
        this.onPushState && this.onPushState(changes);
    }

    setAttributeState(attr, state) {
        this.state[attr] = state;
    }

    getAttributeState(attribute) {
        return this.state[attribute] || new PristineState({
                attribute
            });
    }
}