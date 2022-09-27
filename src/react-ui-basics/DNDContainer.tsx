import React, {Component} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './DNDContainer.css'
import {
    classNames,
    NOOP,
    orNoop,
    preventDefault,
    DOCUMENT,
    WINDOW,
    addEventListener,
    removeEventListener,
    setTimeout,
    clearTimeout,
    requestAnimationFrame,
    stopPropagation,
    createRef,
    UNDEFINED
} from "./Tools";
import {propsGetter, render, componentDidMount} from "./ReactConstants";

const clearSelection = () => {
    const getSelection = WINDOW.getSelection;
    if (getSelection) {
        if (getSelection().empty) {  // Chrome
            getSelection().empty();
        } else if (getSelection().removeAllRanges) {  // Firefox
            getSelection().removeAllRanges();
        }
    } else if (DOCUMENT.selection) {  // IE?
        DOCUMENT.selection.empty();
    }
};

export interface DNDContainerProps {
    provideDraggableInitializer: (f) => void,
    provideDroppableInitializer: (f) => void,
    className?: string,
    children?
}

interface DNDContainerState {
    draggable: any
}

class DNDContainer extends Component<DNDContainerProps, DNDContainerState> {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {
            draggable: null,
        };

        const props = propsGetter(that);
        const containerRef = createRef()

        let draggable;
        let data;
        let scrollOffsetX;
        let scrollOffsetY;

        const droppables = [];
        let positionListener: (e: MouseEvent) => void;
        positionListener = NOOP

        that[render] = () => {
            const {children, className} = props();
            const {draggable} = that.state;
            return <div className={classNames('DNDContainer', className)} ref={containerRef}>
                {children}
                <div className="overlay">{draggable}</div>
            </div>;
        };


        const onDrag = (e) => {
            if (!draggable)
                return;

            positionListener(e);
            // that[droppables].forEach(it => it.isHover(e, draggable))
        };
        const onDragStart = (e) => {
            e.stopPropagation && stopPropagation(e)
            droppables.forEach(it => it.onDragStart(e, draggable))
        };
        const onDragEnd = () => {
            const d = draggable;
            if (!d) return

            if (d.element) {
                let style = d.element.style;
                style.position = '';
                style.pointerEvents = '';
                style.width = ``;
                style.height = ``;
                style.opacity = '';
            }
            d.setState({dragged: false});

            that.setState({draggable: null});

            droppables.forEach(it => {
                it.onDragEnd();
                orNoop(it.props.onDragEnd)(d)
            });
            data = null;
            draggable = null;
        };

        const draggableInitializer = (item) => {
            const handle = item.props.handle;
            const draggableElement = (handle && item.element.childNodes[0]) || item.element;
            draggableElement.draggable = true;

            const dragStartListener = (e) => {
                clearSelection();
                const container = containerRef();
                data = item.props.data;
                draggable = item;
                scrollOffsetX = e.pageX - e.clientX;
                scrollOffsetY = e.pageY - e.clientY;
                const dataTransfer = e.dataTransfer;
                const itemOffset = item.element.getBoundingClientRect();

                item.width = itemOffset.width;
                item.height = itemOffset.height;

                let clone = orNoop(item.props.copy)((it) => {
                    let style = it.element.style;

                    const offsetLeft = totalOffsetLeft(container) + (e.clientX - itemOffset.left);
                    const offsetTop = totalOffsetTop(container) + (e.clientY - itemOffset.top);
                    positionListener = (orNoop(it.createPositionListener)(e, style, itemOffset, container) || ((e) => {
                        if (e.pageX === 0)
                            return;

                        style.transform = 'translate(' + (e.pageX - offsetLeft) + 'px, ' + (e.pageY - offsetTop) + 'px)';
                    })) as (e: MouseEvent) => void;


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

                        onDrag(e);
                        it.setState({dragged: true});
                    });
                    return it;
                }, 'copy', item);

                dataTransfer && dataTransfer.setData && dataTransfer.setData('text', ''); // required by firefox
                dataTransfer && (dataTransfer.dropEffect = "move");
                if (clone) {
                    if (dataTransfer && dataTransfer.setDragImage) {
                        clone !== item && that.setState({draggable: clone});
                        const img = document.createElement('img');
                        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
                        dataTransfer.setDragImage(img, 0, 0);
                    }
                }
                onDragStart(e);
                setTimeout(() => item.setState({placeholder: true}), 1)
            };
            addListener(draggableElement, item, 'dragend', (e) => {
                if (item.state.placeholder)
                    item.setState({placeholder: false}, item.forceUpdate);
                onDragEnd()
            });
            addListener(draggableElement, item, 'dragstart', dragStartListener);

            let longTouch;
            let dragStarted = false;
            let dragged = false;
            addListener(draggableElement, item, 'touchstart', e => {
                if (e.touches.length > 1)
                    return;

                stopPropagation(e)
                preventDefault(e)
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
                positionListener(touch);
                droppables.forEach(it => it.isHover(touch, item))
            });

            addListener(draggableElement, item, 'touchend', e => {
                longTouch = clearTimeout(longTouch);
                if (!dragged)
                    return;

                item.setState({placeholder: false}, item.forceUpdate);
                if (e.touches.length > 0)
                    return;

                droppables.forEach(it => it.dropIfHover());
                onDragEnd();
            });
        }

        const droppableInitializer = (item) => {
            droppables.push(item);

            addEventListener(item.element, 'drop', (e) => {
                if (item.state.allow) {
                    preventDefault(e);
                    stopPropagation(e)
                    data && orNoop(item.props.onDrop)(data);
                }
            }, false);
            addEventListener(item.element, 'dragenter', (e) => {
                if (item.state.allow) {
                    preventDefault(e);
                    item.isHover(e, draggable, true)
                }
            });
            addEventListener(item.element, 'dragleave', (e) => {
                if (item.state.allow) {
                    preventDefault(e);
                    item.isHover(e, draggable, false)
                }
            });

            item.onDragStart = (e, draggable) => {
                item.bounds = item.element.getBoundingClientRect();
                let allow = (orNoop(item.props.onDragStart)(e, data));
                if (allow === UNDEFINED)
                    allow = true
                item.setState({allow});
            };
            item.isHover = (e, draggable, hover) => {
                const bounds = item.bounds;
                if (!bounds)
                    return;

                if (hover === UNDEFINED) {
                    let y = e.pageY - scrollOffsetY;
                    let x = e.pageX - scrollOffsetX;
                    hover = bounds.left <= x && bounds.right >= x && bounds.top <= y && bounds.bottom >= y;
                }

                hover && orNoop(item.props.onHover)(e, draggable);

                if (hover)
                    !item.state.hover && item.setState({hover}, item.forceUpdate);
                else
                    item.state.hover && item.setState({hover}, item.forceUpdate);
            };
            item.dropIfHover = () => {
                data && item.state.hover && orNoop(item.props.onDrop)(data);
            };
            item.onDragEnd = () => {
                orNoop(orNoop(draggable)['onDragEnd'])();
                item.setState({allow: false, hover: false});
            };
            item.onUnmount = () => droppables.splice(droppables.indexOf(item), 1);
        }

        that[componentDidMount] = () => {
            const {
                provideDraggableInitializer,
                provideDroppableInitializer,
            } = props();

            orNoop(provideDraggableInitializer)(draggableInitializer);
            orNoop(provideDroppableInitializer)(droppableInitializer);
            addEventListener(containerRef(), 'dragover', onDrag, {capture: true, passive: true})
        }
    }
}

export const removeListener = (el, item, type) => item[type] && removeEventListener(el, type, item[type]);
export const addListener = (el, item, type, listener) => {
    removeListener(el, item, type);
    addEventListener(el, type, item[type] = listener);
};

const totalOffsetTop = (el) => {
    return el.getBoundingClientRect().top + (WINDOW.pageYOffset || DOCUMENT.documentElement.scrollTop);
};
const totalOffsetLeft = (el) => {
    return el.getBoundingClientRect().left + (WINDOW.pageXOffset || DOCUMENT.documentElement.scrollLeft);
};

export default DNDContainer;