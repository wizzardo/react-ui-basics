import React, {ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, ReactElement} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './TextField.css'
import {classNames, getRandomId, isUndefined, orNoop, addEventListener, createRef, setTimeout} from "./Tools";
import {PureComponent, render, componentDidMount, propsGetter, stateGSs, componentDidUpdate} from "./ReactConstants";

export interface TextAreaProps {
    id?: string,
    className?: string,
    value?: string,
    name?: string,
    type?: string,
    autoComplete?: string,
    placeholder?: string,
    label?: string | ReactElement,
    check?: (value: string) => boolean,
    onClick?: MouseEventHandler<HTMLInputElement>,
    onMouseUp?: MouseEventHandler<HTMLInputElement>,
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>,
    onKeyUp?: KeyboardEventHandler<HTMLInputElement>,
    onFocus?: () => void,
    onBlur?: () => void,
    onChange: ChangeEventHandler<HTMLInputElement>,
    required?: boolean,
    disabled?: boolean,
    focused?: boolean,
    min?: string | number,
    max?: string | number,
    input?: (el: HTMLInputElement) => void,
}

abstract class AbstractTextField extends PureComponent<TextAreaProps> {
    check: () => void
    getInput: () => HTMLInputElement
    withAutofillAnimationCallback: () => void
}

class TextField extends AbstractTextField {

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

        const inputRef = createRef<HTMLInputElement>();
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
            let hasValue = !!i.value;
            isWithValue(hasValue);

            !hasValue && setTimeout(() => {
                try {
                    let matches = i.matches(':-internal-autofill-selected');
                    matches && isWithValue(matches)
                } catch (ignored) {
                }
            }, 100)

            focused && i.focus();
            orNoop(input)(i);
        };
        that[componentDidUpdate] = () => {
            if (props().value !== inputRef().value)
                check();
            const {focused} = props(),
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

export default TextField
