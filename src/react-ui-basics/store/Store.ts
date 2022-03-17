import {useEffect, useState} from "react";
import {createProxy} from "./ProxyTools";

interface Stores {
    [indexedDB: number]: any
}

let STORE: Stores = {}
let COUNTER = 0

export class Store<T> {
    private name: string
    private listeners: Array<() => void> = []
    private initialState: T
    private index: number

    constructor(initialState: T, name: string) {
        let that = this;
        that.name = name;
        that.initialState = initialState;
        const index = COUNTER++;
        that.index = index;
        STORE[index] = initialState
    }

    get = (): T => STORE[this.index]
    set = (mutator: (T) => T) => {
        const proxy = createProxy(STORE[this.index]);
        mutator(proxy)
        STORE[this.index] = proxy.bake()
        this.listeners.forEach(fn => fn())
    }

    reset = () => {
        STORE[this.index] = this.initialState
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
    return STORE
}

export function resetGlobalState() {
    STORE = {}
}

export function replaceGlobalState(state) {
    STORE = state
}


const defaultSelector = store => store;

export const useStore = <T, R>(store: Store<T>, selector: (T) => R = defaultSelector) => {
    const [state, setState] = useState(selector(store.get()))

    const updateState = () => {
        setState(selector(store.get()))
    };

    useEffect(() => {
        store.subscribe(updateState)
        return () => store.unsubscribe(updateState)
    })

    return state
};