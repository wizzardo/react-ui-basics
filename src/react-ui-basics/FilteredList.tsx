import React, {CSSProperties, MouseEventHandler} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './FilteredList.css'
import Scrollable from "./Scrollable";
import {classNames, orNoop, ref, stopPropagation, isFunction, isObject} from "./Tools";
import {PureComponent} from "./ReactConstants";

type Labels<T> = ((item: T) => string) | { [key: string]: string } | { [key: number]: string };

// @ts-ignore
export const getLabel: (<T extends string | number>(labels: Labels<T>, id: T) => string) = (labels, id) => isFunction(labels) ? labels(id) : labels[id]

export interface FilteredListProps<T> {
    nextProvider?: (cb: () => void) => void
    prevProvider?: (cb: () => void) => void
    resetProvider?: (cb: () => void) => void
    selectedProvider?: (cb: () => void) => void
    data: T[]
    labels?: Labels<T>
    filter?: (item: T) => boolean
    className?: string
    selected?: T | { [key: string]: boolean } | { [key: number]: boolean }
    inline?: boolean
    childComponent
    childProps
    style?: CSSProperties
    scroll
    onSelect: (selected: T) => void
    selectSingle?: boolean
}

export interface FilteredListState<T> {
    selected: T
}

class FilteredList<T extends string|number> extends PureComponent<FilteredListProps<T>, FilteredListState<T>> {

    static defaultProps = {
        data: [],
        labels: {},
        selected: {},
        inline: false,
        selectSingle: true,
        filter: () => true,
    };

    hidden:Map<T, boolean> = new Map();
    elements :Map<T, HTMLDivElement> = new Map();
    list:T[] = [];
    el: Scrollable

    constructor(props) {
        super(props);
        this.state = {selected: null};
    }

    componentDidMount() {
        orNoop(this.props.nextProvider)(this.next);
        orNoop(this.props.prevProvider)(this.prev);
        orNoop(this.props.selectedProvider)(this.selected);
        orNoop(this.props.resetProvider)(this.reset);

        this.updateList(this.props)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.data === prevProps.data)
            return;

        this.updateList(this.props)
    }

    updateList = (props) => {
        const {data} = props;
        const {selected} = this.state;
        this.list = data || [];

        if (!this.list.includes(selected))
            this.setState({selected: null})
    };

    render() {
        const {data, labels, filter, className, selected, inline, childComponent, childProps, style, scroll} = this.props;
        return (
            <Scrollable className={classNames('FilteredList', className, inline ? 'inline' : 'popup')}
                        autoScrollTop={false}
                        ref={ref('el', this)} style={style} scrollBarMode={scroll}>
                {(data || []).filter(id => !!id || id === 0).map(id => <ItemWrapper
                    id={id}
                    key={id}
                    label={getLabel(labels, id)}
                    childComponent={childComponent}
                    childProps={childProps}
                    element={el => this.elements.set(id, el)}
                    onClick={e => {
                        stopPropagation(e);
                        this.onSelect(id);
                    }}
                    onMouseEnter={e => this.setState({selected: id})}
                    onMouseLeave={e => id === this.state.selected && this.setState({selected: null})}
                    className={classNames('child', this.state.selected === id && 'active', selected === id || (isObject(selected) && selected[id as (string | number)]) && 'selected')}
                    classProvider={it => {
                        const hidden = !filter(it);
                        this.hidden.set(id, hidden)
                        return hidden && 'hidden';
                    }}
                />)}
            </Scrollable>
        )
    }

    onSelect = (id) => {
        this.setState({selected: id});
        this.props.onSelect(id);
    };

    selected = (): T => {
        const {selected: value} = this.state;
        const {selectSingle} = this.props;


        if (value === -1 || this.hidden.get(value)) {
            let filtered = this.list.filter(id => !this.hidden.get(id));
            if (selectSingle && filtered.length === 1)
                return filtered[0];

            return null;
        } else {
            return value;
        }
    };

    next = () => {
        const list = this.list;
        const selected = this.state.selected;
        let position = list.findIndex(id => selected === id);
        if (this.hidden.get(list[position]))
            position = -1;

        while (++position < list.length) {
            if (!this.hidden.get(list[position]))
                break
        }
        if (position < list.length) {
            let id = list[position];
            this.setState({selected: id});
            this.updateScroll(id)
        }
    };

    prev = () => {
        const list = this.list;
        const selected = this.state.selected;
        let position = list.findIndex(id => selected === id);
        if (this.hidden.get(list[position]))
            position = list.length;

        while (--position >= 0) {
            if (!this.hidden.get(list[position]))
                break
        }
        if (position >= 0) {
            let id = list[position];
            this.setState({selected: id});
            this.updateScroll(id)
        }
    };

    updateScroll = (id) => {
        let child = this.elements[id];
        let container = this.el;
        const scrollTop = container.getScroll();
        const height = container.getHeight();
        let isVisible = scrollTop <= child.offsetTop && scrollTop + height >= child.offsetTop + child.clientHeight;
        if (!isVisible) {
            let scrollToBottom = child.offsetTop + child.clientHeight - height;
            let scrollToTop = child.offsetTop;
            if (Math.abs(scrollTop - scrollToTop) < Math.abs(scrollTop - scrollToBottom)) {
                container.setScroll(scrollToTop)
            } else {
                container.setScroll(scrollToBottom)
            }
        }
    };

    reset = () => {
        this.setState({selected: null});
        this.el.setScroll(0)
    };

    scrollTo = (id) => this.el.setScroll(this.elements[id] && this.elements[id].offsetTop);
}

export default FilteredList;

interface ItemWrapperProps {
    id
    label
    onClick?: MouseEventHandler
    onMouseDown?: MouseEventHandler
    onMouseEnter?: MouseEventHandler
    onMouseLeave?: MouseEventHandler
    classProvider?: (data) => string
    className?: string
    childComponent
    childProps
    element?: (el: HTMLDivElement) => void
}

class ItemWrapper extends React.Component<ItemWrapperProps> {
    data
    el: HTMLDivElement

    render() {
        const {id, label, onClick, onMouseDown, onMouseEnter, onMouseLeave, classProvider, className, childComponent, childProps} = this.props;
        const child = React.createElement(childComponent, {
            ...childProps,
            id,
            label,
            dataConsumer: (data) => this.data = data,
        });

        const cssClass = orNoop(classProvider)(this.data);
        return (
            <div className={classNames('ItemWrapper', cssClass, className)}
                 onMouseEnter={onMouseEnter}
                 onMouseLeave={onMouseLeave}
                 onMouseDown={onMouseDown}
                 onClick={onClick}
                 ref={ref('el', this)}
            >
                {child}
            </div>
        )
    }

    componentDidMount() {
        orNoop(this.props.element)(this.el);
        this.forceUpdate();
    }
}
