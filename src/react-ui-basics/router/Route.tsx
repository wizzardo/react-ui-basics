import React, {ReactNode} from 'react';
import ReactCreateElement from '../ReactCreateElement';
import './HistoryTools'
import {allPropsExcept, isDifferent, orNoop, setOf, WINDOW, addEventListener, removeEventListener} from "../Tools";
import {componentDidUpdate, render, PureComponent, componentDidMount, componentWillUnmount, propsGetter, stateGSs, setState} from "../ReactConstants";

const indexOf = (src: string, search: string) => src.indexOf(search);
const substring = (src: string, start: number, end?: number) => src.substring(start, end);

const historyEvents = ['popstate', 'pushState', 'replaceState'];

const cleanPath = (path) => {
    if (path.length > 1 && path.lastIndexOf('/') === path.length - 1)
        return substring(path, 0, path.length - 1);

    return path;
};

const createUrlMatcher = path => {
    let matcher;
    const segments = path.split('/');
    const optionals = segments.map(it => it === '*' || indexOf(it, '?') === it.length - 1);
    const containsVariables = indexOf(path, ':') !== -1;
    const containsAnySegment = indexOf(path, '*') !== -1;
    const containsNot = indexOf(path, '!') !== -1;

    if (!containsAnySegment && !containsVariables && !containsNot) {
        matcher = (p) => p === path
    } else {
        const endsWithAny = path.lastIndexOf('*') === path.length - 1;
        const matchers = segments.map((segment, i) => {
            let matcher;
            const variableNameIndex = indexOf(segment, ':');
            if (segment === '*')
                matcher = () => true;
            else if (variableNameIndex !== -1) {
                let variable = substring(segment, variableNameIndex + 1);
                let regex = null
                if (indexOf(variable, '?') !== -1)
                    variable = substring(variable, 0, indexOf(variable, '?'));
                if (indexOf(variable, '(') !== -1) {
                    let regexStart = indexOf(variable, '(');
                    regex = new RegExp(substring(variable, regexStart))
                    variable = substring(variable, 0, regexStart);
                }

                const prefix = variableNameIndex && substring(segment, 0, variableNameIndex);
                matcher = (p, params) => {
                    if (regex && !!p && !p.match(regex))
                        return false

                    if (!p && !optionals[i])
                        return false;
                    if (prefix) {
                        if (indexOf(p, prefix) === 0)
                            p = substring(p, variableNameIndex);
                        else
                            return false;
                    }

                    params[variable] = p;
                    return true;
                }
            } else if (indexOf(segment, '!') === 0) {
                const not = substring(segment, 1);
                matcher = (p) => p !== not;
            } else
                matcher = (p) => p === segment;
            return matcher;
        });

        matcher = (path, params) => {
            const segments = path.split('/');
            const length = Math.min(matchers.length, segments.length);

            // only exact match if mapping not ends with *
            if (!endsWithAny && matchers.length < segments.length)
                return false;

            // check that each segment matches
            for (let i = 0; i < length; i++) {
                if (!matchers[i](segments[i], params))
                    return false;
            }

            // check that all other segments are optional
            for (let i = length; i < optionals.length; i++) {
                if (!optionals[i])
                    return false;
            }

            return true;
        };
    }
    return matcher
};

const createUrlMatchers = path => {
    if (Array.isArray(path)) {
        const matchers = path.map(it => createUrlMatcher(it));
        return (path, params) => {
            for (let i = 0; i < matchers.length; i++) {
                let props = {};
                if (matchers[i](path, props)) {
                    Object.assign(params, props);
                    return true;
                }
            }
            return false;
        }
    } else {
        return createUrlMatcher(path);
    }
};

const selfProps = setOf([
    'children',
    'path',
    'controller',
    'onToggle',
]);

export type Controller = (matches: boolean, children: ReactNode, props: any) => ReactNode;

export interface RouteProps {
    path: string | string[],
    controller?: Controller,
    onToggle?: (matches: boolean) => void,
    children?: ReactNode,
}

class Route extends PureComponent<RouteProps> {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};
        let matcher;

        const props = propsGetter(that);
        const [
            isRendering,
            paramsState,
            mergedPropsState,
        ] = stateGSs(that, 3);

        const process = () => {
            let params = {};
            let nextState = {};
            let isMatching = matcher(cleanPath(WINDOW.location.pathname), params);

            const toggle = isMatching !== isRendering();
            // @ts-ignore
            toggle && (nextState[isRendering] = isMatching);

            if (isDifferent(paramsState(), params)) {
                // @ts-ignore
                nextState[mergedPropsState] = Object.assign(allPropsExcept(props(), selfProps), params);
                // @ts-ignore
                nextState[paramsState] = params;
            }

            //set new state just once to avoid several renders
            setState(that, nextState, () => {
                toggle && orNoop(props().onToggle)(isMatching);
            })
        };

        that[componentDidUpdate] = (prevProps, prevState) => {
            if (props() !== prevProps) {
                let mergedProps = Object.assign(allPropsExcept(props(), selfProps), paramsState());
                if (isDifferent(mergedProps, mergedPropsState()))
                    mergedPropsState(mergedProps);
            }
        };

        that[render] = () => {
            const {children, controller} = props();
            return (controller || DefaultController)(isRendering(), children, mergedPropsState());
        };

        that[componentDidMount] = () => {
            matcher = createUrlMatchers(props().path);

            historyEvents.forEach(it => {
                addEventListener(WINDOW, it, process);
            });
            process();
        };

        that[componentWillUnmount] = () => {
            historyEvents.forEach(it => {
                removeEventListener(WINDOW, it, process);
            });
        };
    }
}

const DefaultController: Controller = (matches, children, props) => {
    if (!matches || !children) return null;
    if (Object.keys(props).length > 0) {
        // @ts-ignore
        return React.Children.map(children, child => React.cloneElement(child, props));
    }
    return children;
};

export default Route;