import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import {classNames, orNoop, ref, preventDefault, stopPropagation} from "./Tools";
import {componentDidMount, componentDidUpdate, render, props, state, componentWillUnmount, children, className, PureComponent} from "./ReactConstants";
import Draggable from "./DNDDraggable";

const hover = 'hover',
    allow = 'allow',
    initializer = 'initializer'
;

const init = that => orNoop(props(that)[initializer])(that);

interface DroppableProps {
    children?: React.ReactNode
    className?: string,
    initializer?: (draggable: Droppable) => void
    onDrop?: (data: any) => void
    onHover?: (e, draggable: Draggable) => void
    onDragStart?: (e, data: any) => boolean
}

interface DroppableState {
    allow?: boolean,
    hover?: boolean,
}

abstract class AbstractDroppable extends PureComponent<DroppableProps, DroppableState> {
    onUnmount?: () => void
    element: HTMLDivElement
    onDragStart: (e, draggable: Draggable) => void
    bounds: DOMRect
    isHover: (e, draggable: Draggable, hover?: boolean) => void;
    onDragEnd: () => void;
    dropIfHover: () => void;
}

class Droppable extends AbstractDroppable {


    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {}

        that[componentDidUpdate] = (prevProps) => {
            if (prevProps[initializer] !== props(that)[initializer])
                init(that)
        };

        that[componentDidMount] = () => {
            init(that)
        };

        that[componentWillUnmount] = () => {
            orNoop(that.onUnmount)();
        };

        that[render] = () => {
            const _props = props(that),
                _state = state(that);
            return <div className={
                classNames(
                    'Droppable',
                    _props[className],
                    _state[hover] && hover,
                    _state[allow] && allow,
                )}
                        onDragOver={e => {
                            if (_state[allow]) {
                                preventDefault(e);
                                stopPropagation(e);
                            }
                        }}
                        ref={ref('element', that)}>
                {_props[children]}
            </div>;
        };
    }
}

export default Droppable;