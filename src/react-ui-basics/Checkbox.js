import React from 'react';
import './Checkbox.css'
import {classNames} from "./Tools";

const getRandomId = () => `cb-${Math.random()}`;

class Checkbox extends React.Component {
    randomId = getRandomId();

    render() {
        const {label, onChange, value, className} = this.props;
        const id = this.props.id || this.randomId;
        return (
            <div className={classNames("Checkbox", className)} ref={it => this.el = it}>
                <input id={id} type="checkbox" onChange={onChange} checked={value}/>
                <label htmlFor={id}>{label}</label>
            </div>
        )
    }
}

export default Checkbox