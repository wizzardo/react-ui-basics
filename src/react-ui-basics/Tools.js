export function classNames() {
    const filtered = [];
    const length = arguments.length;
    for (let i = 0; i < length; i++) {
        let it = arguments[i];
        !!it && filtered.push(it);
    }
    return filtered.join(' ');
}

export const NOOP = () => {
};

export const orNoop = f => f || NOOP;

export const getRandomId = (prefix) => prefix + Math.random();

export const ref = (name, component) => (it) => component[name] = it;

export const setOf = (list) => (list || []).reduce((map, key) => {
    map[key] = true;
    return map;
}, {});

export const allPropsExcept = (obj, except) => {
    let result = {};
    for (let key in obj) {
        if (!except[key]) result[key] = obj[key];
    }
    return result;
};

export const continuousIncludes = (value, inc) => {
    const length = inc.length;
    let from = 0;
    for (let i = 0; i < length; i++) {
        from = value.indexOf(inc[i], from);
        if (from === -1)
            return false
    }
    return true;
};

export const isHappenedInside = (e, el) => {
    let currentElem = e.target;
    while (currentElem) {
        if (currentElem === el)
            return true;
        currentElem = currentElem.parentElement;
    }
    return false;
};

export const isDifferent = (a, b) => {
    if (a == null && b == null) return false;
    if (a == null || b == null) return true;

    const typeA = typeof a;
    const typeB = typeof b;
    if (typeA !== typeB) {
        return true;
    }

    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            return true;
        }
        let i = a.length - 1;
        let result = false;
        while (i >= 0 && !(result = isDifferent(a[i], b[i]))) {
            i--;
        }
        return result;
    }

    if (typeA === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) {
            return true;
        }

        let j = keysA.length - 1;
        let r = false;
        while (j >= 0 && !(r = keysA[j] !== keysB[j]) && !(r = isDifferent(a[keysA[j]], b[keysB[j]]))) {
            j--;
        }
        return r
    }

    return a !== b;
};

export const preventDefault = e => e && e.preventDefault();
export const stopPropagation = e => e && e.stopPropagation();

export const UNDEFINED = undefined;
export const isUndefined = a => a === UNDEFINED;