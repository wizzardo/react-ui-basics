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

export type Callback = () => void;
export function createStateGetterSetter<C extends React.Component, K extends keyof C["state"]>(that: C, key: K, cb?: Callback): {
    (): C["state"][K];
    (value: C["state"][K], cb2?: Callback): void;
} {
    return ((value?: C["state"][K], cb2?: Callback): C["state"][K] => {
        if (arguments.length === 0) {
            // getter
            // @ts-ignore
            return that.state[key];
        } else {
            // setter
            that.setState({[key]: value} as any, cb2 ?? cb);
        }
    }) as any;
}

type GetterSetter<T> = (v?: T, cb?: () => void) => T;
export const stateGS: (<T>(that: React.Component) => GetterSetter<T>) = (that) => {
    !that['sfc'] && (that['sfc'] = 0);
    const key = '_' + (that['sfc']++);
    const setter = stateFieldSetter(that, key);
    const result = function () {
        return !arguments.length ? state(that)[key] : setter.apply(null, arguments);
    };
    result.toString = () => key;
    return result;
};

type TupleToGetterSetter<T extends any[]> = {
    [K in keyof T]: GetterSetter<T[K]>;
};
export const stateGSs = <T extends any[]>(that, num): TupleToGetterSetter<T> => {
    const result = [];
    for (let i = 0; i < num; i++) {
        result.push(stateGS(that));
    }
    return result as TupleToGetterSetter<T>;
};

type GetSnapshot<T> = () => T;
type Subscribe = (onStoreChange: () => void) => () => void;
const useSyncExternalStoreShim = <T>(subscribe: Subscribe, getSnapshot: GetSnapshot<T>) => {
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    const cb = useRef<GetSnapshot<T>>();
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

export const useSyncExternalStore = React['useSyncExternalStore'] || useSyncExternalStoreShim

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