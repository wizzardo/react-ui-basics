import React, {ReactElement, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import ReactCreateElement from './ReactCreateElement';
import './Modal.css'
import Button from "./Button";
import {classNames, orNoop, setTimeout, DOCUMENT, addEventListener, removeEventListener, createRef, UNDEFINED, stopPropagation} from "./Tools";
import {PureComponent, componentDidMount, render, propsGetter, stateGSs, componentDidUpdate} from "./ReactConstants";
import MaterialIcon from "./MaterialIcon";

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

type VoidFunction = () => void;

export interface ModalProps {
    className?: string
    top?: number
    container?: Element | DocumentFragment
    children?: ReactNode
    closeIcon?: string | ReactElement
    beforeClose?: (close: VoidFunction) => void
    onOpen?: VoidFunction
    onClose?: VoidFunction
    open?: (open: VoidFunction) => void
    close?: (open: VoidFunction) => void
    show?: boolean
}

abstract class AbstractModal extends PureComponent<ModalProps> {
    close: VoidFunction
    open: VoidFunction
}

class Modal extends AbstractModal {

    static defaultContainer = UNDEFINED
    static pollListener = pollListener
    static addListener = addListener

    static defaultProps = {
        closeIcon: <MaterialIcon icon="close"/>,
    };

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const [
            isShow,
            getMenu,
            getBeforeClose,
        ] = stateGSs<[boolean, any, (close: VoidFunction) => void]>(that, 3);
        const overlay = createRef<HTMLDivElement>();
        const el = createRef<HTMLDivElement>();
        const content = createRef<HTMLDivElement>();
        const props = propsGetter(that);

        const beforeClose = (e) => {
            stopPropagation(e);
            const bc = getBeforeClose() || props().beforeClose;
            if (!bc || bc(that.close))
                that.close();
        };

        const shouldClose = (e) => {
            const isSameModal = el().style.zIndex == (zIndex - 1) + '';
            !(e && content().contains(e.target)) && isSameModal && beforeClose(e);
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
            const {className, top, container = Modal.defaultContainer, children, closeIcon} = props();
            const menu = getMenu();
            const show = isShow();
            const modal = <div className={classNames(`Modal`, className, show && 'show')} ref={el} onClick={shouldClose}>
                <div ref={overlay} className={classNames(`overlay`, show && 'show')}>
                </div>
                <div className={classNames(`content`, show && 'show', top && 'top')}
                     style={top && {top: top + 'px'}}
                     ref={content}
                >
                    {React.Children.map(children, child => {
                        // @ts-ignore
                        return React.cloneElement(child, {
                            modalMenuConsumer: getMenu,
                            modalBeforeCloseConsumer: getBeforeClose
                        });
                    })}
                    {menu}
                    <Button className="close" flat={true} round={true} onClick={beforeClose}>
                        {closeIcon}
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

            el() && (el().style.zIndex = '' + (zIndex++));
            addTransitionListener();
            isShow(true);

            let listener = event => {
                if (!event.defaultPrevented && event.keyCode === 27/*escape*/)
                    beforeClose(event);
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

export default Modal;