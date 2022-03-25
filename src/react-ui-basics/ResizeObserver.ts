import {requestAnimationFrame, WINDOW} from "./Tools";

class ResizeObserver {

    constructor(callback) {
        let observables = [];

        const check = () => {
            if (observables.length !== 0) {
                const changedEntries = observables.filter((it) => {
                    const currentHeight = it.el.clientHeight;
                    const currentWidth = it.el.clientWidth;
                    if (it.size.height !== currentHeight || it.size.width !== currentWidth) {
                        it.size.height = currentHeight;
                        it.size.width = currentWidth;
                        return true;
                    }
                }).map((obj) => obj.el);
                if (changedEntries.length > 0) {
                    callback(changedEntries, this);
                }
                requestAnimationFrame(check);
            }
        }

        this['observe'] = (el) => {
            if (!observables.some((it) => it.el === el)) {
                const newObservable = {
                    el: el,
                    size: {
                        height: el.clientHeight,
                        width: el.clientWidth
                    }
                }
                observables.push(newObservable);
                requestAnimationFrame(check);
            }
        }

        this['unobserve'] = (el) => {
            observables = observables.filter((obj) => obj.el !== el);
        }

        this['disconnect'] = () => {
            observables = [];
        }
    }
}

WINDOW.ResizeObserver = WINDOW.ResizeObserver || ResizeObserver;