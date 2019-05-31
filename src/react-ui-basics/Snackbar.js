import React from 'react';
import './Snackbar.css'
import {classNames, setTimeout, clearTimeout} from "./Tools";
import {componentWillUnmount, render, state, props, className, setState} from "./ReactConstants";

const shown = 'shown';

class Snackbar extends React.PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {
            [shown]: false,
            text: '',
        };
        let timeout;
        that[componentWillUnmount] = () => {
            clearTimeout(timeout);
        };
        that[render] = () => {
            const _state = state(that),
                _props = props(that);

            return (
                <div className={classNames(`Snackbar`, _props[className], _state[shown] && shown)}>
                    <div className="message">{_state.text}</div>
                </div>
            )
        };

        that.show = (text) => {
            if (state(that)[shown]) {
                clearTimeout(timeout);
                setState(that, {[shown]: false});
                timeout = setTimeout(() => that.show(text), 260);
            } else {
                setState(that, {[shown]: true, text});
                timeout = setTimeout(() => setState(that, {[shown]: false}), 3000);
            }
        }
    }
}

export default Snackbar;