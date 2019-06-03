import React from 'react';
import {classNames, orNoop, ref, preventDefault, stopPropagation} from "./Tools";
import {componentDidMount, componentDidUpdate, render, props, state, componentWillUnmount, children, className, PureComponent} from "./ReactConstants";

const hover = 'hover',
    allow = 'allow',
    initializer = 'initializer'
;

const init = that => orNoop(props(that)[initializer])(that);

class Droppable extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;

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
                            preventDefault(e);
                            stopPropagation(e);
                        }}
                        ref={ref('element', that)}>
                {_props[children]}
            </div>;
        };
    }
}

export default Droppable;