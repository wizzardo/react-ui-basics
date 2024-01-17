import React from 'react';
import ReactDOM from 'react-dom';
import ReactCreateElement from './ReactCreateElement';
import './Snackbar.css'
import {classNames, setTimeout, clearTimeout} from "./Tools";
import {componentWillUnmount, render, props, className, PureComponent, stateGSs} from "./ReactConstants";

const shown = 'shown';

export interface SnackbarProps {
    className?: string,
    text?: string,
    container?: Element,
}

type SnackbarState = [
    (v?: boolean) => boolean,
    (v?: string) => string,
    (v?: string) => string,
]

class Snackbar extends PureComponent<SnackbarProps> {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};
        const [
            isShow,
            getText,
            clazzName
        ] = stateGSs(this, 3) as SnackbarState;

        let timeout;
        that[componentWillUnmount] = () => {
            clearTimeout(timeout);
        };
        that[render] = () => {
            const _props = props(that);
            const {container} = _props;

            const el = <div className={classNames(`Snackbar`, _props[className], isShow() && shown, clazzName())}>
                <div className="message">{getText() || _props.text}</div>
            </div>;
            return container ? ReactDOM.createPortal(el, container) : el;
        };

        const hide = () => {
            isShow(false)
            clazzName(null)
        }

        that.show = (text: string, className: string) => {
            if (isShow()) {
                clearTimeout(timeout);
                isShow(false);
                timeout = setTimeout(that.show, 260, text, className)
            } else {
                isShow(true);
                getText(text);
                clazzName(className)
                timeout = setTimeout(hide, 3000);
            }
        }
    }

    show(text: string, className: string) {
    }
}

export default Snackbar;