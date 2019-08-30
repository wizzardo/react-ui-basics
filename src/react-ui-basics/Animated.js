import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import PropTypes from 'prop-types';
import './Animated.css'
import {allPropsExcept, classNames, setOf, setTimeout, requestAnimationFrame, clearTimeout} from "./Tools";
import {props, state, setState, componentWillUnmount, componentDidMount, render, componentDidUpdate, className, children, PureComponent} from "./ReactConstants";

let mounting = 'mounting',
    unmounting = 'unmounting',
    mounted = 'mounted',
    enabled = 'enabled',
    mountingDelay = 'mountingDelay',
    unmountingDelay = 'unmountingDelay',
    timeout = 'timeout',
    value = 'value'
;

const selfProps = setOf([
    children,
    className,
    'styles',
    mountingDelay,
    unmountingDelay,
    mounting,
    unmounting,
    value,
]);

const clearTimer = that => clearTimeout(that[timeout]);

const animatedState = (isEnabled, isMounting, isMounted, isUnMounting) => {
    const r = {};
    r[enabled] = isEnabled;
    r[mounting] = isMounting;
    r[mounted] = isMounted;
    r[unmounting] = isUnMounting;
    return r;
};

const doMounting = (that, duration) => {
    setState(that, animatedState(true, true, false, false));

    that[timeout] = setTimeout(setState, duration, that, animatedState(true, false, true, false))
};

const processMounting = (that, duration, mountingDelay) => {
    const _state = state(that);
    if (_state[mounting] || _state[mounted]) return;
    clearTimer(that);

    if (_state[unmounting])
        return doMounting(that, duration);

    if (mountingDelay) {
        that[timeout] = setTimeout(() => {
            if (state(that)[mounted]) return;
            doMounting(that, duration)
        }, mountingDelay);
    } else {
        doMounting(that, duration);
    }
};

const doUnmounting = (that, duration) => {
    setState(that, animatedState(true, false, false, true));
    that[timeout] = setTimeout(setState, duration, that, animatedState(false, false, false, false));
};

const processUnmounting = (that, duration, unmountingDelay) => {
    const _state = state(that);
    if (_state[unmounting]) return;
    clearTimer(that);

    if (_state[mounting])
        return doUnmounting(that, duration);

    if (unmountingDelay) {
        that[timeout] = setTimeout(() => {
            if (props(that)[value]) return;
            doUnmounting(that, duration);
        }, unmountingDelay);
    } else {
        doUnmounting(that, duration);
    }
};

class Animated extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = animatedState(!!properties[value]);

        that[componentDidMount] = () => {
            const _props = props(that);
            if (!!_props[value])
                processMounting(that, _props[mounting], _props[mountingDelay])
        };

        that[componentWillUnmount] = () => {
            clearTimer(that)
        };

        that[render] = () => {
            const _state = state(that);
            if (!_state[enabled]) return null;

            const _props = props(that),
                {styles} = _props,
                {
                    [mounting]: isMounting,
                    [unmounting]: isUnMounting,
                    [mounted]: isMounted,
                } = _state;

            let childStyles = styles.default;
            if (isMounting)
                childStyles = styles[mounting];
            else if (isUnMounting)
                childStyles = styles[unmounting];
            else if (isMounted)
                childStyles = styles[mounted] || styles[mounting];

            const otherProps = allPropsExcept(_props, selfProps);
            return React.Children.map(_props[children], child =>
                child && React.cloneElement(child, {
                    [className]: classNames(
                        props(child)[className],
                        _props[className],
                        isMounting && mounting,
                        isMounted && mounted,
                        isUnMounting && unmounting
                    ),
                    style: {...props(child).style, ...childStyles},
                    ...otherProps,
                }));
        };

        that[componentDidUpdate] = () => {
            const _props = props(that),
                _state = state(that),
                {
                    [value]: v,
                    [mounting]: mountingDuration,
                    [unmounting]: unmountingDuration,
                } = _props,
                {
                    [mounting]: isMounting,
                    [unmounting]: isUnMounting,
                    [mounted]: isMounted,
                    [enabled]: isEnabled,
                } = _state;

            if (isUnMounting && v)
                return processMounting(that, mountingDuration, _props[mountingDelay]);
            if (isMounting && !v)
                return processUnmounting(that, unmountingDuration, _props[unmountingDelay]);

            let toggled = (isEnabled && !v) || (!isEnabled && !!v);
            if (toggled) {
                if (!!v) {
                    // just set enable to true and wait until react will mount children
                    setState(that, animatedState(true))
                } else
                    processUnmounting(that, unmountingDuration, _props[unmountingDelay]);
            } else {
                if (isEnabled && !isMounting && !isMounted && !isUnMounting) {
                    // react requires a delay to mount children, one requestAnimationFrame is not enough
                    requestAnimationFrame(() => requestAnimationFrame(() => processMounting(that, mountingDuration, _props[mountingDelay])))
                }
            }
        }
    }
}

if (window.isNotProductionEnvironment) {
    Animated.propTypes = {
        [value]: PropTypes.bool,
        [className]: PropTypes.string,
        styles: PropTypes.shape({
            [mounting]: PropTypes.object,
            [mounted]: PropTypes.object,
            [unmounting]: PropTypes.object,
        }),
        [mountingDelay]: PropTypes.number,
        [unmountingDelay]: PropTypes.number,
        [mounting]: PropTypes.number,
        [unmounting]: PropTypes.number,
    };
}

Animated.defaultProps = {
    [className]: 'animated',
    [mounting]: 250,
    [unmounting]: 250,
    styles: {},
    [mountingDelay]: 0,
    [unmountingDelay]: 0,
};

// forcing webpack to NOT inline constant fields
// mounting = mounting || 1;
// mounted = mounted || 1;
// unmounting = unmounting || 1;
// enabled = enabled || 1;
// mountingDelay = mountingDelay || 1;
// unmountingDelay = unmountingDelay || 1;
// value = value || 1;
// timeout = timeout || 1;

export default Animated