import {useEffect, useState} from "react";
import {createProxy} from "./ProxyTools";
import {isFunction, isObject} from "../Tools";

interface Stores {
    [index: number]: any
}

let STORES: Stores = {}
let COUNTER = 0

type Setter<T> = (oldState: T) => T | void;

abstract class AbstractStore<T> {
    get: () => T;
    set: (setter: T | Partial<T> | (Setter<T>)) => void;
    reset: () => void;
    subscribe: (fn: () => void) => void;
    unsubscribe: (fn: () => void) => void;
    toString: () => string;
}

export class Store<T> extends AbstractStore<T> {

    constructor(initialState: T, name?: string) {
        super()
        let that = this;
        let listeners: Array<() => void> = []
        let index = '' + COUNTER++;
        let runListeners = () => {
            listeners.forEach(fn => fn())
        };

        STORES[index] = initialState

        that.unsubscribe = (fn: () => void) => {
            let i = listeners.indexOf(fn)
            let length = listeners.length;
            if (i > -1) {
                listeners[i] = listeners[length - 1]
                listeners.splice(length - 1, 1)
            }
        }
        that.get = (): T => STORES[index]
        that.set = (setter) => {
            let result;
            if (isFunction(setter)) {
                const proxy = createProxy(STORES[index]);
                result = (setter as Setter<T>)(proxy);
                if (!result || result === proxy)
                    result = proxy.bake()
            } else if (isObject(setter)) {
                result = {...STORES[index], ...setter}
            } else {
                result = setter
            }

            STORES[index] = result
            runListeners();
        }

        that.reset = () => {
            STORES[index] = initialState
            runListeners();
        }

        that.subscribe = (fn: () => void) => {
            listeners.push(fn)
        }

        that.toString = (): string => name;
    }
}

export default Store;

export function getGlobalState() {
    return STORES
}

export function resetGlobalState() {
    STORES = {}
}

export function replaceGlobalState(state) {
    STORES = state
}


export type Selector<T, R> = (t: T) => R;

export const defaultSelector = <T>(store: T): T => store;

export function useStore<T, R>(store: Store<T>, selector: Selector<T, R>, selectorDependencies: ReadonlyArray<any>): R
export function useStore<T>(store: Store<T>, selector?: undefined, selectorDependencies?: undefined): T
export function useStore<T, R>(store: Store<T>, selector?: Selector<T, R>, selectorDependencies: ReadonlyArray<any> = []): R {
    if (!selector)
        selector = (defaultSelector as Selector<T, R>)

    const [state, setState] = useState(() => selector(store.get()))

    useEffect(() => {
        const updateState = () => {
            setState(selector(store.get()))
        };
        updateState()
        store.subscribe(updateState)
        return () => {
            store.unsubscribe(updateState);
        }
    }, selectorDependencies)

    return state
}