import {UNDEFINED, isObject, deleteKey} from "../Tools";

const FIELD_CHANGED = '__changed';
const FIELD_BAKE = 'bake';

export const createProxy = <T extends object>(target: T) => {
    if (!target)
        return target

    let changedValue = UNDEFINED;
    let deletedKeys = UNDEFINED;
    let innerProxies = UNDEFINED
    const isChanged = () => changedValue || (innerProxies && Object.values(innerProxies).some(it => it[FIELD_CHANGED]));
    const initChangedValue = (target) => {
        !changedValue && (changedValue = Array.isArray(target) ? [...target] : {...target})
    };
    return new Proxy<T>(target, {
        get: (target: T, prop: string | symbol) => {
            if (prop === FIELD_CHANGED)
                return isChanged();
            if (prop === FIELD_BAKE) {
                return () => {
                    // console.log('bake', changedValue, innerProxies)
                    if (!isChanged())
                        return target

                    if (changedValue && !innerProxies)
                        return changedValue

                    let result = changedValue || (Array.isArray(target) ? [...target] : {...target});
                    for (let key in innerProxies) {
                        result[key] = innerProxies[key][FIELD_BAKE]()
                    }
                    return result
                }
            }

            // console.log('get', {target, prop})
            const innerProxy = innerProxies && innerProxies[prop];
            if (innerProxy)
                return innerProxy

            const changed = changedValue && changedValue[prop]
            if (changed !== UNDEFINED)
                return changed

            if (deletedKeys && deletedKeys[prop])
                return UNDEFINED

            const value = target[prop];
            if (value && isObject(value)) {
                !innerProxies && (innerProxies = {})
                return innerProxies[prop] = createProxy(value)
            }

            return value;
        },
        set: (target: T, prop, newval) => {
            // console.log('set', {target, prop, newval})
            initChangedValue(target);

            if (newval && isObject(newval)) {
                !innerProxies && (innerProxies = {})
                innerProxies[prop] = newval = createProxy(newval)
            } else {
                innerProxies && deleteKey(innerProxies, prop)
            }
            changedValue[prop] = newval
            // console.log('changedValue', changedValue)
            return true;
        },
        deleteProperty: (target: T, prop) => {
            // console.log('delete', {target, prop})
            initChangedValue(target);

            if (prop in changedValue) {
                deleteKey(changedValue, prop)
                innerProxies && deleteKey(innerProxies, prop)
                !deletedKeys && (deletedKeys = {})
                deletedKeys[prop] = true;
            }
            return true;
        }
    })
}
