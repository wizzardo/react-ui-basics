import {UNDEFINED} from "../Tools";

export const createProxy = (target) => {
    if(!target)
        return target
    if (target.__isProxy)
        return target;

    let changedValue = UNDEFINED;
    let deletedKeys = UNDEFINED;
    let innerProxies = UNDEFINED
    const isChanged = () => changedValue || (innerProxies && Object.values(innerProxies).some(it => it.__changed));

    return new Proxy(target, {
        get: function (target, prop) {
            if (prop === '__isProxy')
                return true
            if (prop === '__changed')
                return isChanged();
            if (prop === 'bake')
                return () => {
                    // console.log('bake', changedValue, innerProxies)
                    if (!isChanged())
                        return target

                    if (changedValue && !innerProxies)
                        return changedValue

                    if (innerProxies) {
                        const result = changedValue || (Array.isArray(target) ? [...target] : {...target});

                        for (let key in innerProxies) {
                            result[key] = innerProxies[key].bake()
                        }
                        return result
                    }

                    throw new Error('state not implemented yet')
                }

            // console.log('get', {target, prop})
            const innerProxy = innerProxies && innerProxies[prop];
            if (innerProxy)
                return innerProxy

            const changed = changedValue && changedValue[prop]
            if (changed !== UNDEFINED)
                return changed

            if (deletedKeys && deletedKeys[prop])
                return null

            const value = target[prop];
            if (value && typeof value === 'object') {
                !innerProxies && (innerProxies = {})
                return innerProxies[prop] = createProxy(value)
            }

            return value;
        },
        set: function (target, prop, newval) {
            // console.log('set', {target, prop, newval})
            if (!changedValue) changedValue = Array.isArray(target) ? [...target] : {...target}

            if (newval && typeof newval === 'object') {
                !innerProxies && (innerProxies = {})
                innerProxies[prop] = newval = createProxy(newval)
            } else {
                innerProxies && (delete innerProxies[prop])
            }
            changedValue[prop] = newval
            // console.log('changedValue', changedValue)
            return true;
        },
        deleteProperty: function (target, prop) {
            // console.log('delete', {target, prop})
            !changedValue && (changedValue = Array.isArray(target) ? [...target] : {...target})

            if (!prop in changedValue)
                return false;

            delete changedValue[prop]
            innerProxies && delete innerProxies[prop]
            !deletedKeys && (deletedKeys = {})
            deletedKeys[prop] = true;
            return true;
        }
    })
}
