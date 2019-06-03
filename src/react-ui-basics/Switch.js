import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Switch.css'
import {getRandomId, ref} from "./Tools";
import {PureComponent} from "./ReactConstants";

class Switch extends PureComponent {

    constructor(props) {
        super(props);
        this.randomId = getRandomId('sw-');
    }

    render() {
        const {label, labelOn, labelOff, onChange, value, onClick} = this.props;
        const id = this.props.id || this.randomId;
        return (
            <div className="Switch" ref={ref('el', this)} onClick={onClick}>
                <input type="checkbox" id={id} className="switch-input" onChange={onChange} checked={value}/>

                <label htmlFor={id} className="switch-label">
                    {label && <span className="label">{label}</span>}
                    {labelOn && <span className="toggle--on">{labelOn}</span>}
                    {labelOff && <span className="toggle--off">{labelOff}</span>}
                </label>
            </div>
        )
    }
}

export default Switch