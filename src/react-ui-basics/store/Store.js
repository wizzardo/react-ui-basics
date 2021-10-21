import {useEffect, useState} from "react";
import {createProxy} from "./ProxyTools";

let STORE = {}
let COUNTER = 0

export class Store {
    constructor(initialState, name) {
        const that = this;

        that.name = name;
        let listeners = []
        const index = COUNTER++;
        STORE[index] = initialState
        that.get = () => STORE[index]
        that.set = (mutator) => {
            const proxy = createProxy(STORE[index]);
            mutator(proxy)
            STORE[index] = proxy.bake()
            listeners.forEach(fn => fn())
        }

        that.reset = () => {
            STORE[index] = initialState
        }

        that.subscribe = (fn) => {
            listeners.push(fn)
        }

        that.unsubscribe = (fn) => {
            listeners = listeners.filter(f => f !== fn)
        }

        that.toString = () => that.name;
    }
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

export const useStore = (store, selector = defaultSelector) => {
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