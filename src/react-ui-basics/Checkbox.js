import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Checkbox.css'
import {classNames, getRandomId, ref} from "./Tools";
import {PureComponent} from "./ReactConstants";

class Checkbox extends PureComponent {

    constructor(props) {
        super(props);
        this.randomId = getRandomId('cb-');
    }

    render() {
        const {label, name, onChange, value, className} = this.props;
        const id = this.props.id || this.randomId;
        return (
            <div className={classNames("Checkbox", className)} ref={ref('el', this)}>
                <input name={name} id={id} type="checkbox" onChange={onChange} checked={value}/>
                <label htmlFor={id}>{label}</label>
            </div>
        )
    }
}

export default Checkbox