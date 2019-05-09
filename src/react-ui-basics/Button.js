import React from 'react';
import './Button.css'
import {classNames, ref} from "./Tools";

const rippleClassName = 'rcn';

class Button extends React.PureComponent {
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

        ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
        ripple.style.top = (e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop) + 'px';
        ripple.style.left = (e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft) + 'px';

        this.setState({[rippleClassName]: 'show'});

        ripple.addEventListener('animationend', () => {
            this.setState({[rippleClassName]: 'showed'});
        });
    };
}

export default Button;