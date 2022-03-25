import React from 'react';

const EMPTY = {};
export const props: <P>(that: React.Component<P>) => P = that => that.props;
export const propsGetter: <P>(that: React.Component<P>) => (() => P) = that => () => props(that);
// @ts-ignore //ignore incompatible casting EMPTY to S
export const state: <P, S>(that: React.Component<P, S>) => S = that => that.state || EMPTY;
export const setState = (that, data, cb?) => {
    that.setState(data, cb);
};
export const stateFieldSetter = (that, key, cb?) => (value, cb2?) => {
    setState(that, {[key]: value}, cb2 || cb);
};
export const stateGS: ((that: React.Component) => (v?, cb?) => any) = (that) => {
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