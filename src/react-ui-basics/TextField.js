import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './TextField.css'
import {classNames, getRandomId, isUndefined, orNoop, ref, addEventListener, createRef} from "./Tools";
import {PureComponent, render, componentDidMount, propsGetter, stateGS} from "./ReactConstants";

class TextField extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const randomId = getRandomId('tf-');
        const [isFocused, setFocused] = stateGS(that);
        const [isErrored, setErrored] = stateGS(that);
        const [isWithValue, setWithValue] = stateGS(that);
        const props = propsGetter(that);

        const inputRef = createRef();
        const check = () => {
            const {required, check} = props();
            const value = inputRef().value;
            const errored = (required && value === '') || (check && !check(value));
            setErrored(errored);
            return !errored;
        };

        const onChange = (e) => {
            orNoop(props().onChange)(e);
            setWithValue(!!inputRef().value);
            check()
        };

        const onFocus = () => {
            setFocused(true);
            orNoop(props().onFocus)();
        };
        const onBlur = () => {
            setFocused(false);
            check();
            orNoop(props().onBlur)();
        };

        that[render] = () => {
            const _props = props();
            const {value, name, type, label, check, disabled, required, min, max, onClick, onKeyDown, autoComplete, error, placeholder, className} = _props;
            const id = _props.id || randomId;
            return (
                <div
                    className={classNames('TextField',
                        isFocused() && 'focused',
                        (value || placeholder || (isWithValue() && isUndefined(value))) && 'withValue',
                        isErrored() && (required || check) && 'errored',
                        disabled && 'disabled',
                        label && 'withLabel',
                        className)}
                    onClick={() => inputRef().focus()}
                >
                    {label && (<label className={classNames(isErrored() && !isFocused() && 'shake')} htmlFor={id}>{label}{required && '*'}</label>)}
                    <input type={type || 'text'} id={id} name={name} value={value} disabled={disabled}
                           min={min}
                           max={max}
                           ref={inputRef}
                           onChange={onChange}
                           onFocus={onFocus}
                           onBlur={onBlur}
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

        that[componentDidMount] = () => {
            const {focused, input} = props(),
                i = inputRef();
            setWithValue(!!i.value);
            focused && i.focus();
            orNoop(input)(i);
        };
        that.check = check;
        that.getInput = inputRef;

        that.withAutofillAnimationCallback = () => {
            addEventListener(inputRef(), 'animationstart', () => setWithValue(true), false);
        };
    }
}

export default TextField
