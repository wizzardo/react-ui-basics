import React from 'react';
import {mount} from 'enzyme';
import Store, {useStore} from "./Store";
import {act} from 'react-dom/test-utils';

it('basic test, rerender on each change', () => {
    const store = new Store({
        count: 0,
        value: ''
    });
    let renderCount = 0
    const MyComponent = () => {
        let s = useStore(store);
        renderCount++
        return <div>{s.count}</div>;
    };
    const wrapper = mount(<MyComponent/>);
    expect(wrapper).toHaveHTML('<div>0</div>');
    expect(renderCount).toBe(1);

    act(() => {
        store.set(it => {
            it.count++
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(2);

    act(() => {
        store.set(it => {
            it.value = 'foo'
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(3);

    act(() => {
        store.set(it => {
            it.value = 'bar'
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(4);
});


it('no rerender if selector value doesn\'t change', () => {
    const store = new Store({
        count: 0,
        value: ''
    });
    let renderCount = 0
    const MyComponent = () => {
        let count = useStore(store, it => it.count);
        renderCount++
        return <div>{count}</div>;
    };
    const wrapper = mount(<MyComponent/>);
    expect(wrapper).toHaveHTML('<div>0</div>');
    expect(renderCount).toBe(1);

    act(() => {
        store.set(it => {
            it.count++
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(2);

    act(() => {
        store.set({
            value: 'foo'
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(2);

    act(() => {
        store.set({
            value: 'bar'
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(2);
});

it('update value if selector dependencies change', () => {
    const store = new Store({
        key: 'foo',
        foo: 'foo',
        bar: 'bar',
    });
    let renderCount = 0
    let renderedValue = []

    const MyComponent = () => {
        let key = useStore(store, it => it.key);
        let value = useStore(store, it => it[key], [key]);
        renderCount++
        renderedValue.push(value)
        return <div>{value}</div>;
    };
    const wrapper = mount(<MyComponent/>);
    expect(wrapper).toHaveHTML('<div>foo</div>');
    expect(renderCount).toBe(1);
    expect(renderedValue).toEqual(['foo']);

    act(() => {
        store.set(it => {
            it.key = 'bar'
        })
    });
    expect(wrapper).toHaveHTML('<div>bar</div>');
    expect(renderCount).toBe(2);
    expect(renderedValue).toEqual(['foo', 'bar']);
});