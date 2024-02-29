import React, {MouseEventHandler, ReactElement} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Dialog.css'
import Button from "./Button";
import Modal from "./Modal";
import {isUndefined, orNoop, preventDefault, ref, UNDEFINED, classNames, createRef} from "./Tools";
import {PureComponent, render, componentDidMount, propsGetter, stateGSs} from "./ReactConstants";


type StringOrReactElement = string | ReactElement;

export interface DialogProps {
    title?: StringOrReactElement,
    description?: StringOrReactElement,
    accept?: StringOrReactElement,
    cancel?: StringOrReactElement,
    className?: string,
    top?: number,
    onAccept?: MouseEventHandler,
    onCancel?: MouseEventHandler,
}

class Dialog extends PureComponent<DialogProps> {
    static defaultProps = {
        accept: 'Accept',
        cancel: 'Decline',
    }

    constructor(properties) {
        super(properties);

        this[render] = () => {
            const {title, description, accept, cancel, onAccept, onCancel, children} = this.props;
            return <div className="Dialog">
                {title && <div className="title">{title}</div>}
                {description && <div className="description">{description}</div>}
                {children}
                <div className="row right">
                    {cancel && <Button flat={true} onClick={onCancel}>{cancel}</Button>}
                    {accept && <Button flat={true} onClick={onAccept}>{accept}</Button>}
                </div>
            </div>
        }
    }
}


const throwIfPropExists = (key, props) => {
    if (props[key]) throw Error(key + " was already set by props")
};

export type OpenDialogFn = (
    onAccept?: MouseEventHandler,
    onCancel?: MouseEventHandler,
    title?: StringOrReactElement,
    description?: StringOrReactElement,
    accept?: StringOrReactElement,
    cancel?: StringOrReactElement
) => void;

export type CloseDialogFn = () => void;

abstract class AbstractDialogWrapper extends PureComponent<DialogWrapperProps> {
    open: OpenDialogFn
    close: CloseDialogFn
}

export interface DialogWrapperProps extends DialogProps {
    show?: boolean,
    open?: (open: OpenDialogFn) => void,
    close?: (close: CloseDialogFn) => void,
}

class DialogWrapper extends AbstractDialogWrapper {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const props = propsGetter(that);
        const openRef = createRef<() => void>();
        const closeRef = createRef<() => void>();

        const [titleState,
            descriptionState,
            onAcceptState,
            onCancelState,
            acceptState,
            cancelState
        ] = stateGSs<[StringOrReactElement, StringOrReactElement, MouseEventHandler, MouseEventHandler, StringOrReactElement, StringOrReactElement]>(that, 6);

        const onCancel = (e?) => {
            preventDefault(e);
            orNoop(props().onCancel || onCancelState())();
            closeRef()();
        };

        const onAccept = (e) => {
            preventDefault(e);
            orNoop(props().onAccept || onAcceptState())();
            closeRef()();
        };

        that[render] = () => {
            const {top, className} = props();
            return (
                <Modal
                    top={top}
                    className={classNames('DialogModal', className)}
                    open={openRef}
                    close={closeRef}
                    onClose={onCancel}
                >
                    <Dialog
                        title={titleState()}
                        description={descriptionState()}
                        accept={acceptState()}
                        cancel={cancelState()}
                        {...props()}
                        onAccept={onAccept}
                        onCancel={onCancel}
                    />
                </Modal>
            );
        };

        that.open = (onAccept, onCancel, title, description, accept, cancel) => {
            titleState(UNDEFINED);
            descriptionState(UNDEFINED);
            onAcceptState(UNDEFINED);
            onCancelState(UNDEFINED);
            acceptState(UNDEFINED);
            cancelState(UNDEFINED);

            const _props = props();
            if (!isUndefined(onAccept)) {
                throwIfPropExists("onAccept", _props);
                onAcceptState(onAccept);
            }
            if (!isUndefined(onCancel)) {
                throwIfPropExists("onCancel", _props);
                onCancelState(onCancel);
            }
            if (!isUndefined(title)) {
                throwIfPropExists("title", _props);
                titleState(title);
            }
            if (!isUndefined(description)) {
                throwIfPropExists("description", _props);
                descriptionState(description);
            }
            if (!isUndefined(accept)) {
                throwIfPropExists("accept", _props);
                acceptState(accept);
            }
            if (!isUndefined(cancel)) {
                throwIfPropExists("cancel", _props);
                cancelState(cancel);
            }
            openRef()();
        };

        that[componentDidMount] = () => {
            const _props = props();
            orNoop(_props.open)(that.open);
            orNoop(_props.close)(closeRef());
            _props.show && that.open();
        }
    }
}

export default DialogWrapper;