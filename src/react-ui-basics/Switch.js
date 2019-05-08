import React from 'react';
import './Switch.css'

const getRandomId = () => `sw-${Math.random()}`;

class Switch extends React.Component {

    render() {
        const {id = getRandomId(), label, labelOn, labelOff, onChange, value, onClick} = this.props;
        return (
            <div className="Switch" ref={it => this.el = it} onClick={onClick}>
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