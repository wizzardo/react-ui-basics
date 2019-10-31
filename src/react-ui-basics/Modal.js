import React from 'react';
import ReactDOM from 'react-dom';
import ReactCreateElement from './ReactCreateElement';
import './Modal.css'
import Button from "./Button";
import {classNames, orNoop, setTimeout, DOCUMENT, addEventListener, removeEventListener, createRef, UNDEFINED} from "./Tools";
import {PureComponent, componentDidMount, render, propsGetter, stateGSs, componentDidUpdate} from "./ReactConstants";
import MaterialIcon from "./MaterialIcon";
import PropTypes from "prop-types";

let listenerRef;
let zIndex = 100;

const EVENT_TYPE = 'keydown';
const pollListener = (modal) => {
    removeEventListener(DOCUMENT, EVENT_TYPE, listenerRef);
    const listener = modal._pl;
    listener && addEventListener(DOCUMENT, EVENT_TYPE, listener);
    listenerRef = listener;
};

const addListener = (modal, listener) => {
    const prev = listenerRef;
    prev && removeEventListener(DOCUMENT, EVENT_TYPE, prev);
    modal._pl = prev;
    addEventListener(DOCUMENT, EVENT_TYPE, listenerRef = listener);
};

class Modal extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const [
            isShow,
            getMenu,
            getBeforeClose,
        ] = stateGSs(that, 3);
        const overlay = createRef();
        const el = createRef();
        const props = propsGetter(that);

        const beforeClose = (e) => {
            const bc = getBeforeClose() || props().beforeClose;
            if (!bc || bc(that.close))
                that.close(e);
        };
        const addTransitionListener = () => {
            const transitionend = "transitionend";
            let listener = () => {
                removeEventListener(overlay(), transitionend, listener);
                orNoop(isShow() ? props().onOpen : orNoop(props().onClose))();
                el() && (el().style.paddingBottom = isShow() ? '1px' : '0px'); // force invalidate scroll
            };
            addEventListener(overlay(), transitionend, listener);
        };
        that[render] = () => {
            const {className, top, container = Modal.defaultContainer, children} = props();
            const menu = getMenu();
            const show = isShow();
            const modal = <div className={classNames(`Modal`, className, show && 'show')} ref={el}>
                <div ref={overlay} className={classNames(`overlay`, show && 'show')} onClick={beforeClose}>
                </div>
                <div className={classNames(`content`, show && 'show', top && 'top')}
                     style={top && {top: top + 'px'}}
                >
                    {React.Children.map(children, child => React.cloneElement(child, {
                        modalMenuConsumer: getMenu,
                        modalBeforeCloseConsumer: getBeforeClose
                    }))}
                    {menu}
                    <Button className="close" flat={true} round={true} onClick={beforeClose}>
                        <MaterialIcon icon={'close'}/>
                    </Button>
                </div>
            </div>;

            return container ? ReactDOM.createPortal(modal, container) : modal;
        };

        const close = that.close = () => {
            if (!isShow())
                return;

            zIndex--;
            addTransitionListener();
            isShow(false);

            pollListener(that);
        };
        const open = that.open = () => {
            if (isShow())
                return;

            el() && (el().style.zIndex = zIndex++);
            addTransitionListener();
            isShow(true);

            let listener = event => {
                if (!event.defaultPrevented && event.keyCode === 27/*escape*/)
                    beforeClose();
                return true;
            };

            addListener(that, listener)
        };

        that[componentDidMount] = () => {
            const _props = props();
            orNoop(_props.open)(() => {
                setTimeout(open, 0);
            });
            orNoop(_props.close)(() => {
                setTimeout(close, 0);
            });
            _props.show && setTimeout(open, 0)
        };
        that[componentDidUpdate] = (prevProps) => {
            const show = props().show;
            if (show !== prevProps.show) {
                show ? open() : close();
            }
        };
    }
}

Modal.defaultContainer = UNDEFINED;
Modal.pollListener = pollListener;
Modal.addListener = addListener;

export default Modal;

if (window.isNotProductionEnvironment) {
    Modal.propTypes = {
        className: PropTypes.string,
        top: PropTypes.number,
        container: PropTypes.node,
    };
}