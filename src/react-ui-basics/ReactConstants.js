import React from 'react';

const EMPTY = {};
export const props = that => that.props;
export const state = that => that.state || EMPTY;
export const setState = (that, data, cb) => that.setState(data, cb);
export const stateSetter = (that, key, cb) => value => setState(that, {[key]: value}, cb);
export const stateGS = (that, key, value) => {
    if (!key) {
        if (!that.sfc) that.sfc = 0;
        key = '_' + that.sfc++
    }
    const setter = stateSetter(that, key);
    setter(value);
    return [
        () => state(that)[key],
        setter,
    ];
};

export const componentDidMount = 'componentDidMount';
export const componentWillUnmount = 'componentWillUnmount';
export const componentDidUpdate = 'componentDidUpdate';
export const render = 'render';
export const children = 'children';
export const className = 'className';
export const PureComponent = React.PureComponent;