import React from 'react';
import './Checkbox.css'
import {classNames, getRandomId, ref} from "./Tools";

class Checkbox extends React.PureComponent {

    constructor(props) {
        super(props);
        this.randomId = getRandomId('cb-');
    }

    render() {
        const {label, onChange, value, className} = this.props;
        const id = this.props.id || this.randomId;
        return (
            <div className={classNames("Checkbox", className)} ref={ref('el', this)}>
                <input id={id} type="checkbox" onChange={onChange} checked={value}/>
                <label htmlFor={id}>{label}</label>
            </div>
        )
    }
}

export default Checkbox