const w = window;
const history = w.history;

const events = ['pushState', 'replaceState'];
events.forEach(e => {
    var original = history[e];
    history[e] = function () {
        original.apply(history, arguments);
        fireEvent(e);
    }
});

const fireEvent = (name) => {
    const event = document.createEvent('Event');
    event.initEvent(name, true, true);
    w.dispatchEvent(event);
};

export const pushLocation = (path) => path !== w.location.pathname && history[events[0]](null, null, path);

export const replaceLocation = (path) => history[events[1]](null, null, path);