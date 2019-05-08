import React from 'react';
import './TextField.css'
import {classNames, getRandomId, orNoop, ref} from "./Tools";

class TextField extends React.PureComponent {
    randomId = getRandomId('tf-');

    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            withValue: !!props.value,
        }
    }

    render = () => {
        const {value, name, type, label, check, disabled, required, min, max, onClick, onKeyDown, autoComplete, error, placeholder, className} = this.props;
        const id = this.props.id || this.randomId;
        const {focused, errored, withValue} = this.state;
        return (
            <div
                className={classNames('TextField',
                    focused && 'focused',
                    (value || placeholder || (withValue && value === undefined)) && 'withValue',
                    errored && (required || check) && 'errored',
                    disabled && 'disabled',
                    label && 'withLabel',
                    className)}
                onClick={() => this.input.focus()}
                ref={ref('el', this)}>
                {label && (<label className={`${errored && !focused && 'shake'}`} htmlFor={id}>{label}{required && '*'}</label>)}
                <input type={type || 'text'} id={id} name={name} value={value} disabled={disabled}
                       min={min}
                       max={max}
                       ref={ref('input', this)}
                       onChange={this.onChange}
                       onFocus={this.onFocus}
                       onBlur={this.onBlur}
                       onClick={onClick}
                       onKeyDown={onKeyDown}
                       autoComplete={autoComplete || 'on'}
                       placeholder={placeholder}
                />
                <div className="border">
                    <div className="line"/>
                </div>
                {error && <div className="error">{error}</div>}
            </div>
        )
    };

    onChange = (e) => {
        orNoop(this.props.onChange)(e);
        this.setState({withValue: !!this.input.value});
        this.check()
    };
    onFocus = () => {
        this.setState({focused: true});
        orNoop(this.props.onFocus)();
    };
    onBlur = () => {
        this.setState({focused: false});
        this.check();
        orNoop(this.props.onBlur)();
    };
    check = () => {
        const {required, check} = this.props;
        const errored = (required && this.input.value === '') || (check && !check(this.input.value));
        this.setState({errored});
        return !errored;
    };
    getInput = () => this.input;

    withAutofillAnimationCallback = () => {
        this.input.addEventListener('animationstart', () => this.setState({withValue: true}), false);
    };

    componentDidMount = () => {
        const {focused, input} = this.props;
        focused && this.input.focus();
        orNoop(input)(this.input);
    };
}

export default TextField
