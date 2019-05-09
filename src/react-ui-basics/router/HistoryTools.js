const {history} = window;
const pushState = history.pushState;

history.pushState = function () {
    pushState.apply(history, arguments);
    fireEvent('pushState');
};

const replaceState = history.replaceState;
history.replaceState = function () {
    replaceState.apply(history, arguments);
    fireEvent('replaceState');
};

const fireEvent = (name,) => {
    const event = document.createEvent('Event');
    event.initEvent(name, true, true);
    window.dispatchEvent(event);
};

export const pushLocation = (path) => {
    if (path === window.location.pathname) return;
    return history.pushState(null, null, path);
};

export const replaceLocation = (path) => history.replaceState(null, null, path);