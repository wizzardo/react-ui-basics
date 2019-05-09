import React from 'react';
import PropTypes from 'prop-types';
import './HistoryTools'
import {orNoop} from "../Tools";

const emptyObject = {};

const urlListener = '_ul';
const processPath = '_pp';

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

    cleanPath = (path) => {
        if (path.length > 1 && path.lastIndexOf('/') === path.length - 1)
            return path.substring(0, path.length - 1);

        return path;
    };

    [processPath] = () => {
        let params = {};
        let render = this.matcher(this.cleanPath(window.location.pathname), params);
        if (Object.keys(params).length === 0)
            params = emptyObject;

        const toggle = render !== (this.state || {}).render && this.props.onToggle;
        this.setState({render, params}, () => {
            // toggle && console.log('toggle',this.props.path, render);
            toggle && this.props.onToggle(render);
        })
    };

    componentDidUpdate = (prevProps, prevState) => this.state.render !== prevState.render && orNoop(this.props.onToggle)(this.props.render);

    render = () => {
        if (React.Children.count(this.props.children) === 0)
            return null;

        const {children, path, onToggle, proxy, ...otherProps} = this.props;
        const {render, params, variables} = this.state;
        const props = {...otherProps, ...params};
        return (proxy || SimpleProxy)(render, children, props, variables);
    };

    componentDidMount = () => {
        ['popstate', 'pushState', 'replaceState'].forEach(it => window.addEventListener(it, this[urlListener]));
        this[processPath]();
    };

    componentWillUnmount = () => {
        ['popstate', 'pushState', 'replaceState'].forEach(it => window.removeEventListener(it, this[urlListener]));
    };

    [urlListener] = (e) => this[processPath]();
}

const SimpleProxy = (matches, children, props, variables) => {
    if (!matches) return null;
    if (variables.length > 0 || Object.keys(props).length > 0) {
        return React.Children.map(children, child => React.cloneElement(child, props));
    }
    return children;
};

export default Route;