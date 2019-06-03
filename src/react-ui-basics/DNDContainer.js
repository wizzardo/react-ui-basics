import React, {Component} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './DNDContainer.css'
import {classNames, NOOP, orNoop, preventDefault, ref} from "./Tools";

const clearSelection = () => {
    const getSelection = window.getSelection;
    if (getSelection) {
        if (getSelection().empty) {  // Chrome
            getSelection().empty();
        } else if (getSelection().removeAllRanges) {  // Firefox
            getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
};

const droppables = 'ds';
const positionListener = 'pl';

class DNDContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            draggable: null,
        };

        this[droppables] = [];
        this[positionListener] = NOOP;
    }

    render() {
        const {children, className} = this.props;
        const {draggable} = this.state;
        return <div className={classNames('DNDContainer', className)} ref={ref('container', this)}>
            {children}
            <div className="overlay">{draggable}</div>
        </div>;
    };

    componentDidMount() {
        const {
            provideDraggableInitializer,
            provideDroppableInitializer,
        } = this.props;

        orNoop(provideDraggableInitializer)(this.draggableInitializer);
        orNoop(provideDroppableInitializer)(this.droppableInitializer);
        this.container.addEventListener('dragover', this.onDrag)
    };

    draggableInitializer = (item) => {
        const handle = item.props.handle;
        const draggableElement = (handle && item.element.childNodes[0]) || item.element;
        draggableElement.draggable = true;

        const dragStartListener = (e) => {
            clearSelection();
            const container = this.container;
            this.data = item.props.data;
            this.draggable = item;
            this.scrollOffsetX = e.pageX - e.clientX;
            this.scrollOffsetY = e.pageY - e.clientY;
            const dataTransfer = e.dataTransfer;
            const itemOffset = item.element.getBoundingClientRect();

            item.width = itemOffset.width;
            item.height = itemOffset.height;

            let clone = orNoop(item.props.copy)((it) => {
                let style = it.element.style;

                const offsetLeft = totalOffsetLeft(container) + (e.clientX - itemOffset.left);
                const offsetTop = totalOffsetTop(container) + (e.clientY - itemOffset.top);
                this[positionListener] = orNoop(it.createPositionListener)(e, style, itemOffset, container) || ((e) => {
                    if (e.pageX === 0)
                        return;

                    style.transform = 'translate(' + (e.pageX - offsetLeft) + 'px, ' + (e.pageY - offsetTop) + 'px)';
                });


                requestAnimationFrame(() => {
                    if (dataTransfer && !dataTransfer.setDragImage) {
                        style.opacity = '0'; // hide dragged element in ie and edge
                    }
                    if (it.initDraggedStyles)
                        it.initDraggedStyles(style, itemOffset);
                    else {
                        style.position = 'absolute';
                        style.pointerEvents = 'none';
                        style.opacity = '1';
                        style.top = '0px';
                        style.left = '0px';
                        style.width = itemOffset.width + 'px';
                        style.height = itemOffset.height + 'px';
                    }

                    this.onDrag(e);
                    it.setState({dragged: true});
                });
                return it;
            }, 'copy', item);

            dataTransfer && dataTransfer.setData && dataTransfer.setData('text', ''); // required by firefox
            dataTransfer && (dataTransfer.dropEffect = "move");
            if (clone) {
                if (dataTransfer && dataTransfer.setDragImage) {
                    clone !== item && this.setState({draggable: clone});
                    const img = document.createElement('img');
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
                    dataTransfer.setDragImage(img, 0, 0);
                }
            }
            this.onDragStart(e);
            setTimeout(() => item.setState({placeholder: true}), 1)
        };
        addListener(draggableElement, item, 'dragend', (e) => {
            item.setState({placeholder: false});
            this.onDragEnd()
        });
        addListener(draggableElement, item, 'dragstart', dragStartListener);

        let longTouch;
        let dragStarted = false;
        let dragged = false;
        addListener(draggableElement, item, 'touchstart', e => {
            if (e.touches.length > 1)
                return;

            dragged = dragStarted = false;
            const touch = e.targetTouches[0];
            longTouch = setTimeout(() => longTouch && (dragStarted = true) && (longTouch = dragStartListener(touch)), !handle ? 500 : 0)
        });

        addListener(draggableElement, item, 'touchmove', e => {
            if (longTouch) {
                longTouch = clearTimeout(longTouch);
                return;
            }
            if (!dragStarted)
                return;

            if (e.touches.length > 1)
                return;

            preventDefault(e);
            dragged = true;
            const touch = e.targetTouches[0];
            this[positionListener](touch);
            this[droppables].forEach(it => it.isHover(touch, item))
        });

        addListener(draggableElement, item, 'touchend', e => {
            longTouch = clearTimeout(longTouch);
            if (!dragged)
                return;

            item.setState({placeholder: false});
            if (e.touches.length > 0)
                return;

            this[droppables].forEach(it => it.dropIfHover());
            this.onDragEnd();
        });
    };


    droppableInitializer = (item) => {
        this[droppables].push(item);

        item.element.addEventListener('drop', (e) => {
            preventDefault(e);
            this.data && orNoop(item.props.onDrop)(this.data);
        }, false);

        item.onDragStart = (e, draggable) => {
            item.bounds = item.element.getBoundingClientRect();
            item.setState({allow: true});
            orNoop(item.props.onDragStart)(e, draggable);
        };
        item.isHover = (e, draggable) => {
            const bounds = item.bounds;
            if (!bounds)
                return;

            let y = e.pageY - this.scrollOffsetY;
            let x = e.pageX - this.scrollOffsetX;
            let hover = bounds.left <= x && bounds.right >= x && bounds.top <= y && bounds.bottom >= y;

            hover && orNoop(item.props.onHover)(e, draggable);

            if (hover)
                !item.state.hover && item.setState({hover});
            else
                item.state.hover && item.setState({hover});
        };
        item.dropIfHover = () => {
            this.data && item.state.hover && orNoop(item.props.onDrop)(this.data);
        };
        item.onDragEnd = () => {
            orNoop(orNoop(this.draggable).onDragEnd)();
            item.setState({allow: false, hover: false});
        };
        item.onUnmount = () => this[droppables].splice(this[droppables].indexOf(item), 1);
    };

    onDrag = (e) => {
        if (!this.draggable)
            return;

        this[positionListener](e);
        this[droppables].forEach(it => it.isHover(e, this.draggable))
    };
    onDragStart = (e) => {
        this[droppables].forEach(it => it.onDragStart(e, this.draggable))
    };
    onDragEnd = () => {
        const draggable = this.draggable;
        if (draggable.element) {
            let style = draggable.element.style;
            style.position = '';
            style.pointerEvents = '';
            style.width = ``;
            style.height = ``;
            style.opacity = '';
        }
        draggable.setState({dragged: false});

        this.setState({draggable: null});

        this[droppables].forEach(it => {
            it.onDragEnd();
            orNoop(it.props.onDragEnd)(this.draggable)
        });
        this.data = null;
        this.draggable = null;
    };
}

export const removeListener = (el, item, type) => item[type] && el.removeEventListener(type, item[type]);
export const addListener = (el, item, type, listener) => {
    removeListener(el, item, type);
    el.addEventListener(type, item[type] = listener);
};

const totalOffsetTop = (el) => {
    return el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
};
const totalOffsetLeft = (el) => {
    return el.getBoundingClientRect().left + (window.pageXOffset || document.documentElement.scrollLeft);
};

export default DNDContainer;