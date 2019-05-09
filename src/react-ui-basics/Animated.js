import React from 'react';
import PropTypes from 'prop-types';
import './Animated.css'
import {allPropsExcept, classNames, setOf} from "./Tools";

const selfProps = setOf([
    'children',
    'className',
    'styles',
    'mountingDelay',
    'unmountingDelay',
    'mounting',
    'unmounting',
    'value',
]);

class Animated extends React.PureComponent {

    static propTypes = {
        value: PropTypes.bool,
        className: PropTypes.string,
        styles: PropTypes.shape({
            mounting: PropTypes.object,
            mounted: PropTypes.object,
            unmounting: PropTypes.object,
        }),
        mountingDelay: PropTypes.number,
        unmountingDelay: PropTypes.number,
        mounting: PropTypes.number,
        unmounting: PropTypes.number,
    };

    static defaultProps = {
        className: 'animated',
        mounting: 250,
        unmounting: 250,
        styles: {},
        mountingDelay: 0,
        unmountingDelay: 0,
    };

    constructor(props) {
        super(props);
        this.state = {
            enabled: false,
            mounting: false,
            unmounting: false,
            mounted: false,
        };
    }

    render() {
        const {children, className, mountingDelay, styles} = this.props;
        const {enabled, mounting, mounted, unmounting} = this.state;
        if (!enabled) return null;

        if (!mounting && !mounted && !unmounting) {
            this.clearTimeout();
            this.timeout = setTimeout(() =>
                this.mounting(this.props.mounting, mountingDelay), 1);
        }

        let childStyles = styles.default;
        if (mounting) childStyles = styles.mounting;
        else if (unmounting) childStyles = styles.unmounting;
        else if (mounted) childStyles = styles.mounted || styles.mounting;

        const otherProps = allPropsExcept(this.props, selfProps);
        return React.Children.map(children, child =>
            child && React.cloneElement(child, {
                className: classNames(
                    child.props.className,
                    className,
                    mounting && 'mounting',
                    mounted && 'mounted',
                    unmounting && 'unmounting'
                ),
                style: {...child.props.style, ...childStyles},
                ...otherProps,
            }));
    }

    componentDidMount() {
        const {value, mounting, mountingDelay} = this.props;

        if (!!value)
            this.mounting(mounting, mountingDelay)
    }

    componentWillUnmount() {
        this.clearTimeout();
    }

    clearTimeout = () => this.timeout && clearTimeout(this.timeout);

    mounting = (duration, mountingDelay) => {
        if (this.state.mounting || this.state.mounted) return;
        this.clearTimeout();

        const doMounting = () => {
            this.setState({
                mounting: true,
                mounted: false,
                unmounting: false,
            });

            this.timeout = setTimeout(() => {
                this.setState({
                    mounting: false,
                    mounted: true,
                    unmounting: false
                })
            }, duration)
        };

        if (this.state.unmounting) return doMounting();

        this.timeout = setTimeout(() => {
            if (this.state.mounted) return;

            this.setState({enabled: true});
            if (this.state.enabled)
                this.timeout = setTimeout(doMounting, 1);
            else
                doMounting()
        }, mountingDelay);
    };

    unmounting = (duration, unmountingDelay) => {
        if (this.state.unmounting) return;
        this.clearTimeout();

        const doUnmounting = () => {
            this.setState({
                enabled: true,
                mounting: false,
                unmounting: true,
                mounted: false
            });
            this.timeout = setTimeout(() => {
                this.setState({
                    enabled: false,
                    mounting: false,
                    unmounting: false,
                    mounted: false
                })
            }, duration);
        };

        if (this.state.mounting) return doUnmounting();

        this.timeout = setTimeout(() => {
            if (this.props.value)
                return;
            doUnmounting();
        }, unmountingDelay);
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.unmounting && this.props.value)
            return this.mounting(this.props.mounting, this.props.mountingDelay);
        if (this.state.mounting && !this.props.value)
            return this.unmounting(this.props.unmounting, this.props.unmountingDelay);

        let toggled = (this.state.enabled && !this.props.value) || (!this.state.enabled && !!this.props.value);
        if (toggled) {
            if (!!this.props.value)
                this.mounting(this.props.mounting, this.props.mountingDelay);
            else
                this.unmounting(this.props.unmounting, this.props.unmountingDelay);
        }
    }
}

export default Animated