import {orNoop} from "./Tools";

const CONTENT_TYPE_APPLICATION_JSON = 'application/json';

const toKeyValue = (key, value) => key && (encodeURIComponent(key) + '=' + encodeURIComponent(value !== null && typeof value === 'object' ? JSON.stringify(value) : value));

export const toRequestParams = (params) => (params && Object.keys(params).map(key => {
    const value = params[key];
    if (Array.isArray(value))
        return value.map(it => toKeyValue(key, it)).join('&')
    else
        return toKeyValue(key, value);
}).join('&')) || '';

export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT'

export class FetchOptions {
    method?: Method = 'GET'
    headers?: ({ [name: string]: string })
    params?: ({ [name: string]: any }) | FormData | Blob
    multipart?: boolean = false
    async?: boolean = true
    withCredentials?: boolean = true
    timeout?: number
    onTimeout?: ((ev: ProgressEvent) => any)
    onSuccess?: ((t: any) => void)
    onError?: ((e: any, status: number) => void)
    onProgress?: ((ev: ProgressEvent) => any)
    provideCancel?: ((cancelFunction: () => void) => void)
}

const DEFAULT_OPTIONS = new FetchOptions()

export const fetch = <T>(url, options: FetchOptions = DEFAULT_OPTIONS) => {
    const method = options.method || 'GET'
    const params = options.params || {};
    if (method === 'GET' || method === 'DELETE') {
        const serializedData = toRequestParams(params);
        if (serializedData)
            url = url + "?" + serializedData;
    }

    const headers = {
        'Accept': CONTENT_TYPE_APPLICATION_JSON,
        ...(options.headers || {})
    };

    let body: FormData | string | Blob

    if (method === 'POST' || method === 'PUT') {
        if (options.multipart) {
            let formData;
            if (params instanceof FormData) {
                formData = params;
            } else {
                formData = new FormData();
                Object.keys(params).forEach(name => {
                    let value = params[name];
                    if (Array.isArray(value)) {
                        value.forEach(it => formData.append(name, it))
                    } else if (value != null)
                        formData.append(name, value);
                });
            }
            body = formData;
        } else if (params instanceof Blob || params instanceof FormData) {
            body = params;
        } else {
            headers['Content-Type'] = CONTENT_TYPE_APPLICATION_JSON;
            body = JSON.stringify(params || {}, (key, value) => {
                if (value !== null)
                    return value
            });
        }
    }

    let makeRequest = (success, error) => {
        const request = new XMLHttpRequest();

        const data = body;

        if (!!(options.withCredentials === void 0 ? true : options.withCredentials))
            request.withCredentials = true;

        const async = !!(options.async === void 0 ? true : options.async);
        request.open(method, url, async);

        Object.keys(headers).forEach(key =>
            request.setRequestHeader(key, headers[key])
        );
        const onError = orNoop(error);

        if (options.timeout && async) {
            request.timeout = options.timeout;
            request.ontimeout = (e) => (options.onTimeout || onError)(e);
        }

        const onProgress = options.onProgress;
        if (onProgress) {
            request.upload.onprogress = e => {
                if (e.lengthComputable)
                    onProgress(e);
            };
            request.onprogress = onProgress;
        }

        request.onload = () => {
            const responseText = request.responseText;
            const status = request.status;
            if (status >= 200 && status < 400) {
                try {
                    orNoop(success)(JSON.parse(responseText || "{}"));
                } catch (e) {
                    const message = `Unexpected exception while processing response for ${method} ${url}, status: ${status}, response: '${responseText}', exception:`;
                    console.log(message, e)
                    onError(new FetchError(message, status, responseText))
                }
            } else {
                const message = `Not ok response for ${method} ${url}, status: ${status}, response: '${responseText}'`;
                console.log(message);
                onError(new FetchError(message, status, responseText))
            }
        };

        request.onerror = onError;

        try {
            if (method === 'POST') {
                if (typeof data === 'string' || data instanceof Blob || data instanceof FormData)
                    request.send(data);
                else
                    request.send(toRequestParams(data));
            } else
                request.send();
        } catch (e) {
            onError(e);
        }

        if (options.provideCancel) {
            options.provideCancel(() => request.abort());
        }
        return request
    };

    // if (!window.Promise)
    //     return makeRequest(options.onSuccess, options.onError);

    return new Promise<T>((resolve, reject) => {
        const success = data => (options.onSuccess || resolve)(data);
        const error = (e, status) => (options.onError || reject)(e, status);
        makeRequest(success, error);
    });
};

class FetchError extends Error {
    status: number;
    responseText?: string;

    constructor(message, status: number, responseText?: string) {
        super(message);
        this.status = status;
        this.responseText = responseText;
    }
}


export type Params = { [id: string]: any };
export type UrlRenderer = (params: Params) => string;

const variablePatter = /\{(\w+)\}/g;
export const createUrlRenderer = (template: string, deleteVars: boolean = false): UrlRenderer => {
    let parts = [];
    let variables = [];

    let find;
    let prevIndex = 0;
    while ((find = variablePatter.exec(template)) !== null) {
        variables.push(find[1]);
        parts.push(template.substring(prevIndex, find.index));
        prevIndex = find.index + find[0].length;
    }
    if (prevIndex === 0)
        return () => template;

    parts.push(template.substring(prevIndex, template.length));

    const m = parts;
    const v = variables;
    return function (params: any) {
        const length = Math.max(m.length, v.length);
        let s = '';
        for (let i = 0; i < length; i++) {
            if (m[i] !== null)
                s += m[i];
            let param = params[v[i]];
            if (params && v[i] !== null && param != null) {
                s += encodeURIComponent(param);
                if (deleteVars)
                    delete params[v[i]]
            }
        }
        return s;
    };
}

const lazy = <T extends Function>(f: ((...any) => T), ...args): any => {
    let result: T;
    return function (): any {
        if (!result)
            result = f.apply(null, args) as T

        return result.apply(null, arguments)
    };
}

let baseurl = window.location.origin
export const setBaseUrl = url => baseurl = url

export const createGET = <R>(template: string) => {
    let urlMaker: (UrlRenderer) = lazy(createUrlRenderer, template, true);
    return async (params?: Params,) => fetch<R>(`${baseurl}${urlMaker(params)}`, {params});
};


export const createPOST = <R, P extends Params>(template: string) => {
    let urlMaker: (UrlRenderer) = lazy(createUrlRenderer, template);
    return async (params?: P,) => fetch<R>(`${baseurl}${urlMaker(params)}`, {params, method: "POST"});
};

const createBinaryPOST = <R>(template: string) => {
    let urlMaker: (UrlRenderer) = lazy(createUrlRenderer, template, true);
    return async (pathVariables: Params, options: FetchOptions) => {
        let url = `${baseurl}${urlMaker(pathVariables)}`;
        if (Object.keys(pathVariables).length > 0) {
            url += '?' + toRequestParams(pathVariables)
        }
        return fetch<R>(url, options);
    };
};

export const createDELETE = <R>(template: string) => {
    let urlMaker: (UrlRenderer) = lazy(createUrlRenderer, template, true);
    return async (params?: Params,) => fetch<R>(`${baseurl}${urlMaker(params)}`, {params, method: "DELETE"});
};

export interface MultipartOptions {
    onProgress?: ((ev: ProgressEvent) => any)
    provideCancel?: ((cancelFunction: () => void) => void)
}

export const createMultipart = <R>(template: string) => {
    let urlMaker: (UrlRenderer) = lazy(createUrlRenderer, template);
    return async (params: any, options?: MultipartOptions) => {
        let url = `${baseurl}${urlMaker(params)}`;
        return fetch<R>(url, {params, method: "POST", multipart: true, ...options});
    };
};