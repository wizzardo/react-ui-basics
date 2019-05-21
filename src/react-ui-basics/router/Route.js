import React from 'react';
import PropTypes from 'prop-types';
import './HistoryTools'
import {allPropsExcept, isDifferent, orNoop, setOf} from "../Tools";

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
            if (segment === '*')
                return () => true;
            else if (segment.indexOf(':') === 0) {
                let variable = segment.substring(1);
                if (variable.indexOf('?') !== -1)
                    variable = variable.substring(0, variable.indexOf('?'));

                variables.push(variable);
                return (p, params) => {
                    if (!p && !optionals[i])
                        return false;

                    params[variable] = p;
                    return true;
                }
            } else if (segment.indexOf('!') === 0) {
                const not = segment.substring(1);
                return (p) => p !== not;
            } else
                return (p) => p === segment;
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

class Route extends React.PureComponent {

    static propTypes = {
        path: PropTypes.string.isRequired,
        controller: PropTypes.func,
        onToggle: PropTypes.func,
    };

    state = {
        render: false,
    };

    process = () => {
        let params = {};
        let render = this.matcher(cleanPath(window.location.pathname), params);
        const nextState = {render};
        if (isDifferent(this.state.params, params)) {
            nextState.params = params;
            nextState.mergedProps = Object.assign(allPropsExcept(this.props, selfProps), params);
        }

        const toggle = render !== this.state.render;
        this.setState(nextState, () => {
            toggle && orNoop(this.props.onToggle)(render);
        })
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props !== prevProps) {
            let mergedProps = Object.assign(allPropsExcept(this.props, selfProps), this.state.params);
            if (isDifferent(mergedProps, this.state.mergedProps))
                this.setState({mergedProps})
        }
    };

    render() {
        const {children, controller} = this.props;
        const {render, variables, mergedProps} = this.state;
        return (controller || DefaultController)(render, children, mergedProps, variables);
    };

    componentDidMount() {
        const [matcher, variables] = createUrlMatcher(this.props.path);
        this.matcher = matcher;
        this.setState({variables});

        historyEvents.forEach(it => window.addEventListener(it, this.process));
        this.process();
    };

    componentWillUnmount() {
        historyEvents.forEach(it => window.removeEventListener(it, this.process));
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