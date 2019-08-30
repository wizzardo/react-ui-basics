import React from 'react';
import ReactDOM from 'react-dom';
import ReactCreateElement from './ReactCreateElement';
import PropTypes from "prop-types";
import './Snackbar.css'
import {classNames, setTimeout, clearTimeout} from "./Tools";
import {componentWillUnmount, render, props, className, PureComponent, stateGSs} from "./ReactConstants";

const shown = 'shown';

class Snackbar extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};
        const [
            isShow,
            getText
        ] = stateGSs(this, 2);

        let timeout;
        that[componentWillUnmount] = () => {
            clearTimeout(timeout);
        };
        that[render] = () => {
            const _props = props(that);
            const {container} = _props;

            const el = <div className={classNames(`Snackbar`, _props[className], isShow() && shown)}>
                <div className="message">{getText() || _props.text}</div>
            </div>;
            return container ? ReactDOM.createPortal(el, container) : el;
        };

        that.show = (text) => {
            if (isShow()) {
                clearTimeout(timeout);
                isShow(false);
                timeout = setTimeout(that.show, 260, text)
            } else {
                isShow(true);
                getText(text);
                timeout = setTimeout(isShow, 3000, false);
            }
        }
    }
}

if (window.isNotProductionEnvironment) {
    Snackbar.propTypes = {
        className: PropTypes.string,
        text: PropTypes.string,
        container: PropTypes.node,
    };
}

export default Snackbar;