import {useEffect, useReducer} from "react";
import {createProxy} from "./ProxyTools";
import {isFunction, isObject} from "../Tools";

const STORES = new Map<Symbol, Store<any>>()

type Setter<T> = (oldState: T) => T | void;
type ListenerFn = () => void;
type UnsubscribeFn = () => void;

abstract class AbstractStore<T> {
    get: () => T;
    set: (setter: T | Partial<T> | (Setter<T>)) => void;
    reset: () => void;
    /**
     * Return unsubscribe function
     *
     * @returns unsubscribe function.
     */
    subscribe: (fn: ListenerFn) => UnsubscribeFn;
    toString: () => string;
}


export class Store<T> extends AbstractStore<T> {

    constructor(initialState: T, name?: string) {
        super()
        let that = this;
        let listeners: Map<Symbol, ListenerFn> = new Map<Symbol, () => void>()
        let value = initialState;
        let runListeners = () => {
            for (let listener of listeners.values()) {
                listener()
            }
        };
        that.get = (): T => value;
        that.set = (setter) => {
            let result;
            if (isFunction(setter)) {
                const proxy = createProxy(value as object);
                result = (setter as Setter<T>)(proxy);
                if (!result || result === proxy)
                    result = proxy.bake()
            } else if (isObject(setter)) {
                result = {...value, ...setter}
            } else {
                result = setter
            }

            value = result
            runListeners();
        }
        that.reset = () => {
            value = initialState
            runListeners();
        }

        that.subscribe = (fn: ListenerFn) => {
            const key = Symbol();
            listeners.set(key, fn)
            return () => {
                listeners.delete(key)
            }
        }

        that.toString = (): string => name;
        STORES.set(Symbol(), that)
    }
}

export default Store;

export function getGlobalState() {
    return STORES
}

export type Selector<T, R> = (t: T) => R;

export const defaultSelector = <T>(store: T): T => store;

export function useStore<T, R>(store: Store<T>, selector: Selector<T, R>, selectorDependencies: ReadonlyArray<any>): R
export function useStore<T, R>(store: Store<T>, selector: Selector<T, R>, selectorDependencies?: undefined): R
export function useStore<T>(store: Store<T>, selector?: undefined, selectorDependencies?: undefined): T
export function useStore<T, R>(store: Store<T>, selector?: Selector<T, R>, selectorDependencies: ReadonlyArray<any> = []): R {
    if (!selector)
        selector = (defaultSelector as Selector<T, R>)

    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    let value = selector(store.get())

    useEffect(() => {
        const updateState = () => {
            let next = selector(store.get())
            if (value !== next) {
                value = next
                forceUpdate()
            }
        };
        return store.subscribe(updateState)
    }, selectorDependencies)

    return value
}