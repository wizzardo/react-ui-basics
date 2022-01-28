import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './FilteredList.css'
import Scrollable from "./Scrollable";
import {classNames, orNoop, ref, stopPropagation, isFunction, isObject} from "./Tools";
import {PureComponent} from "./ReactConstants";

export const getLabel = (labels, id) => isFunction(labels) ? labels(id) : labels[id]

class FilteredList extends PureComponent {

    static defaultProps = {
        data: [],
        labels: {},
        selected: {},
        inline: false,
        selectSingle: true,
        filter: () => true,
    };

    constructor(props) {
        super(props);
        this.state = {selected: -1};
        this.hidden = {};
        this.elements = {};
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
            this.setState({selected: -1})
    };

    render() {
        const {data, labels, filter, className, selected, inline, childComponent, childProps, style, scroll} = this.props;
        return (
            <Scrollable className={classNames('FilteredList', className, inline ? 'inline' : 'popup')}
                        ref={ref('el', this)} style={style} scrollBarMode={scroll}>
                {(data || []).filter(id => id !== false && id != null).map(id => <ItemWrapper
                    id={id}
                    key={id}
                    label={getLabel(labels, id)}
                    childComponent={childComponent}
                    childProps={childProps}
                    element={el => this.elements[id] = el}
                    onClick={e => {
                        stopPropagation(e);
                        this.onSelect(id);
                    }}
                    onMouseEnter={e => this.setState({selected: id})}
                    onMouseLeave={e => id === this.state.selected && this.setState({selected: -1})}
                    className={classNames('child', this.state.selected === id && 'active', selected === id || (isObject(selected) && selected[id]) && 'selected')}
                    classProvider={it => (this.hidden[id] = !filter(it)) && 'hidden'}
                />)}
            </Scrollable>
        )
    }

    onSelect = (id) => {
        this.setState({selected: id});
        this.props.onSelect(id);
    };

    selected = () => {
        const {selected: value} = this.state;
        const {selectSingle} = this.props;


        if (value === -1 || this.hidden[value]) {
            let filtered = this.list.filter(id => !this.hidden[id]);
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
        if (this.hidden[list[position]])
            position = -1;

        while (++position < list.length) {
            if (!this.hidden[list[position]])
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
        if (this.hidden[list[position]])
            position = list.length;

        while (--position >= 0) {
            if (!this.hidden[list[position]])
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
        this.setState({selected: -1});
        this.el.scrollTop = 0;
    };

    scrollTo = (id) => this.el.setScroll(this.elements[id] && this.elements[id].offsetTop);
}

export default FilteredList;

class ItemWrapper extends React.Component {
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
