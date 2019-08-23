import React from 'react';
import ReactDOM from 'react-dom';
import ReactCreateElement from './ReactCreateElement';
import './Modal.css'
import Button from "./Button";
import {classNames, orNoop, setTimeout, DOCUMENT, addEventListener, removeEventListener, createRef} from "./Tools";
import {PureComponent, componentDidMount, render, propsGetter, stateGS, componentDidUpdate} from "./ReactConstants";

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

        const [
            isShow, setShow,
            getMenu, setMenu,
            getBeforeClose, setBeforeClose,
        ] = stateGS(that, 3);
        const overlay = createRef();
        const closeButton = createRef();
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
                        modalMenuConsumer: setMenu,
                        modalBeforeCloseConsumer: setBeforeClose
                    }))}
                    {menu}
                    <Button className="close" flat={true} round={true} onClick={beforeClose}>
                        <i className="material-icons" ref={closeButton}>close</i>
                    </Button>
                </div>
            </div>;

            return container ? ReactDOM.createPortal(modal, container) : modal;
        };

        const close = that.close = (e) => {
            const target = e && e.target;
            if (target && !(target === overlay() || target === closeButton() || target.classList.contains('close')))
                return true;

            if (!isShow())
                return;

            addTransitionListener();
            setShow(false);

            pollListener(that);
        };
        const open = that.open = () => {
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

        that[componentDidMount] = () => {
            const _props = props();
            orNoop(_props.open)(() => setTimeout(open, 0));
            orNoop(_props.close)(() => setTimeout(close, 0));
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

Modal.pollListener = pollListener;
Modal.addListener = addListener;

export default Modal;