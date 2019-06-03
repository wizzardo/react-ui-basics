import React from 'react';
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

class Draggable extends PureComponent {

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