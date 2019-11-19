import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Checkbox.css'
import {classNames, getRandomId} from "./Tools";
import {PureComponent, render, propsGetter} from "./ReactConstants";
import PropTypes from "prop-types";

class Checkbox extends PureComponent {

    constructor(properties) {
        super(properties);
        const randomId = getRandomId('cb-');
        const props = propsGetter(this);

        this[render] = () => {
            const {label, name, onChange, value, className, disabled} = props();
            const id = props().id || randomId;
            return (
                <div className={classNames("Checkbox", className)}>
                    <input name={name} id={id} type="checkbox" onChange={onChange} checked={value} disabled={disabled}/>
                    <label htmlFor={id}>{label}</label>
                </div>
            )
        }
    }
}

if (window.isNotProductionEnvironment) {
    Checkbox.propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.bool,
        disabled: PropTypes.bool,
        className: PropTypes.string,
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        name: PropTypes.string,
        id: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
    };
}

export default Checkbox