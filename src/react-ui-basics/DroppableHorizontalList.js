import React, {Component} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './DroppableList.css'
import DNDDroppable from "./DNDDroppable";
import {classNames, orNoop, setTimeout, NOOP} from "./Tools";
import DNDDraggable from "./DNDDraggable";
import {addListener} from "./DNDContainer";
import {stateGS, setState, propsGetter, props as getProps, render, componentDidUpdate, componentDidMount, children} from "./ReactConstants";

class DroppableHorizontalList extends Component {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const props = propsGetter(that);
        const resetting = stateGS(that);
        const draggables = {};
        let list;

        const init = () => {
            list = [];
            React.Children.forEach(props()[children], child => {
                child && child.type === DNDDraggable && list.push(getProps(child).id);
            })
        };

        init();

        that[componentDidUpdate] = (prevProps) => {
            if (prevProps[children] !== props()[children]) {
                init();
            }
        };

        let dropped;
        let dragging;
        let oldIndex;
        let newIndex;

        const onHover = (e, draggable) => {
            const offset = e.pageX - that.scrollOffsetX;
            const transformLeft = 'translateX(' + draggable.width + 'px)';
            const transformRight = 'translateX(-' + draggable.width + 'px)';
            list.forEach((id, i) => {
                if (i !== oldIndex) {
                    const d = draggables[id];
                    const bounds = d.bounds;
                    const style = d.element.style;
                    if (i > oldIndex) {
                        if (offset >= bounds.left)
                            style.transform = transformRight;
                        else
                            style.transform = '';
                    } else {
                        if (offset <= bounds.right)
                            style.transform = transformLeft;
                        else
                            style.transform = '';
                    }
                }
            });

            let i = list.findIndex(id => {
                let bounds = draggables[id].bounds;
                return offset >= bounds.left && offset <= bounds.right
            });

            newIndex = i !== -1 ? i : list.length;
        };

        that[componentDidMount] = () => {
            let inTransition = false;
            orNoop(props().provideDraggableEnhancer)(initializer => it => {
                orNoop(initializer)(it);
                it.createPositionListener = (e, style) => {
                    const offset = e.pageX;
                    return e => {
                        onHover(e, it)
                        e.pageX && (style.transform = 'translateX(' + (e.pageX - offset) + 'px)');
                    };
                };
                it.initDraggedStyles = NOOP;
                it.onDragEnd = () => {
                    const style = it.element.style;
                    inTransition = true;
                    setTimeout(() => {
                        const droppingDuration = props().droppingDuration || 100;
                        style.transition = 'transform ' + droppingDuration + 'ms linear';
                        style.transform = '';
                        style.zIndex = '10';
                        setTimeout(() => {
                            style.transition = '';
                            style.zIndex = '';
                            setTimeout(() => {
                                inTransition = false;
                            }, 50) // ignore mouseenter on the old position
                        }, droppingDuration)
                    }, 1);
                };
                addListener(it.element, it, 'mouseenter', (e) => {
                    !(dragging || inTransition) && setState(it, {hover: true});
                });
                addListener(it.element, it, 'mouseleave', (e) => {
                    !dragging && setState(it, {hover: false});
                });
                it.onUnmount = () => {
                    delete draggables[getProps(it).id];
                };
                draggables[getProps(it).id] = it;
            })
        };

        const onDragStart = (e, draggable) => {
            dragging = true;
            dropped = false;
            oldIndex = list.indexOf(draggable.id);
            that.scrollOffsetX = e.pageX - e.clientX;

            list.forEach((id) => {
                draggables[id].bounds = draggables[id].element.getBoundingClientRect();
            });
        };

        const reset = (ignoredIndex, transition) => {
            list.forEach((id, i) => {
                if (i !== ignoredIndex) {
                    const s = draggables[id].element.style;
                    s.transform = '';
                    s.transition = transition;
                }
            });
        };

        const onDragEnd = (draggable) => {
            const index = list.indexOf(getProps(draggable).id);

            if (dropped) {
                reset(index, '');
            } else {
                resetting(true, () => {
                    reset(index, '');
                });
                setTimeout(() => {
                    resetting(false);
                }, props().droppingDuration || 100);
            }
            dragging = false;
        };
        const onDrop = (data) => {
            dropped = true;
            const draggable = draggables[list[oldIndex]];
            const style = draggable.element.style;

            const diff = (newIndex - oldIndex) * draggable.bounds.width;
            const transform = style.transform;
            const position = transform.substring(11, transform.length - 3);
            style.transform = 'translateX(' + (position - diff) + 'px)'; // set translateX against new position on the list to prevent long slide
            orNoop(props().onDrop)(data, oldIndex, newIndex);

            reset(newIndex, 'unset');
        };

        that[render] = () => {
            const _props = props();
            const {className, initializer} = _props;
            return <DNDDroppable className={classNames(
                'DroppableList',
                className,
                resetting() && 'resetting',
            )}
                                 initializer={initializer}
                                 onHover={onHover}
                                 onDragStart={onDragStart}
                                 onDragEnd={onDragEnd}
                                 onDrop={onDrop}
            >
                {_props[children]}
            </DNDDroppable>;
        };
    }
}


export default DroppableHorizontalList;