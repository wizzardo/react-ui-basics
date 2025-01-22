import {WINDOW} from "../Tools";

const history = WINDOW.history;

const events = ['pushState', 'replaceState'];
events.forEach(e => {
    var original = history[e];
    history[e] = function () {
        original.apply(history, arguments);
        fireEvent(e);
    }
});

const fireEvent = (name) => {
    const event = new Event(name, { bubbles: true, cancelable: true });
    WINDOW.dispatchEvent(event);
};

export const pushLocation = (path: string) => path !== WINDOW.location.pathname && history[events[0]](null, null, path);

export const replaceLocation = (path: string) => history[events[1]](null, null, path);

if (window['isNotProductionEnvironment']) {
    // will be removed in production build
    // needed only to prevent bundler to remove 'unused' functions
    window['history-tools'] = {
        replaceLocation
    }
}