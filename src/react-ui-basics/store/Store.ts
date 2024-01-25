import {useEffect, useState} from "react";
import {createProxy} from "./ProxyTools";

interface Stores {
    [index: number]: any
}

let STORES: Stores = {}
let COUNTER = 0

abstract class AbstractStore<T> {
    get: () => T;
    set: (mutator: (oldState: T) => T | void) => void;
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

        const index = COUNTER++;
        STORES[index] = initialState

        that.unsubscribe = (fn: () => void) => {
            listeners = listeners.filter(f => f !== fn)
        }
        that.get = (): T => STORES[index]

        const runListeners = () => {
            listeners.forEach(fn => fn())
        };

        that.set = (mutator: (oldState: T) => T | void) => {
            const proxy = createProxy(STORES[index]);
            const result = mutator(proxy);
            if (!result || result === proxy)
                STORES[index] = proxy.bake()
            else
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

export function useStore<T, R>(store: Store<T>, selector: Selector<T, R>): R
export function useStore<T>(store: Store<T>, selector?: undefined): T
export function useStore<T, R>(store: Store<T>, selector?: Selector<T, R>): R {
    if (!selector)
        selector = (defaultSelector as Selector<T, R>)

    const [state, setState] = useState(selector(store.get()))

    useEffect(() => {
        const updateState = () => {
            setState(selector(store.get()))
        };

        store.subscribe(updateState)
        return () => {
            store.unsubscribe(updateState);
        }
    }, [selector])

    return state
}