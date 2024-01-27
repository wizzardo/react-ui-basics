import React from 'react';
import {mount} from 'enzyme';
import Store, {useStore} from "./Store";
import {act} from 'react-dom/test-utils';

it('test 1', () => {
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


it('test 2', () => {
    const store = new Store({
        count: 0,
        value: ''
    });
    let renderCount = 0
    const MyComponent = () => {
        let count = useStore(store, it=> it.count);
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
    // react executes functional-component after first setState with the same value
    expect(renderCount).toBe(3);

    act(() => {
        store.set({
            value: 'bar'
        })
    });
    expect(wrapper).toHaveHTML('<div>1</div>');
    expect(renderCount).toBe(3);
});