import React, {ChangeEventHandler, MouseEventHandler, ReactElement} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Switch.css'
import {getRandomId, classNames} from "./Tools";
import {PureComponent, render} from "./ReactConstants";

export interface SwitchProps {
    value: boolean,
    id?: string | number,
    label?: string | ReactElement,
    className?: string,
    labelOn?: string | ReactElement,
    labelOff?: string | ReactElement,
    onChange?: ChangeEventHandler,
    onClick?: MouseEventHandler
}

class Switch extends PureComponent<SwitchProps> {

    constructor(props) {
        super(props);
        const randomId = getRandomId('sw-');

        this[render] = () => {
            const {label, className, labelOn, labelOff, onChange, value, onClick} = this.props;
            const id = (this.props.id || randomId) + '';
            return (
                <div className={classNames("Switch", className)} onClick={onClick}>
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
}

export default Switch