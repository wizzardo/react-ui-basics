import React from 'react';
import PropTypes from 'prop-types';
import './Animated.css'
import {allPropsExcept, classNames, setOf, setTimeout, requestAnimationFrame, clearTimeout} from "./Tools";
import {props, state, setState} from "./ReactConstants";

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

const clearTimer = that => that.timeout && clearTimeout(that.timeout);

const doMounting = (that, duration) => {
    setState(that, {
        mounting: true,
        mounted: false,
        unmounting: false,
    });

    that.timeout = setTimeout(() => {
        setState(that, {
            mounting: false,
            mounted: true,
            unmounting: false
        })
    }, duration)
};

const processMounting = (that, duration, mountingDelay) => {
    const _state = state(that);
    if (_state.mounting || _state.mounted) return;
    clearTimer(that);

    if (_state.unmounting)
        return doMounting(that, duration);

    if (mountingDelay) {
        that.timeout = setTimeout(() => {
            if (state(that).mounted) return;
            doMounting(that, duration)
        }, mountingDelay);
    } else {
        doMounting(that, duration);
    }
};

const doUnmounting = (that, duration) => {
    setState(that, {
        enabled: true,
        mounting: false,
        unmounting: true,
        mounted: false
    });
    that.timeout = setTimeout(() => {
        setState(that, {
            enabled: false,
            mounting: false,
            unmounting: false,
            mounted: false
        })
    }, duration);
};

const processUnmounting = (that, duration, unmountingDelay) => {
    const _state = state(that);
    if (_state.unmounting) return;
    clearTimer(that);

    if (_state.mounting)
        return doUnmounting(that, duration);

    if (unmountingDelay) {
        that.timeout = setTimeout(() => {
            if (props(that).value) return;
            doUnmounting(that, duration);
        }, unmountingDelay);
    } else {
        doUnmounting(that, duration);
    }
};

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
        const _props = props(this);
        const {children, className, styles} = _props;
        const {enabled, mounting, mounted, unmounting} = state(this);
        if (!enabled) return null;

        let childStyles = styles.default;
        if (mounting) childStyles = styles.mounting;
        else if (unmounting) childStyles = styles.unmounting;
        else if (mounted) childStyles = styles.mounted || styles.mounting;

        const otherProps = allPropsExcept(_props, selfProps);
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
        const {value, mounting, mountingDelay} = props(this);

        if (!!value)
            processMounting(this, mounting, mountingDelay)
    }

    componentWillUnmount() {
        clearTimer(this)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {mountingDelay, unmountingDelay, value, mounting: mountingDuration, unmounting: unmountingDuration} = props(this);
        const {enabled, mounting, mounted, unmounting} = state(this);

        if (unmounting && value)
            return processMounting(this, mountingDuration, mountingDelay);
        if (mounting && !value)
            return processUnmounting(this, unmountingDuration, unmountingDelay);

        let toggled = (enabled && !value) || (!enabled && !!value);
        if (toggled) {
            if (!!value) {
                // just set enable to true and wait until react will mount children
                setState(this, {enabled: true})
            } else
                processUnmounting(this, unmountingDuration, unmountingDelay);
        } else {
            if (enabled && !mounting && !mounted && !unmounting) {
                // react requires a delay to mount children, one requestAnimationFrame is not enough
                requestAnimationFrame(() => requestAnimationFrame(() => processMounting(this, mountingDuration, mountingDelay)))
            }
        }
    }
}

export default Animated