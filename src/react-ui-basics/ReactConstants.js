import React from 'react';

const EMPTY = {};
export const props = that => that.props;
export const propsGetter = that => () => props(that);
export const state = that => that.state || EMPTY;
export const setState = (that, data, cb) => that.setState(data, cb);
export const stateFieldSetter = (that, key, cb) => value => setState(that, {[key]: value}, cb);
export const stateGS = (that, num) => {
    num = num || 1;
    const result = [];
    if (!that.sfc) that.sfc = 0;
    for (let i = 0; i < num; i++) {
        let key = '_' + (that.sfc++);
        result.push(
            () => state(that)[key],
            stateFieldSetter(that, key)
        )
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