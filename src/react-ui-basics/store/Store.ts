import {useEffect, useState} from "react";
import {createProxy} from "./ProxyTools";

interface Stores {
    [index: number]: any
}

let STORES: Stores = {}
let COUNTER = 0

export class Store<T> {
    private name: string
    private listeners: Array<() => void> = []
    private initialState: T
    private index: number

    constructor(initialState: T, name?: string) {
        let that = this;
        that.name = name;
        that.initialState = initialState;
        const index = COUNTER++;
        that.index = index;
        STORES[index] = initialState
    }

    get = (): T => STORES[this.index]
    set = (mutator: (oldState: T) => T) => {
        const proxy = createProxy(STORES[this.index]);
        mutator(proxy)
        STORES[this.index] = proxy.bake()
        this.listeners.forEach(fn => fn())
    }

    reset = () => {
        STORES[this.index] = this.initialState
    }

    subscribe = (fn: () => void) => {
        this.listeners.push(fn)
    }

    unsubscribe = (fn: () => void) => {
        this.listeners = this.listeners.filter(f => f !== fn)
    }

    toString = (): string => this.name;
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

    const updateState = () => {
        setState(selector(store.get()))
    };

    useEffect(() => {
        store.subscribe(updateState)
        return () => store.unsubscribe(updateState)
    })

    return state
}