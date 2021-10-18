import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './TextField.css'
import {classNames, getRandomId, isUndefined, orNoop, addEventListener, createRef, setTimeout} from "./Tools";
import {PureComponent, render, componentDidMount, propsGetter, stateGSs, componentDidUpdate} from "./ReactConstants";
import PropTypes from "prop-types";

class TextField extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const randomId = getRandomId('tf-');
        const [
            isFocused,
            errorState,
            isWithValue,
        ] = stateGSs(that, 3);
        const props = propsGetter(that);

        const inputRef = createRef();
        const check = () => {
            const {required, check} = props();
            const value = inputRef().value;
            const error = (required && value === '') || (check && check(value));
            errorState() !== error && setTimeout(errorState, 0, error);
            return error;
        };

        const onChange = (e) => {
            orNoop(props().onChange)(e);
            isWithValue(!!inputRef().value);
            check()
        };

        const onFocus = () => {
            isFocused(true);
            orNoop(props().onFocus)();
        };
        const onBlur = () => {
            isFocused(false);
            check();
            orNoop(props().onBlur)();
        };

        that[render] = () => {
            const _props = props();
            const {value, name, type, label, check, disabled, required, min, max, onClick, onKeyDown, onKeyUp, onMouseUp, autoComplete, placeholder, className} = _props;
            const id = _props.id || randomId;
            const error = errorState();
            return (
                <div
                    className={classNames('TextField',
                        isFocused() && 'focused',
                        (value || placeholder || (isWithValue() && isUndefined(value))) && 'withValue',
                        error && (required || check) && 'errored',
                        disabled && 'disabled',
                        label && 'withLabel',
                        className)}
                    onClick={() => {
                        inputRef().focus();
                    }}
                >
                    {label && (<label className={classNames(error && !isFocused() && 'shake')} htmlFor={id}>{label}{required && ' *'}</label>)}
                    <input type={type || 'text'} id={id} name={name} value={value} disabled={disabled}
                           min={min}
                           max={max}
                           ref={inputRef}
                           onChange={onChange}
                           onFocus={onFocus}
                           onBlur={onBlur}
                           onClick={onClick}
                           onKeyDown={onKeyDown}
                           onKeyUp={onKeyUp}
                           onMouseUp={onMouseUp}
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

        that[componentDidMount] = () => {
            const {focused, input} = props(),
                i = inputRef();
            isWithValue(!!i.value);
            focused && i.focus();
            orNoop(input)(i);
        };
        that[componentDidUpdate] = () => {
            if (props().value !== inputRef().value)
                check();
            const { focused } = props(),
                i = inputRef();
            focused && i.focus();
        };
        that.check = check;
        that.getInput = inputRef;

        that.withAutofillAnimationCallback = () => {
            addEventListener(inputRef(), 'animationstart', () => {
                isWithValue(true);
            }, false);
        };
    }
}

if (window.isNotProductionEnvironment) {
    TextField.propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        value: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        autoComplete: PropTypes.string,
        placeholder: PropTypes.string,
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        check: PropTypes.func,
        onClick: PropTypes.func,
        onKeyDown: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        min: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        max: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
    };
}

export default TextField
