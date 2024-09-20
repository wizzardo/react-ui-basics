import {fetch} from '../HttpTools'
import {WINDOW} from "../Tools";

interface ErrorInfo {
    message: Event | string
    source?: string
    lineno?: number
    colno?: number
    stack?: string
    type?: string
    error?: Error
}

interface Context {
    extra: any
}

interface Frame {
    filename: string,
    function: string,
    lineno: string,
    colno: string,
}

interface User {
    id?: string | number,
    name?: string,
    username?: string,
    email?: string,
}

interface Request {
    url: string,
    headers: { [key: string]: string },
}

class Scope {
    user: User = {}
    dsn: string
    release: string
    environment: string
    userAgent: string
    url: string

    setUser(userProps: User) {
        this.user = {...userProps};
    }
}

interface Payload {
    level: string,
    exception: any,
    event_id: string,
    platform: string,
    timestamp: number,
    environment: string,
    release: string,
    request: Request,
    extra: any,
    user: User,
}

type PayloadInterceptor = (payload: Payload, context: Context) => (Payload | null)

const scope = new Scope();
let payloadInterceptor: PayloadInterceptor = null
let onPostSuccess = (data) => {
    console.log('error stored: ', data)
};
let onPostError = (e, s) => {
    console.log('failed to store error: ', s, e)
};

const captureError = (info: ErrorInfo, context?: Context) => {
    let frames = processStackTrace(info.stack)
    let event_id = crypto.randomUUID().replaceAll('-', '');
    let payload: Payload = {
        exception: {
            values: [{
                "type": info.type,
                "value": info.message,
                "stacktrace": {frames},
                "mechanism": {
                    "handled": false,
                    "type": "instrument",
                }
            }]
        },
        level: "error",
        event_id,
        platform: "javascript",
        timestamp: Date.now(),
        environment: scope.environment,
        release: scope.release,
        request: {
            url: WINDOW.location.href,
            headers: {
                "User-Agent": navigator.userAgent
            }
        },
        "extra": {
            "arguments": []
        },
        user: scope.user,
    }

    payload = payloadInterceptor ? payloadInterceptor(payload, context) : payload
    payload && fetch(scope.url, {
        method: 'POST',
        params: payload,
        withCredentials: false,
        onSuccess: onPostSuccess,
        onError: onPostError
    })
}

const processStackTrace = (stack: string): Frame[] => {
    if (!stack)
        return []

    let lines = stack.split(/\n\s*/);
    let frames = lines.map((line, j) => {
        if (j === 0 || !line)
            return null

        let filename;
        let fn;
        let colno;
        let lineno;
        let separator = ' '

        if (line.startsWith('at ')) {
            line = line.substring(3);
        } else {
            separator = '@'
        }

        let i;
        if (line.endsWith(')')) {
            i = line.lastIndexOf('(');
            filename = line.substring(i + 1, line.length - 1);
            i--;
        } else {
            i = line.lastIndexOf(separator);
            filename = line.substring(i + 1, line.length);
        }
        fn = line.substring(0, i);

        i = filename.lastIndexOf(':');
        if (i !== -1) {
            colno = parseInt(filename.substring(i + 1), 10);
            filename = filename.substring(0, i);
        }
        i = filename.lastIndexOf(':');
        if (i !== -1) {
            lineno = parseInt(filename.substring(i + 1), 10);
            filename = filename.substring(0, i);
        }
        return {
            filename, 'function': fn || '?', lineno, colno,
        }
    })
    if (!frames[frames.length - 1])
        frames.pop();
    frames.reverse();
    if (!frames[frames.length - 1])
        frames.pop();
    return frames;
}


const initExceptionHandlers = () => {
    let prevonerror = WINDOW.onerror
    WINDOW.onerror = (message, source, lineno, colno, error) => {
        prevonerror && prevonerror(message, source, lineno, colno, error)
        captureError({
            message: error ? error.message : message,
            source,
            lineno,
            colno,
            stack: error ? error.stack : null,
            error,
            type: error ? error.name : 'Error',
        });
    };

    WINDOW.onunhandledrejection = event => {
        captureError({
            message: event.reason.message || 'Unhandled promise rejection',
            stack: event.reason.stack || null,
            type: 'Error'
        });
    };
}

export const init = (args: {
    dsn: string
    release: string
    environment: string
}) => {
    scope.dsn = args.dsn
    scope.release = args.release
    scope.environment = args.environment
    scope.userAgent = navigator.userAgent

    let url = new URL(scope.dsn);
    scope.url = url.origin + '/api' + url.pathname + '/store/?sentry_key=' + url.username;
    initExceptionHandlers()
}

export const captureException = (e: Error | string, context: Context) => {
    if (e instanceof Error) {
        captureError({
            message: e.message,
            stack: e.stack,
        }, context)
    } else {
        captureError({
            message: e,
        }, context)
    }
}

export const configureScope = (f: (scope: Scope) => void) => {
    f(scope)
}

export const setPayloadInterceptor = (interceptor: PayloadInterceptor) => {
    payloadInterceptor = interceptor
}

export const setOnPostSuccess = (onSuccess) => {
    onPostSuccess = onSuccess
}
export const setOnErrorSuccess = (onError) => {
    onPostError = onError
}