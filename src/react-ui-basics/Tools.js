
export function classNames() {
    const filtered = [];
    const length = arguments.length;
    for (let i = 0; i < length; i++) {
        let it = arguments[i];
        !!it && filtered.push(it);
    }
    return filtered.join(' ');
}
