import React from 'react';
import ReactCreateElement from '../ReactCreateElement';
import PropTypes from 'prop-types';
import './HistoryTools'
import {allPropsExcept, isDifferent, orNoop, setOf, WINDOW, addEventListener, removeEventListener} from "../Tools";
import {componentDidUpdate, render, PureComponent, componentDidMount, componentWillUnmount, propsGetter, stateGSs} from "../ReactConstants";

const historyEvents = ['popstate', 'pushState', 'replaceState'];

const cleanPath = (path) => {
    if (path.length > 1 && path.lastIndexOf('/') === path.length - 1)
        return path.substring(0, path.length - 1);

    return path;
};

const createUrlMatcher = path => {
    let matcher;
    const variables = [];
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
            if (segment === '*')
                matcher = () => true;
            else if (segment.indexOf(':') === 0) {
                let variable = segment.substring(1);
                if (variable.indexOf('?') !== -1)
                    variable = variable.substring(0, variable.indexOf('?'));

                variables.push(variable);
                matcher = (p, params) => {
                    if (!p && !optionals[i])
                        return false;

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
    return [matcher, variables, optionals, segments]
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
            variablesState,
        ] = stateGSs(that, 4);

        const process = () => {
            let params = {};
            let isMatching = matcher(cleanPath(WINDOW.location.pathname), params);
            if (isDifferent(paramsState(), params)) {
                paramsState(params);
                mergedPropsState(Object.assign(allPropsExcept(props(), selfProps), params));
            }

            const toggle = isMatching !== isRendering();
            isRendering(isMatching, () => {
                toggle && orNoop(props().onToggle)(isMatching);
            });
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
            return (controller || DefaultController)(isRendering(), children, mergedPropsState(), variablesState());
        };

        that[componentDidMount] = () => {
            const urlMatcher = createUrlMatcher(props().path);
            matcher = urlMatcher[0];
            variablesState(urlMatcher[1]);

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
        path: PropTypes.string.isRequired,
        controller: PropTypes.func,
        onToggle: PropTypes.func,
    };
}

const DefaultController = (matches, children, props, variables) => {
    if (!matches || !children) return null;
    if (variables.length > 0 || Object.keys(props).length > 0) {
        return React.Children.map(children, child => React.cloneElement(child, props));
    }
    return children;
};

export default Route;