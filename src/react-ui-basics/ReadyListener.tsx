import React, {ReactNode} from 'react';
import ReactCreateElement from './ReactCreateElement';
import {componentDidMount, render, componentWillUnmount, setState, props, state, componentDidUpdate, children, PureComponent} from "./ReactConstants";
import {orNoop} from "./Tools";

export interface NotReadyIndicatorProps {
    onChange?: (ready: boolean) => void
    render?: (ready: boolean, notReadyElements: string[]) => JSX.Element | ReactNode
    children?: ReactNode
}

export interface NotReadyProps {
    name?: string
}

interface NotReadyIndicatorState {
    r: boolean
}

export const createReadyListener = () => {
    let indicator,
        count = 0,
        notReadyElements: string[] = [];

    class NotReadyIndicator extends PureComponent<NotReadyIndicatorProps, NotReadyIndicatorState> {
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
                    return renderer(ready, notReadyElements);
                else
                    return (!ready && _props[children]) || null;
            };
            that[componentDidMount] = that[componentDidUpdate] = () => {
                // console.log('NotReadyIndicator.update.mounted', state(that).r, count)
                orNoop(props(that).onChange)(state(that).r && count === 0);
            }
        }
    }

    class NotReady extends PureComponent<NotReadyProps> {
        constructor(props: NotReadyProps) {
            super(props);
            const that = this;
            count++;
            // console.log('NotReady created')
            that[componentDidMount] = () => {
                notReadyElements.push(that.props.name || 'unknown')
                setState(indicator, {r: false});
            };
            that[componentWillUnmount] = () => {
                let index = notReadyElements.indexOf(that.props.name || 'unknown')
                notReadyElements.splice(index, 1)
                setState(indicator, {r: --count === 0});
            };
            that[render] = () => null;
        }
    }

    return [NotReadyIndicator, NotReady]
};
