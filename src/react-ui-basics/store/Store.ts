import {createProxy} from "./ProxyTools";
import {isFunction, isObject} from "../Tools";
import {useSyncExternalStore} from "../ReactConstants";

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

// @ts-ignore
export function useStore<T, R>(store: Store<T>, selector: Selector<T, R>): R
// @ts-ignore
export function useStore<T>(store: Store<T>, selector?: undefined): T
// @ts-ignore
export const useStore = <T, R>(store: Store<T>, selector?: Selector<T, R>): R =>
    useSyncExternalStore(store.subscribe, selector ? () => selector(store.get()) : store.get);