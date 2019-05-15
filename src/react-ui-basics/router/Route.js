import React from 'react';
import PropTypes from 'prop-types';
import './HistoryTools'
import {allPropsExcept, isDifferent, orNoop, setOf} from "../Tools";

const processPath = '_pp';
const historyEvents = ['popstate', 'pushState', 'replaceState'];

const cleanPath = (path) => {
    if (path.length > 1 && path.lastIndexOf('/') === path.length - 1)
        return path.substring(0, path.length - 1);

    return path;
};

const selfProps = setOf([
    'children',
    'path',
    'proxy',
    'onToggle',
]);

class Route extends React.PureComponent {

    static propTypes = {
        path: PropTypes.string.isRequired,
    };

    componentWillMount = () => {
        const {path} = this.props;

        let matcher;
        const variables = [];
        const containsVariables = path.indexOf(':') !== -1;
        const containsAnySegment = path.indexOf('*') !== -1;
        const containsNot = path.indexOf('!') !== -1;
        if (!containsAnySegment && !containsVariables && !containsNot) {
            matcher = (p) => p === path
        } else {
            const segments = path.split('/');
            const endsWithAny = path.lastIndexOf('*') === path.length - 1;
            const optionals = [];
            segments.forEach((segment, i) => optionals[i] = segment === '*' || segment.indexOf('?') === segment.length - 1);

            const matchers = segments.map(segment => {
                if (segment === '*')
                    return () => true;
                else if (segment.indexOf(':') === 0) {
                    let variable = segment.substring(1);
                    if (variable.indexOf('?') !== -1)
                        variable = variable.substring(0, variable.indexOf('?'));

                    variables.push(variable);
                    // console.log('find variable', variable)
                    return (p, params) => {
                        params[variable] = p;
                        // console.log('adding param', variable, '=', p)
                        return true;
                    }
                } else if (segment.indexOf('!') === 0) {
                    let not = segment.substring(1);
                    return (p) => p !== not;
                } else
                    return (p) => p === segment;
            });
            matcher = (p, params) => {
                const s = p.split('/');
                const l = Math.min(matchers.length, s.length);

                for (let i = 0; i < l; i++) {
                    // console.log('checking ', s[i], 'from', p, 'against', this.props.path, matchers[i](s[i], params));
                    if (!matchers[i](s[i], params))
                        return false;
                }

                if (!endsWithAny && matchers.length < s.length)
                    return false;

                // console.log('checking optionals in', p, ' for ', this.props.path)
                for (let i = l; i < optionals.length; i++) {
                    if (!optionals[i])
                        return false;
                }

                // console.log('matching ', p, ' to ', this.props.path)
                return true;
            };
        }

        this.matcher = matcher;
        this.setState({render: false, variables})
    };

    matches = () => this.state.render;

    [processPath] = () => {
        let params = {};
        let render = this.matcher(cleanPath(window.location.pathname), params);
        const nextState = {render};
        if (isDifferent(this.state.params, params)) {
            nextState.params = params;
            nextState.mergedProps = Object.assign(allPropsExcept(this.props, selfProps), params);
        }

        const toggle = render !== this.state.render;
        this.setState(nextState, () => {
            // toggle && console.log('toggle',this.props.path, render);
            toggle && orNoop(this.props.onToggle)(render);
        })
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props !== prevProps) {
            let mergedProps = Object.assign(allPropsExcept(this.props, selfProps), this.state.params);
            if (isDifferent(mergedProps, this.state.mergedProps))
                this.setState({mergedProps})
        }
    };

    render = () => {
        const {children, proxy} = this.props;
        const {render, variables, mergedProps} = this.state;
        return (proxy || SimpleProxy)(render, children, mergedProps, variables);
    };

    componentDidMount = () => {
        historyEvents.forEach(it => window.addEventListener(it, this[processPath]));
        this[processPath]();
    };

    componentWillUnmount = () => {
        historyEvents.forEach(it => window.removeEventListener(it, this[processPath]));
    };
}

const SimpleProxy = (matches, children, props, variables) => {
    if (!matches || !children) return null;
    if (variables.length > 0 || Object.keys(props).length > 0) {
        return React.Children.map(children, child => React.cloneElement(child, props));
    }
    return children;
};

export default Route;