var global = global || window;
export const WINDOW: Window = global as Window;
export const DOCUMENT = WINDOW.document;

export function classNames(...classes: Array<string | number | boolean | null | void>) {
    const filtered = [];
    const length = classes.length;
    for (let i = 0; i < length; i++) {
        let it = classes[i];
        !!it && filtered.push(it);
    }
    return filtered.join(' ');
}

export const NOOP = () => {
};

export const orNoop = <T>(f: (...a: any) => T) => f || NOOP;

export const getRandomId = (prefix: string) => prefix + Math.random();

export const ref = (name, component) => {
    const refKey = "__" + name;
    return component[refKey] || (component[refKey] = (it) => component[name] = it)
};

export const createRef = (initialValue?: any) => {
    let v = initialValue;
    return function (value?: any) {
        if (value != UNDEFINED)
            v = value
        return v;
    };
};

export const createAccessor = (field: string) => (o: any, value?: any) => {
    return !o ? null : value != UNDEFINED ? o[field] = value : o[field]
}

export const setOf = (list) => (list || []).reduce((map, key) => {
    map[key] = TRUE;
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
    let from = -1;
    for (let i = 0; i < length; i++) {
        from = value.indexOf(inc[i], from + 1);
        if (from === -1)
            return FALSE
    }
    return TRUE;
};

const isArrayShallowEqual = (a, b) => {
    if (a === b) return TRUE;
    if (a == null || b == null) return FALSE;
    if (a.length !== b.length) return FALSE;

    let i = a.length - 1;
    let result = TRUE;
    while (i >= 0 && (result = (a[i] === b[i]))) {
        i--;
    }
    return result;
}

export const debounce = (func: (...args: any[]) => void, delay: number): (...args: any[]) => void => {
  let inDebounce: NodeJS.Timeout | undefined;
  return function (...args: any[]): void {
    const context = this;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
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

export const constructorOf = (v) => v && v.constructor;
export const typeOf = (v) => typeof v;
export const isFunction = (v) => typeOf(v) === 'function';
export const isString = (v) => typeOf(v) === 'string';
export const isObject = (v) => typeOf(v) === 'object';

export const deleteKey = (obj: object, key: string | symbol) => delete obj[key];

const FALSE = false;
const TRUE = true;

export const isDifferent = (a, b) => {
    if (a === null && b === null) return FALSE;
    if (a === null || b === null) return TRUE;
    if (a === b) return FALSE;

    const constructorA = constructorOf(a);
    const constructorB = constructorOf(b);
    if (constructorA !== constructorB) {
        return TRUE;
    }

    let i;
    if (constructorA === Array) {
        if ((i = a.length) === b.length) {
            while (i-- && !isDifferent(a[i], b[i])) {
            }
        }
    } else if (constructorA === Object) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if ((i = keysA.length) === keysB.length) {
            let key;
            while (i-- && ((key = keysA[i]) in b) && !isDifferent(a[key], b[key])) {
            }
        }
    }

    return i !== -1;
};

export const preventDefault = e => {
    e && e.preventDefault();
};
export const stopPropagation = e => {
    e && e.stopPropagation();
};

export const setTimeout = function (callback: (...args: any[]) => void, ms?: number, ...args: any[]) {
    return WINDOW.setTimeout.apply(WINDOW, arguments);
};
export const clearTimeout = (id) => {
    WINDOW.clearTimeout(id);
};
export const setInterval = function (callback: (...args: any[]) => void, ms?: number, ...args: any[]) {
    return WINDOW.setInterval.apply(WINDOW, arguments);
};
export const clearInterval = (id) => {
    WINDOW.clearInterval(id);
};
export const requestAnimationFrame = (cb) => WINDOW.requestAnimationFrame(cb);
export const addEventListener = (el, type, listener, options?) => {
    el && el.addEventListener(type, listener, options);
};
export const removeEventListener = (el, type, listener, options?) => {
    el && el.removeEventListener(type, listener, options);
};

export const UNDEFINED = undefined;
export const isUndefined = a => a === UNDEFINED;

export type ComparatorFunction<T> = (a: T, b: T) => number;
export interface Comparator<T> extends ComparatorFunction<T>{
    inverse : <T>() => Comparator<T>
    and : <T>(comparator: Comparator<T>) => Comparator<T>
}

type SortOrder = 'ASC' | 'DESC';
type FieldGetter<T> = (t: T) => any;
type SortField<T> = keyof T | FieldGetter<T>;

export class Comparators {
    static SORT_ASC: SortOrder = 'ASC';
    static SORT_DESC: SortOrder = 'DESC';

    static of = <T>(field: SortField<T> | SortField<T>[], order: SortOrder | SortOrder[], data?: T[]): Comparator<T> => {
        let comparator;
        if (Array.isArray(field)) {
            const isOrderArray = Array.isArray(order);
            comparator = Comparators.chain(field.map((it, i) => Comparators.of(it, (isOrderArray && order[i]) || Comparators.SORT_ASC, data)));
        } else if (isFunction(field)) {
            const getter: FieldGetter<T> = field as FieldGetter<T>
            if (data && data[0] && isString(getter(data[0]))) {
                const collator = new Intl.Collator('default', {sensitivity: 'base'});
                comparator = (a, b) => {
                    return collator.compare(getter(a), getter(b));
                }
            } else
                comparator = (a, b) => {
                    const A = getter(a);
                    const B = getter(b);
                    return (A < B ? -1 : (A > B ? 1 : 0));
                };
        } else if (isString(field))
            comparator = Comparators.of(it => it[field as string], Comparators.SORT_ASC, data);
        else
            comparator = Comparators.of(it => it, Comparators.SORT_ASC, data);

        if (order && order === Comparators.SORT_DESC) {
            return Comparators.inverse(comparator);
        }

        return addComparatorMethods(comparator);
    };
    static chain = <T>(comparators: Comparator<T>[]) => addComparatorMethods((a: T, b: T) => {
            let result;
            for (let i = 0; i < comparators.length; i++) {
                result = comparators[i](a, b);
                if (result !== 0)
                    return result;
            }
            return result;
        }
    );

    static inverse = <T>(comparator: Comparator<T>) => addComparatorMethods((a: T, b: T) => -comparator(a, b));
}

const addComparatorMethods = <T>(cf: ComparatorFunction<T>): Comparator<T> => {
    const comparator = cf as Comparator<T>
    // @ts-ignore
    comparator.inverse = () => Comparators.inverse(comparator);
    // @ts-ignore
    comparator.and = (another) => Comparators.chain([comparator, another]);
    return comparator;
};

if (window['isNotProductionEnvironment']) {
    // will be removed in production build
    // needed only to prevent bundler to remove 'unused' functions
    window['tools'] = {
        memo
    }
}