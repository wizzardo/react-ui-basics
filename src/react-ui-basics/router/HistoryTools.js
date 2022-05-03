import {DOCUMENT, WINDOW} from "../Tools";

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
    const event = DOCUMENT.createEvent('Event');
    event.initEvent(name, true, true);
    WINDOW.dispatchEvent(event);
};

export const pushLocation = (path) => path !== WINDOW.location.pathname && history[events[0]](null, null, path);

export const replaceLocation = (path) => history[events[1]](null, null, path);

if (window['isNotProductionEnvironment']) {
    // will be removed in production build
    // needed only to prevent bundler to remove 'unused' functions
    window['history-tools'] = {
        replaceLocation
    }
}