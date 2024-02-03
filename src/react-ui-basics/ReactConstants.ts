import React, {useEffect, useReducer, useRef} from 'react';

const EMPTY = {};
export const props: <P>(that: React.Component<P>) => P = that => that.props;
export const propsGetter: <P>(that: React.Component<P>) => (() => P) = that => () => props(that);
// @ts-ignore //ignore incompatible casting EMPTY to S
export const state: <P, S>(that: React.Component<P, S>) => S = that => that.state || EMPTY;
export const setState = (that: React.Component, data, cb?) => {
    that.setState(data, cb);
};
export const stateFieldSetter = (that, key, cb?: () => void) => (value, cb2?) => {
    setState(that, {[key]: value}, cb2 || cb);
};
export const stateGS: (<T>(that: React.Component) => (v?: T, cb?: () => void) => T) = (that) => {
    !that['sfc'] && (that['sfc'] = 0);
    const key = '_' + (that['sfc']++);
    const setter = stateFieldSetter(that, key);
    const result = function () {
        return !arguments.length ? state(that)[key] : setter.apply(null, arguments);
    };
    result.toString = () => key;
    return result;
};
export const stateGSs = (that, num) => {
    const result = [];
    for (let i = 0; i < num; i++) {
        result.push(stateGS(that));
    }
    return result;
};

const useSyncExternalStoreShim = (subscribe, getSnapshot) => {
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    const cb = useRef();
    cb.current = getSnapshot;
    let value = getSnapshot()

    useEffect(() => subscribe(() => {
        let next = cb.current()
        if (value !== next) {
            value = next
            forceUpdate()
        }
    }), []);
    return value
}

export const useSyncExternalStore = React.useSyncExternalStore || useSyncExternalStoreShim

export const componentDidMount = 'componentDidMount';
export const componentWillUnmount = 'componentWillUnmount';
export const componentDidUpdate = 'componentDidUpdate';
export const render = 'render';
export const children = 'children';
export const className = 'className';
export const onClick = 'onClick';
export const onChange = 'onChange';
export const PureComponent = React.PureComponent;

export default [componentDidMount, componentWillUnmount, componentDidUpdate, render, children, className, onClick, onChange]