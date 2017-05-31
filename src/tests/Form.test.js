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

    form.setAttribute('name', 'John');

    expect(form.getAttribute('name')).toEqual('John');

    expect(form.getModel().get('name')).toEqual('John');

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

  test('when()', () => {
    let observer = jest.fn();

    const model = new TestModel();

    const form = new Form(model);

    form.when(['foo']).subscribe(observer);
    form.set('foo', '');
    form.set('bar', '');
    form.set('foo', '');

    expect(observer.mock.calls).toEqual([[{ foo: '' }], [{ foo: '' }]]);

    observer = jest.fn();

    form.when(['foo', 'bar']).subscribe(observer);
    form.set('foo', '');
    form.set('bar', '');
    form.set('foo', '');
    form.setState({
      a: '',
      b: '',
    });
    form.setState({
      foo: '',
      bar: '',
      a: '',
      b: '',
    });

    expect(observer.mock.calls).toEqual([[{ foo: '' }], [{ bar: '' }], [{ foo: '' }], [{ foo: '', bar: '', a: '', b: '' }]]);
  });
});
