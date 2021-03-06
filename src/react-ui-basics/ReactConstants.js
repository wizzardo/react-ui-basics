import React from 'react';

const EMPTY = {};
export const props = that => that.props;
export const propsGetter = that => () => props(that);
export const state = that => that.state || EMPTY;
export const setState = (that, data, cb) => {
    that.setState(data, cb);
};
export const stateFieldSetter = (that, key, cb) => (value, cb2) => {
    setState(that, {[key]: value}, cb2 || cb);
};
export const stateGS = (that) => {
    !that.sfc && (that.sfc = 0);
    const key = '_' + (that.sfc++);
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
export const PureComponent = React.PureComponent;