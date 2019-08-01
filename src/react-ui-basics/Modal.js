import React from 'react';
import ReactDOM from 'react-dom';
import ReactCreateElement from './ReactCreateElement';
import './Modal.css'
import Button from "./Button";
import {classNames, orNoop, ref, setTimeout, DOCUMENT, addEventListener, removeEventListener} from "./Tools";
import {PureComponent, componentDidMount, render, props, stateGS} from "./ReactConstants";

let listenerRef;

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

    static defaultContainer = undefined;

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const [isShow, setShow] = stateGS(that, 'show', false);
        const [getMenu, setMenu] = stateGS(that, 'menu');
        const [getBeforeClose, setBeforeClose] = stateGS(that, 'beforeClose');

        const beforeClose = (e) => {
            const bc = getBeforeClose() || props(that).beforeClose;
            if (!bc || bc(that.close))
                that.close(e);
        };
        const addTransitionListener = () => {
            const transitionend = "transitionend";
            let listener = () => {
                that.overlay && removeEventListener(that.overlay, transitionend, listener);
                orNoop(isShow() ? props(that).onOpen : orNoop(props(that).onClose))();
                that.el.style.paddingBottom = isShow() ? '1px' : '0px'; // force invalidate scroll
            };
            that.overlay && addEventListener(that.overlay, transitionend, listener);
        };
        that[render] = () => {
            const {className, top, container = Modal.defaultContainer, children} = props(that);
            const menu = getMenu();
            const show = isShow();
            const modal = <div className={classNames(`Modal`, className, show && 'show')} ref={ref('el', that)}>
                <div ref={ref('overlay', that)} className={classNames(`overlay`, show && 'show')} onClick={beforeClose}>
                </div>
                <div ref={ref('content', that)}
                     className={classNames(`content`, show && 'show', top && 'top')}
                     style={top && {top: top + 'px'}}
                >
                    {React.Children.map(children, child => React.cloneElement(child, {
                        modalMenuConsumer: setMenu,
                        modalBeforeCloseConsumer: setBeforeClose
                    }))}
                    {menu}
                    <Button className="close" flat={true} round={true} onClick={beforeClose}>
                        <i className="material-icons" ref={ref('closeButton', that)}>close</i>
                    </Button>
                </div>
            </div>;

            return container ? ReactDOM.createPortal(modal, container) : modal;
        };

        that[componentDidMount] = () => {
            const _props = props(that);
            orNoop(_props.open)(() => setTimeout(that.open, 0));
            orNoop(_props.close)(() => setTimeout(that.close, 0));
            _props.show && setTimeout(that.open, 0)
        };
        that.close = (e) => {
            const target = e && e.target;
            if (target && !(target === that.overlay || target === that.closeButton || target.classList.contains('close')))
                return true;

            if (!isShow())
                return;

            addTransitionListener();
            setShow(false);

            pollListener(that);
        };
        that.open = () => {
            if (isShow())
                return;

            addTransitionListener();
            setShow(true);

            let listener = event => {
                if (!event.defaultPrevented && event.keyCode === 27/*escape*/)
                    beforeClose();
                return true;
            };

            addListener(that, listener)
        };
    }
}

export default Modal;