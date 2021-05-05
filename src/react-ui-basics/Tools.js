var global = global || window;
export const WINDOW = global;
export const DOCUMENT = WINDOW.document;

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

export const createRef = () => {
    const ref = function () {
        arguments.length > 0 && (ref.v = arguments[0]);
        return ref.v;
    };
    return ref;
};

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

const isArrayShallowEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) {
        return false;
    }
    let i = a.length - 1;
    let result = true;
    while (i >= 0 && (result = (a[i] === b[i]))) {
        i--;
    }
    return result;
}

export const debounce = (func, delay) => {
    let inDebounce;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => {
            func.apply(context, args);
        }, delay)
    }
};

export const memo = (func) => {
    let prevArgs
    let prevResult
    return function () {
        const context = this;
        const args = arguments;
        if (!isArrayShallowEqual(prevArgs, args)) {
            prevArgs = args
            prevResult = func.apply(context, args);
        }
        return prevResult
    }
}

export const typeOf = (v) => typeof v;
export const isFunction = (v) => typeOf(v) === 'function';
export const isString = (v) => typeOf(v) === 'string';
export const isObject = (v) => typeOf(v) === 'object';

export const isDifferent = (a, b) => {
    if (a == null && b == null) return false;
    if (a == null || b == null) return true;
    if (a === b) return false;

    const typeA = typeOf(a);
    const typeB = typeOf(b);
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

    return true;
};

export const preventDefault = e => {
    e && e.preventDefault();
};
export const stopPropagation = e => {
    e && e.stopPropagation();
};

export const setTimeout = function () {
    return WINDOW.setTimeout.apply(WINDOW, arguments);
};
export const clearTimeout = (id) => {
    WINDOW.clearTimeout(id);
};
export const setInterval = function () {
    return WINDOW.setInterval.apply(WINDOW, arguments);
};
export const clearInterval = (id) => {
    WINDOW.clearInterval(id);
};
export const requestAnimationFrame = (cb) => WINDOW.requestAnimationFrame(cb);
export const addEventListener = (el, type, listener, options) => {
    el && el.addEventListener(type, listener, options);
};
export const removeEventListener = (el, type, listener, options) => {
    el && el.removeEventListener(type, listener, options);
};

export const UNDEFINED = undefined;
export const isUndefined = a => a === UNDEFINED;


export class Comparators {
    static SORT_ASC = 'ASC';
    static SORT_DESC = 'DESC';

    static of = (field, order, data) => {
        let comparator;
        if (Array.isArray(field)) {
            const isOrderArray = Array.isArray(order);
            comparator = Comparators.chain(field.map((it, i) => Comparators.of(it, (isOrderArray && order[i]) || Comparators.SORT_ASC, data)));
        } else if (isFunction(field)) {
            if (data && data[0] && isString(field(data[0]))) {
                const collator = new Intl.Collator({sensitivity: 'base'});
                comparator = (a, b) => {
                    return collator.compare(field(a), field(b));
                }
            } else
                comparator = (a, b) => {
                    const A = field(a);
                    const B = field(b);
                    return (A < B ? -1 : (A > B ? 1 : 0));
                };
        } else if (isString(field))
            comparator = Comparators.of(it => it[field], Comparators.SORT_ASC, data);
        else
            comparator = Comparators.of(it => it, Comparators.SORT_ASC, data);

        if (order && order === Comparators.SORT_DESC) {
            return Comparators.inverse(comparator);
        }

        return addComparatorMethods(comparator);
    };
    static chain = (comparators) => addComparatorMethods((a, b) => {
            let result;
            for (let i = 0; i < comparators.length; i++) {
                result = comparators[i](a, b);
                if (result !== 0)
                    return result;
            }
            return result;
        }
    );

    static inverse = (comparator) => addComparatorMethods((a, b) => -comparator(a, b));
}

const addComparatorMethods = function (comparator) {
    comparator.inverse = () => Comparators.inverse(comparator);
    comparator.and = (another) => Comparators.chain([comparator, another]);
    return comparator;
};

if (window.isNotProductionEnvironment) {
    // will be removed in production build
    // needed only to prevent bundler to remove 'unused' functions
    window.tools = {
        memo
    }
}