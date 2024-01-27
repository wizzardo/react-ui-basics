import React, {ChangeEventHandler, ReactElement} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Checkbox.css'
import {classNames, getRandomId} from "./Tools";
import {PureComponent, render, propsGetter} from "./ReactConstants";

export interface CheckboxProps {
    value: boolean,
    onChange: ChangeEventHandler<HTMLInputElement>,
    label?: string | ReactElement,
    name?: string,
    id?: string | number,
    disabled?: boolean,
    className?: string,
}

class Checkbox extends PureComponent<CheckboxProps> {

    constructor(properties) {
        super(properties);
        const randomId = getRandomId('cb-');
        const props = propsGetter(this);

        this[render] = () => {
            const {label, name, onChange, value, className, disabled} = props();
            const id = (props().id || randomId) + '';
            return (
                <div className={classNames("Checkbox", className)}>
                    <input name={name} id={id} type="checkbox" onChange={onChange} checked={value} disabled={disabled}/>
                    <label htmlFor={id}>{label}</label>
                </div>
            )
        }
    }
}

export default Checkbox