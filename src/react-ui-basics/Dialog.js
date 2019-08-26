import React, {Component} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Dialog.css'
import Button from "./Button";
import Modal from "./Modal";
import {isUndefined, orNoop, preventDefault, ref, UNDEFINED, classNames, createRef} from "./Tools";
import {PureComponent, render, componentDidMount, propsGetter, stateGS} from "./ReactConstants";

class Dialog extends PureComponent {
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

Dialog.defaultProps = {
    accept: 'Accept',
    cancel: 'Decline',
};

const throwIfPropExists = (key, props) => {
    if (props[key]) throw Error(key + " was already set by props")
};

class DialogWrapper extends Component {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const props = propsGetter(that);
        const openRef = createRef();
        const closeRef = createRef();

        const [
            getTitle, setTitle,
            getDescription, setDescription,
            getOnAccept, setOnAccept,
            getOnCancel, setOnCancel,
            getAccept, setAccept,
            getCancel, setCancel,
        ] = stateGS(that, 6);

        const onCancel = (e) => {
            preventDefault(e);
            orNoop(props().onCancel || getOnCancel())();
            closeRef()();
        };

        const onAccept = (e) => {
            preventDefault(e);
            orNoop(props().onAccept || getOnAccept())();
            closeRef()();
        };

        that[render] = () => {
            const {top, className, ...other} = props();
            return (
                <Modal
                    top={top}
                    className={classNames('DialogModal', className)}
                    open={openRef}
                    close={closeRef}
                    onClose={onCancel}
                >
                    <Dialog title={getTitle()} description={getDescription()} accept={getAccept()} cancel={getCancel()} {...other} onAccept={onAccept} onCancel={onCancel}/>
                </Modal>
            );
        };

        that.open = (onAccept, onCancel, title, description, accept, cancel) => {
            setTitle(UNDEFINED);
            setDescription(UNDEFINED);
            setOnAccept(UNDEFINED);
            setOnCancel(UNDEFINED);
            setAccept(UNDEFINED);
            setCancel(UNDEFINED);

            const _props = props();
            if (!isUndefined(onAccept)) {
                throwIfPropExists("onAccept", _props);
                setOnAccept(onAccept);
            }
            if (!isUndefined(onCancel)) {
                throwIfPropExists("onCancel", _props);
                setOnCancel(onCancel);
            }
            if (!isUndefined(title)) {
                throwIfPropExists("title", _props);
                setTitle(title);
            }
            if (!isUndefined(description)) {
                throwIfPropExists("description", _props);
                setDescription(description);
            }
            if (!isUndefined(accept)) {
                throwIfPropExists("accept", _props);
                setAccept(accept);
            }
            if (!isUndefined(cancel)) {
                throwIfPropExists("cancel", _props);
                setCancel(cancel);
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