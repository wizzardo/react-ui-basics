import React from 'react';
import ReactCreateElement from '../ReactCreateElement';
import PropTypes from 'prop-types';
import './HistoryTools'
import {allPropsExcept, isDifferent, orNoop, setOf, WINDOW, addEventListener, removeEventListener} from "../Tools";
import {componentDidUpdate, render, PureComponent, componentDidMount, componentWillUnmount, propsGetter, stateGSs, setState} from "../ReactConstants";

const historyEvents = ['popstate', 'pushState', 'replaceState'];

const cleanPath = (path) => {
    if (path.length > 1 && path.lastIndexOf('/') === path.length - 1)
        return path.substring(0, path.length - 1);

    return path;
};

const createUrlMatcher = path => {
    let matcher;
    const segments = path.split('/');
    const optionals = segments.map(it => it === '*' || it.indexOf('?') === it.length - 1);
    const containsVariables = path.indexOf(':') !== -1;
    const containsAnySegment = path.indexOf('*') !== -1;
    const containsNot = path.indexOf('!') !== -1;

    if (!containsAnySegment && !containsVariables && !containsNot) {
        matcher = (p) => p === path
    } else {
        const endsWithAny = path.lastIndexOf('*') === path.length - 1;
        const matchers = segments.map((segment, i) => {
            let matcher;
            const variableNameIndex = segment.indexOf(':');
            if (segment === '*')
                matcher = () => true;
            else if (variableNameIndex !== -1) {
                let variable = segment.substring(variableNameIndex + 1);
                let regex = null
                if (variable.indexOf('?') !== -1)
                    variable = variable.substring(0, variable.indexOf('?'));
                if (variable.indexOf('(') !== -1) {
                    let regexStart = variable.indexOf('(');
                    regex = new RegExp(variable.substring(regexStart))
                    variable = variable.substring(0, regexStart);
                }

                const prefix = variableNameIndex && segment.substring(0, variableNameIndex);
                matcher = (p, params) => {
                    if (regex && !!p && !p.match(regex))
                        return false

                    if (!p && !optionals[i])
                        return false;
                    if (prefix) {
                        if (p.indexOf(prefix) === 0)
                            p = p.substring(variableNameIndex);
                        else
                            return false;
                    }

                    params[variable] = p;
                    return true;
                }
            } else if (segment.indexOf('!') === 0) {
                const not = segment.substring(1);
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

class Route extends PureComponent {

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
            toggle && (nextState[isRendering] = isMatching);

            if (isDifferent(paramsState(), params)) {
                nextState[mergedPropsState] = Object.assign(allPropsExcept(props(), selfProps), params);
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

if (window.isNotProductionEnvironment) {
    Route.propTypes = {
        path: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]).isRequired,
        controller: PropTypes.func,
        onToggle: PropTypes.func,
    };
}

const DefaultController = (matches, children, props) => {
    if (!matches || !children) return null;
    if (Object.keys(props).length > 0) {
        return React.Children.map(children, child => React.cloneElement(child, props));
    }
    return children;
};

export default Route;