import {WINDOW} from "../Tools";

const history = WINDOW.history;

type HistoryAction = 'pushState' | 'replaceState';
type HistoryActionArgs = Parameters<typeof history[HistoryAction]>;
type HistoryMiddleware = (action: HistoryAction, args: HistoryActionArgs) => HistoryActionArgs;

const middlewares: HistoryMiddleware[] = []

const events: HistoryAction[] = ['pushState', 'replaceState'];
events.forEach(e => {
    var original = history[e];
    history[e] = function () {
        let args = arguments as any as HistoryActionArgs;
        for (const middleware of middlewares) {
            args = middleware(e, args)
            if (!args) break
        }
        args && original.apply(history, args);
        fireEvent(e);
    }
});

const fireEvent = (name) => {
    const event = new Event(name, { bubbles: true, cancelable: true });
    WINDOW.dispatchEvent(event);
};

export const pushLocation = (path: string) => path !== WINDOW.location.pathname && history[events[0]](null, null, path);

export const replaceLocation = (path: string) => history[events[1]](null, null, path);

export const addMiddleware = (middleware: HistoryMiddleware) => {
    middlewares.push(middleware);
};
export const removeMiddleware = (middleware: HistoryMiddleware) => {
    let index = middlewares.indexOf(middleware);
    index !== -1 && middlewares.splice(index, 1);
};

if (window['isNotProductionEnvironment']) {
    // will be removed in production build
    // needed only to prevent bundler to remove 'unused' functions
    window['history-tools'] = {
        replaceLocation
    }
}