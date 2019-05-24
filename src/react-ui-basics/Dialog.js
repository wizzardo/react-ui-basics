import React, {Component} from 'react';
import './Dialog.css'
import Button from "./Button";
import Modal from "./Modal";
import {isUndefined, orNoop, preventDefault, ref, UNDEFINED} from "./Tools";

const Dialog = ({title, description, accept, cancel, onAccept, onCancel, children}) => (
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

Dialog.defaultProps = {
    accept: 'Accept',
    cancel: 'Decline',
};

class DialogWrapper extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    clearState = () => this.setState({
        title: UNDEFINED,
        description: UNDEFINED,
        onAccept: UNDEFINED,
        onCancel: UNDEFINED,
        accept: UNDEFINED,
        cancel: UNDEFINED,
    });

    render = () => {
        const {top, ...other} = this.props;
        const {title, description, accept, cancel} = this.state;
        return (
            <Modal
                top={top}
                className="DialogModal"
                open={ref('openModal', this)}
                close={ref('closeModal', this)}
                onClose={this.onCancel}
            >
                <Dialog title={title} description={description} accept={accept} cancel={cancel} {...other} onAccept={this.onAccept} onCancel={this.onCancel}/>
            </Modal>
        );
    };

    onCancel = (e) => {
        preventDefault(e);
        orNoop(this.props.onCancel || this.state.onCancel)();
        this.closeModal();
    };

    onAccept = (e) => {
        preventDefault(e);
        orNoop(this.props.onAccept || this.state.onAccept)();
        this.closeModal();
    };

    open = (onAccept, onCancel, title, description, accept, cancel) => {
        this.clearState();
        if (!isUndefined(onAccept)) if (this.props.onAccept) throw Error("onAccept was already set by props"); else this.setState({onAccept});
        if (!isUndefined(onCancel)) if (this.props.onCancel) throw Error("onCancel was already set by props"); else this.setState({onCancel});
        if (!isUndefined(title)) if (this.props.title) throw Error("title was already set by props"); else this.setState({title});
        if (!isUndefined(description)) if (this.props.description) throw Error("description was already set by props"); else this.setState({description});
        if (!isUndefined(accept)) if (this.props.accept) throw Error("accept was already set by props"); else this.setState({accept});
        if (!isUndefined(cancel)) if (this.props.cancel) throw Error("cancel was already set by props"); else this.setState({cancel});
        this.openModal();
    };

    componentDidMount = () => {
        orNoop(this.props.open)(this.open);
        orNoop(this.props.close)(this.closeModal);
        this.props.show && this.open();
    }
}

export default DialogWrapper;