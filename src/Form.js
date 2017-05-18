import { fromJS, Iterable } from 'immutable'
import { Subject } from 'rxjs/Subject'
import { SuccessState, WarningState, ErrorState } from './states'
import StateTracker from './StateTracker'
import { Validator, MultiValidator } from './validators'
import utils from './utils'

export default class Form {
    model;

    initialModel;

    dirtyAttributes;

    /*
     * @param StateTracker
     */
    stateTracker;

    stream = new Subject();

    constructor(rawModel = {}) {
        const model = fromJS(this.prepareSourceModel(rawModel));

        this.onStateChange = this.onStateChange.bind(this);

        this.stateTracker = new StateTracker(this.onStateChange);

        this.model = this.initialModel = model;

        this.dirtyAttributes = [];
    }

    subscribe(cb) {
        return this.stream.subscribe(cb);
    }

    onStateChange(state) {
        this.stream.next(state);
    }

    // EXTEND THIS
    getRules() {
        return {};
    }

    // EXTEND THIS
    // инициализация и подготовка модели с которой будет работать форма
    // @return Object
    // Важно! возвращаемый объект должен быть простым - тоесть без наследования либо объектом Immutable.Map
    // Важно! описывать логику получения модели исходя из того, что state еще не инициализирован - то есть, писать логику на основе this.props
    prepareSourceModel(model) {
        return {
            ...model
        };
    }

    // EXTEND THIS
    // подготовка модели перед событием onSubmit
    prepareResultModel(model) {
        return model;
    }

    _builtRules;

    getBuiltRules() {
        if (this._builtRules) {
            return this._builtRules;
        } else {
            const rules = this.buildRules();

            this.setBuiltRules(rules);

            return rules;
        }
    }

    setBuiltRules(rules) {
        this._builtRules = rules;
    }

    buildRules() {
        const rules = {};

        Object.entries(this.getRules()).forEach(([attribute, validator]) => {
            if (typeof validator === 'function') {
                validator = validator.call(this);
            } else if (Array.isArray(validator)) {
                validator = new MultiValidator({
                    validators: this.normalizeValidatorsArray(validator)
                });
            }

            if (!(validator instanceof Validator)) {
                throw new Error('buildRules - правила должны быть наследниками Validator')
            }

            rules[attribute] = validator;
        });

        return rules;
    }

    invalidateRules() {
        this._builtRules = null;
    }

    normalizeValidatorsArray(items) {
        return items.map(validator => {
            if (typeof validator === 'function') {
                validator = validator.call(this);
            }

            if (!(validator instanceof Validator)) {
                throw new Error('normalizeValidatorsArray - правила должны быть наследниками Validator')
            }

            return validator;
        });
    }

    /**
     * Устанавливает значение поля модели, поддержка глубинной установки значение: this.setAttribute('foo.bar', value)
     * @param attribute
     * @param value
     */
    setAttribute(attribute, value) {
        // this.modelProcessor.changeAttribute(attribute, value);
        this.model = this.model.setIn(utils.resolveAttribute(attribute), value);

        this.stateTracker.changingAttribute(attribute);
    }

    setAttributes(values) {
        this.model = this.model.withMutations(model => {
            Object.entries(values).forEach(([attribute, value]) => {
                // this.modelProcessor.changeAttribute(attribute, value);
                model.setIn(utils.resolveAttribute(attribute), value);

                this.stateTracker.changingAttribute(attribute);
            });
        });
    }

    getAttribute(attribute) {
        const { model } = this;

        const value = model.getIn(utils.resolveAttribute(attribute));

        return Iterable.isIterable(value) ? value.toJS() : value;
    }

    getInitialAttribute(attribute) {
        const { initialModel: model } = this;

        const value = model.getIn(utils.resolveAttribute(attribute));

        return Iterable.isIterable(value) ? value.toJS() : value;
    }

    isValidForm() {
        
    }

    isDirtyForm() {
        const { model, initialModel } = this;

        return !model.equals(initialModel);
    }

    isDirtyAttribute(attribute) {
        const { model, initialModel, dirtyAttributes } = this;

        const path = utils.resolveAttribute(attribute);

        return model.getIn(path) !== initialModel.getIn(path) || dirtyAttributes.indexOf(attribute) !== -1;
    }

    isChangedAttribute(attribute) {
        return this.getAttribute(attribute) !== this.getInitialAttribute(attribute);
    }

    // состояние поля (PendingState, WarningState, SuccessState, ErrorState)
    getValidationState(attribute) {
        const state = this.stateTracker.getAttributeState(attribute);

        return state && state.state || null;
    }

    // сообщение ошибки
    getValidationError(attribute) {
        const state = this.stateTracker.getAttributeState(attribute);

        return state && (state instanceof ErrorState) && state.message || null;
    }

    getValidationErrors() {
        return Object.values(this.stateTracker.state).filter(state => state instanceof ErrorState);
    }

    // сообщение вне зависимости от типа состояния
    getValidationMessage(attribute) {
        const state = this.stateTracker.getAttributeState(attribute);

        return state && state.message || null;
    }

    // сообщение варнинга
    getValidationWarning(attribute) {
        const state = this.stateTracker.getAttributeState(attribute);

        return state && (state instanceof WarningState) && state.message || null;
    }

    hasErrors() {
        return !!Object.values(this.stateTracker.state).find(state => state instanceof ErrorState);
    }

    // @return state
    getFirstError() {
        const errors = Object.values(this.stateTracker.state).filter(state => state instanceof ErrorState).map(state => state.attribute);
        const rules = Object.keys(this.getBuiltRules());
        const firstErrorAttribute = rules.find(attribute => errors.indexOf(attribute) !== -1);

        return firstErrorAttribute ? this.stateTracker.getAttributeState(firstErrorAttribute) : undefined;
    }

    // возвращает подготовленную модель, если useValidation = true, то возвращается промис с обещанием отдать модель при условии валидности формы
    getModel(useValidation = false) {
        return !useValidation ? this.prepareResultModel(this.model.toJS()) : this.validateForm().then(() => this.prepareResultModel(this.model.toJS()));
    }

    // @return Promise.resolve(isSuccessful)
    validateAttributes(attributes, onlyDirtyAttributes = true) {
        if (typeof attributes === 'string') {
            attributes = [ attributes ];
        }

        if (onlyDirtyAttributes) {
            attributes = attributes.filter(i => this.isDirtyAttribute(i));
        }

        let attrsToCheck;

        attrsToCheck = [...new Set([...this.dirtyAttributes, ...attributes])];

        const rules = this.getBuiltRules();

        const jobs = [];

        attrsToCheck.forEach(attribute => {
            const validator = rules[attribute];

            if (validator) {
                jobs.push(this.stateTracker.validateAttribute(this.model, attribute, validator));
            }
        });

        this.dirtyAttributes = attrsToCheck;

        return Promise.all(jobs).then(states => {
            if (states.find(state => !(state instanceof SuccessState || state instanceof WarningState))) {
                return Promise.resolve(false);
            } else {
                return Promise.resolve(true);
            }
        });
    }

    // @return Promise.resolve(isSuccessful)
    validateForm() {
        const rules = this.getBuiltRules();

        const jobs = [];

        Object.entries(rules).forEach(([attribute, validator]) => {
            if (validator) {
                jobs.push(this.stateTracker.validateAttribute(this.model, attribute, validator));
            }
        });

        this.dirtyAttributes = Object.keys(rules);

        return Promise.all(jobs).then(states => {
            if (states.find(state => !(state instanceof SuccessState || state instanceof WarningState))) {
                return Promise.resolve(false);
            } else {
                return Promise.resolve(true);
            }
        });
    }
}