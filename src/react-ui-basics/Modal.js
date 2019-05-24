import React from 'react';
import './Modal.css'
import Button from "./Button";
import Animated from "./Animated";
import {classNames, orNoop, ref} from "./Tools";

class Modal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render = () => {
        const {className, top} = this.props;
        const {show, menu} = this.state;
        return (
            <div className={classNames(`Modal`, className, show && 'show')} ref={ref('el', this)}>
                <div ref={ref('overlay', this)} className={classNames(`overlay`, show && 'show')} onClick={this.beforeClose}>
                </div>
                <div ref={ref('content', this)}
                     className={classNames(`content`, show && 'show', top && 'top')}
                     style={top && {top: `${top}px`}}
                >
                    {React.Children.map(this.props.children, child => React.cloneElement(child, {modalMenuConsumer: this.modalMenuConsumer}))}
                    {menu}
                    <Button className="close" flat={true} round={true} onClick={this.beforeClose}>
                        <i className="material-icons" ref={ref('closeButton', this)}>close</i>
                    </Button>
                </div>
            </div>
        );
    };

    modalMenuConsumer = (menu) => this.setState({menu});

    componentDidMount = () => {
        orNoop(this.props.open)(() => setTimeout(this.open, 0));
        orNoop(this.props.close)(() => setTimeout(this.close, 0));
        this.props.show && setTimeout(this.open, 0)
    };

    beforeClose = (e) => {
        if (this.props.beforeClose)
            this.props.beforeClose(this.close) && this.close(e);
        else
            this.close(e);
    };

    close = (e) => {
        if (e && e.target && !(e.target === this.overlay || e.target === this.closeButton || e.target.classList.contains('close')))
            return true;

        if (!this.state.show)
            return;

        this.addTransitionListener();
        this.setState({show: false});

        Modal.pollListener(this);
    };

    open = () => {
        if (this.state.show)
            return;

        this.addTransitionListener();
        this.setState({show: true});

        let listener = event => {
            if (!event.defaultPrevented && event.keyCode === 27/*escape*/)
                this.beforeClose();
            return true;
        };

        Modal.addListener(this, listener)
    };

    addTransitionListener = () => {
        let listener = () => {
            this.overlay && this.overlay.removeEventListener("transitionend", listener);
            this.state.show ? this.onOpen() : this.onClose();
            this.el.style.paddingBottom = this.state.show ? '1px' : '0px'; // force invalidate scroll
        };
        this.overlay && this.overlay.addEventListener("transitionend", listener);
    };

    onOpen = () => {
        orNoop(this.props.onOpen)();
    };
    onClose = () => {
        orNoop(this.props.onClose)();
    };
}

Modal.pollListener = (modal) => {
    document.removeEventListener('keydown', Modal.listenerRef);
    const listener = modal.previousListener;
    listener && document.addEventListener('keydown', listener);
    Modal.listenerRef = listener;
};

Modal.addListener = (modal, listener) => {
    const prev = Modal.listenerRef;
    prev && document.removeEventListener('keydown', prev);
    modal.previousListener = prev;
    document.addEventListener('keydown', Modal.listenerRef = listener);
};

export default Modal;


export class ModalMenu extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {open: false};
    }

    render = () => {
        const {items} = this.props;
        const filtered = (items || []).filter(it => !!it);
        if (filtered.length === 0) return null;

        const {open} = this.state;

        return <div className={classNames("ModalMenu", 'row', open && 'open')}>
            {filtered.map((it, i) => <Animated value={open}
                                               key={i}
                                               mounting={200}
                                               unmounting={200}
                                               mountingDelay={i * 50}
                                               unmountingDelay={(filtered.length - i - 1) * 50}
                                               styles={{
                                                   mounting: {right: `${(filtered.length - i) * 36 + 5 + (filtered.length - i) * 5}px`},
                                               }}
            >
                <Button flat={true} round={true} onClick={it.action}>
                    <i className="material-icons">{it.icon}</i>
                </Button>
            </Animated>)}

            <Button className={classNames("more", open && 'active')} flat={true} round={true} onClick={this.toggle}>
                <i className="material-icons">more_vert</i>
            </Button>

            <div className="separator"/>
        </div>
    };

    toggle = () => {
        this.setState({open: !this.state.open})
    };
}