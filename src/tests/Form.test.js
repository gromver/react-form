import Form from '../Form';
import TestModel from './models/TestModel';

describe('Test Form.js', () => {
  const data = { };

  test('construct()', () => {
    const model = new TestModel(data);

    const form = new Form(model);

    expect(form).toBeInstanceOf(Form);
  });

  test('set() & get()', () => {
    const model = new TestModel(data);

    const form = new Form(model);

    form.set('foo', 'bar');

    expect(form.get('foo')).toBe('bar');
  });

  test('setState()', () => {
    const model = new TestModel(data);

    const form = new Form(model);

    form.set('a', 'a');
    form.setState({
      a: 'A',
      b: 'B',
    });

    expect(form.get('a')).toBe('A');
    expect(form.get('b')).toBe('B');
  });

  test('setAttribute() and getAttribute()', () => {
    const model = new TestModel(data);

    const form = new Form(model);
    const fn = jest.fn();

    form.getModel().getObservable().subscribe(fn);

    form.setAttribute('name', 'John');

    expect(form.getAttribute('name')).toEqual('John');

    expect(form.getModel().get('name')).toEqual('John');

    form.setAttribute('name', 'Paul');

    expect(fn).toHaveBeenCalledTimes(2);

    form.setAttribute('nested.value', 123);

    expect(form.getModel().get('nested')).toEqual({
      value: 123,
    });
  });


  test('setAttributes() and getAttributes()', () => {
    const model = new TestModel(data);

    const form = new Form(model);

    form.setAttributes({
      name: 'Peter',
      password: 123,
    });

    expect(form.getAttributes()).toEqual({
      name: 'Peter',
      password: 123,
    });

    form.setAttribute('nested.value', 123);

    expect(form.getAttributes()).toEqual({
      name: 'Peter',
      nested: {
        value: 123,
      },
      password: 123,
    });
  });

  test('isFormDirty', () => {
    const model = new TestModel(data);

    let form = new Form(model);

    expect(form.isFormDirty()).toBe(false);

    form.setAttribute('name', '');

    expect(form.isFormDirty()).toBe(true);

    form = new Form(model);

    form.setAttributes({
      name: '',
      password: '',
    });

    expect(form.isFormDirty()).toBe(true);
  });

  test('isFormValid()', async () => {
    const model = new TestModel(data);

    const form = new Form(model);

    expect(form.isFormValid()).toBe(true);

    form.setAttribute('name', 'John');

    let result = await form.isFormValid();

    expect(result).toBe(true);

    await form.validate();

    result = await form.isFormValid();

    expect(result).toBe(false);

    form.setAttribute('password', '123qwe');

    await form.validate();

    result = await form.isFormValid();

    expect(result).toBe(true);
  });

  test('isFormChanged()', () => {
    const model = new TestModel();

    const form = new Form(model);

    expect(form.isFormChanged()).toBe(false);

    form.setAttribute('name', '');

    expect(form.isFormChanged()).toBe(false);

    form.setAttribute('name', 'John');

    expect(form.isFormChanged()).toBe(true);

    form.setAttribute('name', '');

    expect(form.isFormChanged()).toBe(false);
  });

  test('isAttributeDirty()', () => {
    const model = new TestModel();

    const form = new Form(model);

    expect(form.isAttributeDirty('name')).toBe(false);

    form.setAttribute('name', '');

    expect(form.isAttributeDirty('name')).toBe(true);
  });

  test('isAttributeChanged()', () => {
    const model = new TestModel();

    const form = new Form(model);

    expect(form.isAttributeChanged('name')).toBe(false);

    form.setAttribute('name', '');

    expect(form.isAttributeChanged('name')).toBe(false);

    form.setAttribute('name', 'abc');

    expect(form.isAttributeChanged('name')).toBe(true);
  });

  test('validate()', async () => {
    const model = new TestModel();

    const form = new Form(model);

    let result = await form.validate();

    expect(result).toBe(false);

    form.setAttributes({
      name: 'John',
      password: '123',
    });

    result = await form.validate();

    expect(result).toBe(false);

    form.setAttribute('password', '123qwe');

    result = await form.validate();

    expect(result).toBe(true);
  });

  test('validate and dirtyAttributes', () => {
    const model = new TestModel();

    const form = new Form(model);

    form.setAttribute('name', '');
    expect(form.dirtyAttributes).toEqual(['name']);

    form.validate();

    expect(form.dirtyAttributes).toEqual(['name', 'password']);
  });

  test('validateAttributes()', async () => {
    const validate = jest.fn(() => Promise.resolve(true));

    const model = new TestModel();
    model.validate = validate;

    const form = new Form(model);

    form.setAttributes({
      name: 'John',
    });

    await form.validateAttributes('name');

    await form.validateAttributes(['name', 'password']);

    form.setAttribute('password', '123qwe');

    await form.validateAttributes(['name', 'password']);

    expect(validate.mock.calls).toEqual([[['name']], [['name']], [['name', 'password']]]);
  });
});

describe('FormStateSubject', async () => {
  test('subscribe', async () => {
    const model = new TestModel();
    const form = new Form(model);
    const observer = jest.fn();

    const observable = form.getObservable();
    observable.subscribe(observer);

    form.setState({ a: '' });
    form.setAttribute('name', '');
    await form.validate();
    expect(observer).toHaveBeenCalledTimes(0);

    observable.whenFormChanged();
    form.setState({ a: '' });
    form.setAttribute('name', '');
    await form.validate();

    expect(observer).toHaveBeenCalledTimes(1);

    observer.mockClear();

    observable.whenModelChanged();
    form.setScenario(form.getScenario());
    form.setState({ a: '' });
    form.setAttribute('name', '');
    await form.validate();

    expect(observer).toHaveBeenCalledTimes(4);
  });

  test('whenStateChanged', async () => {
    const model = new TestModel();
    const form = new Form(model);
    const observer = jest.fn();

    const observable = form.getObservable().whenStateChanged(['a']);
    observable.subscribe(observer);

    form.setState({ a: '' });
    form.setState({ b: '' });
    form.setState({ c: '' });
    form.setState({ a: '', b: '' });
    form.setAttribute('name', '');
    await form.validate();

    expect(observer).toHaveBeenCalledTimes(2);
  });

  test('whenSubscribed', async () => {
    const model = new TestModel();
    const form = new Form(model);
    const observer = jest.fn();

    const observable = form.getObservable();
    observable.whenSubscribed().subscribe(observer);

    expect(observer).toHaveBeenCalledTimes(1);
  });

  test('whenAttributesChanged', async () => {
    const model = new TestModel();
    const form = new Form(model);
    const observer = jest.fn();

    const observable = form.getObservable();
    observable.whenAttributesChanged(['name']).subscribe(observer);
    form.setAttribute('password', '');

    expect(observer).toHaveBeenCalledTimes(0);

    form.setAttribute('name', '');
    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toBeCalledWith(expect.objectContaining({
      model: expect.any(Object),
    }));
  });

  test('whenAttributesValid', async () => {
    const model = new TestModel();
    const form = new Form(model);
    const observer = jest.fn();

    const observable = form.getObservable();
    observable.whenAttributesValid(['name']).subscribe(observer);
    form.setAttribute('name', '');
    form.setAttribute('password', '');
    await form.validate();
    expect(observer).toHaveBeenCalledTimes(0);

    form.setAttribute('name', 'John');
    form.setAttribute('password', '123qwe');
    await form.validate();
    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toBeCalledWith(expect.objectContaining({
      model: expect.any(Object),
    }));
  });
});