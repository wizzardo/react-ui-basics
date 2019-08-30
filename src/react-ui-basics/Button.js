import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Button.css'
import {classNames, DOCUMENT, addEventListener, createRef} from "./Tools";
import PropTypes from "prop-types";
import {PureComponent, render, stateGS, props} from "./ReactConstants";

class Button extends PureComponent {
    constructor(properties) {
        super(properties);

        const that = this;
        that.state = {};

        const el = createRef();
        const ripple = createRef();

        const rippleClassName = stateGS(that);

        const onMouseDown = (e) => {
            const rect = el().getBoundingClientRect();
            const rippleElement = ripple();
            const style = rippleElement.style;
            const body = DOCUMENT.body;

            style.height = style.width = Math.max(rect.width, rect.height) + 'px';
            style.top = (e.pageY - rect.top - rippleElement.offsetHeight / 2 - body.scrollTop) + 'px';
            style.left = (e.pageX - rect.left - rippleElement.offsetWidth / 2 - body.scrollLeft) + 'px';

            rippleClassName('show');

            addEventListener(rippleElement, 'animationend', () => {
                rippleClassName('showed');
            });
        };

        that[render] = () => {
            const {children, type, className, onClick, flat, raised = !flat, round, style, disabled, onFocus} = props(that);
            return (
                <button className={classNames('Button',
                    className,
                    disabled && 'disabled',
                    raised && 'raised',
                    flat && 'flat',
                    round && 'round')
                }
                        onFocus={onFocus}
                        disabled={disabled}
                        style={style}
                        type={type}
                        onClick={onClick}
                        onMouseDown={onMouseDown}
                        ref={el}>
                    {children}
                    <span className={classNames(`ripple`, rippleClassName())} ref={ripple}/>
                </button>
            );
        }
    }
}

if(window.isNotProductionEnvironment) {
    Button.propTypes = {
        flat: PropTypes.bool,
        raised: PropTypes.bool,
        round: PropTypes.bool,
        disabled: PropTypes.bool,
        type: PropTypes.oneOf(['button', 'submit', 'reset']),
        className: PropTypes.string,
        onClick: PropTypes.func,
        onFocus: PropTypes.func,
        style: PropTypes.object,
    };
}

Button.defaultProps = {
    type: 'button',
};

export default Button;