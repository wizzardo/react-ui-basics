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
            enabled: !!props.value,
            mounting: false,
            unmounting: false,
            mounted: false,
        };
    }

    render() {
        const {children, className, styles} = this.props;
        const {enabled, mounting, mounted, unmounting} = this.state;
        if (!enabled) return null;

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

    clearTimeout = () => this.timeout && clearTimeout(this.timeout);

    componentWillUnmount = this.clearTimeout;

    doMounting = (duration) => {
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

    mounting = (duration, mountingDelay) => {
        if (this.state.mounting || this.state.mounted) return;
        this.clearTimeout();

        if (this.state.unmounting)
            return this.doMounting(duration);

        if (mountingDelay) {
            this.timeout = setTimeout(() => {
                if (this.state.mounted) return;
                this.doMounting(duration)
            }, mountingDelay);
        } else {
            this.doMounting(duration);
        }
    };

    doUnmounting = (duration) => {
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

    unmounting = (duration, unmountingDelay) => {
        if (this.state.unmounting) return;
        this.clearTimeout();

        if (this.state.mounting)
            return this.doUnmounting(duration);

        if (unmountingDelay) {
            this.timeout = setTimeout(() => {
                if (this.props.value) return;
                this.doUnmounting(duration);
            }, unmountingDelay);
        } else {
            this.doUnmounting(duration);
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {mountingDelay, unmountingDelay, value, mounting: mountingDuration, unmounting: unmountingDuration} = this.props;
        const {enabled, mounting, mounted, unmounting} = this.state;

        if (unmounting && value)
            return this.mounting(mountingDuration, mountingDelay);
        if (mounting && !value)
            return this.unmounting(unmountingDuration, unmountingDelay);

        let toggled = (enabled && !value) || (!enabled && !!value);
        if (toggled) {
            if (!!value) {
                // just set enable to true and wait until react will mount children
                this.setState({enabled: true})
            } else
                this.unmounting(unmountingDuration, unmountingDelay);
        } else {
            if (enabled && !mounting && !mounted && !unmounting) {
                // react requires a delay to mount children, one requestAnimationFrame is not enough
                requestAnimationFrame(() => requestAnimationFrame(() => this.mounting(mountingDuration, mountingDelay)))
            }
        }
    }
}

export default Animated