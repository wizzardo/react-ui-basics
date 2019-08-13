import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Button.css'
import {classNames, ref, DOCUMENT, addEventListener} from "./Tools";
import PropTypes from "prop-types";
import {PureComponent} from "./ReactConstants";

const rippleClassName = 'rcn';

class Button extends PureComponent {
    render = () => {
        const {children, type, className, onClick, flat, raised = !flat, round, style, disabled, onFocus} = this.props;
        const rippleClass = (this.state || {})[rippleClassName];
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
                    type={type || 'button'}
                    onClick={onClick}
                    onMouseDown={this.onMouseDown}
                    ref={ref('el', this)}>
                {children}
                <span className={classNames(`ripple`, rippleClass)} ref={ref('ripple', this)}/>
            </button>
        );
    };

    onMouseDown = (e) => {
        const {el, ripple} = this;
        const rect = el.getBoundingClientRect();
        const style = ripple.style;

        style.height = style.width = Math.max(rect.width, rect.height) + 'px';
        style.top = (e.pageY - rect.top - ripple.offsetHeight / 2 - DOCUMENT.body.scrollTop) + 'px';
        style.left = (e.pageX - rect.left - ripple.offsetWidth / 2 - DOCUMENT.body.scrollLeft) + 'px';

        this.setState({[rippleClassName]: 'show'});

        addEventListener(ripple, 'animationend', () => {
            this.setState({[rippleClassName]: 'showed'});
        });
    };
}

Button.propTypes = {
    flat: PropTypes.bool,
    raised: PropTypes.bool,
    round: PropTypes.bool,
    disabled: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
};

Button.defaultProps = {
    type: 'button',
};

export default Button;