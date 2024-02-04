import React, {MouseEventHandler} from 'react';
import ReactCreateElement from './ReactCreateElement';
import {classNames, orNoop, ref} from "./Tools";
import {componentDidUpdate, props, state, render, children, className, componentDidMount, componentWillUnmount, PureComponent} from "./ReactConstants";

const hover = 'hover',
    dragged = 'dragged',
    placeholder = 'placeholder',
    initializer = 'initializer',
    handle = 'handle'
;

const init = that => orNoop(props(that)[initializer])(that);

interface DraggableProps {
    id: string | number
    data: any
    copy?: (initializer: (it: Draggable) => Draggable, classname: string, item: Draggable) => Draggable
    onClick?: MouseEventHandler<HTMLDivElement>
    children?: React.ReactNode
    className?: string,
    handle?: React.ReactNode
    initializer?: (draggable: Draggable) => void
}

interface DraggableState {
    dragged?: boolean,
    placeholder?: boolean,
    hover?: boolean,
}

abstract class AbstractDraggable extends PureComponent<DraggableProps, DraggableState> {
    onUnmount?: () => void
    element: HTMLDivElement
    width: number;
    height: number;
    createPositionListener: (e, style, itemOffset, container) => any;
    initDraggedStyles: (style, itemOffset) => void;
}

class Draggable extends AbstractDraggable {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};
        that[componentDidUpdate] = (prevProps) => {
            if (prevProps[handle] !== props(that)[handle] || prevProps[initializer] !== props(that)[initializer])
                init(that)
        };
        that[componentDidMount] = () => {
            init(that)
        };
        that[componentWillUnmount] = () => {
            orNoop(that.onUnmount)();
        };
        that[render] = () => {
            const _state = state(that),
                _props = props(that);
            return <div className={classNames('Draggable', _props[className],
                _state[dragged] && dragged,
                _state[placeholder] && placeholder,
                _state[hover] && hover,
            )}
                        onClick={_props.onClick}
                        ref={ref('element', that)}
            >
                {_props[handle]}
                {_props[children]}
            </div>;
        }
    }
}


export default Draggable;