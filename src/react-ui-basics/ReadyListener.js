import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import {componentDidMount, render, componentWillUnmount, setState, props, state, componentDidUpdate, children, PureComponent} from "./ReactConstants";
import {orNoop} from "./Tools";

export const createReadyListener = () => {
    let indicator,
        count = 0;

    class NotReadyIndicator extends PureComponent {
        constructor(properties) {
            super(properties);
            const that = this;
            that.state = {r: true};
            indicator = that;
            that[render] = () => {
                const _props = props(that),
                    renderer = _props[render],
                    ready = state(that).r;

                if (renderer)
                    return renderer(ready);
                else
                    return (!ready && _props[children]) || null;
            };
            that[componentDidMount] = that[componentDidUpdate] = () => {
                orNoop(props(that).onChange)(state(that).r);
            }
        }
    }

    class NotReady extends PureComponent {
        constructor(props) {
            super(props);
            const that = this;
            that[componentDidMount] = () => {
                count++;
                setState(indicator, {r: false});
            };
            that[componentWillUnmount] = () => {
                setState(indicator, {r: --count === 0});
            };
            that[render] = () => null;
        }
    }

    return [NotReadyIndicator, NotReady]
};
