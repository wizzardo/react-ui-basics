import React, {Component} from 'react';
import './Dialog.css'
import Button from "./Button";
import Modal from "./Modal";
import {orNoop} from "./Tools";


class DialogWrapper extends Component {
    state = {};

    clearState = () => this.setState({
        title: undefined,
        description: undefined,
        onAccept: undefined,
        onCancel: undefined,
        accept: undefined,
        cancel: undefined,
    });

    render = () => {
        const {top, ...other} = this.props;
        const {title, description, accept, cancel} = this.state;
        return (
            <Modal
                top={top}
                className="DialogModal"
                open={open => this.openModal = open}
                close={close => this.closeModal = close}
                onClose={this.onCancel}
            >
                <Dialog title={title} description={description} accept={accept} cancel={cancel} {...other} onAccept={this.onAccept} onCancel={this.onCancel}/>
            </Modal>
        );
    };

    onCancel = (e) => {
        e && e.preventDefault();
        orNoop(this.props.onCancel || this.state.onCancel)();
        this.closeModal();
    };

    onAccept = (e) => {
        e && e.preventDefault();
        orNoop(this.props.onAccept || this.state.onAccept)();
        this.closeModal();
    };

    open = (onAccept, onCancel, title, description, accept, cancel) => {
        this.clearState();
        if (onAccept !== undefined) if (this.props.onAccept) throw Error("onAccept was already set by props"); else this.setState({onAccept});
        if (onCancel !== undefined) if (this.props.onCancel) throw Error("onCancel was already set by props"); else this.setState({onCancel});
        if (title !== undefined) if (this.props.title) throw Error("title was already set by props"); else this.setState({title});
        if (description !== undefined) if (this.props.description) throw Error("description was already set by props"); else this.setState({description});
        if (accept !== undefined) if (this.props.accept) throw Error("accept was already set by props"); else this.setState({accept});
        if (cancel !== undefined) if (this.props.cancel) throw Error("cancel was already set by props"); else this.setState({cancel});
        this.openModal();
    };

    componentDidMount = () => {
        orNoop(this.props.open)(this.open);
        orNoop(this.props.close)(this.closeModal);
        this.props.show && this.open();
    }
}

class Dialog extends Component {
    render() {
        const {title = '', description = '', accept = 'Accept', cancel = 'Decline', onAccept, onCancel, children} = this.props;
        return (
            <div className="Dialog">
                {title && <div className="title">{title}</div>}
                {description && <div className="description">{description}</div>}
                {children}
                <div className="row right">
                    {cancel && <Button flat={true} onClick={onCancel}>{cancel}</Button>}
                    {accept && <Button flat={true} onClick={onAccept}>{accept}</Button>}
                </div>
            </div>
        );
    }
}

export default DialogWrapper;