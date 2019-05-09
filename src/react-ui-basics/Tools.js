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