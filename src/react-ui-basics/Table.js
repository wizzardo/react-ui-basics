import React, {Component} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Table.css'
import PropTypes from "prop-types";
import TextField from "./TextField";
import AutocompleteSelect, {MODE_DEFAULT, MODE_MULTIPLE_MINI} from "./AutocompleteSelect";
import Switch from "./Switch";
import {Comparators, NOOP, classNames, preventDefault, stopPropagation, isFunction, isString} from "./Tools";
import MaterialIcon from "./MaterialIcon";

export const SORT_ASC = Comparators.SORT_ASC;
export const SORT_DESC = Comparators.SORT_DESC;

const getId = item => item.id;


class Table extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const {sortBy, sortOrder = SORT_ASC} = this.props;
        this.setState({sortBy, sortOrder}, () => this.setData(this.props.data));

        this.updateHeaders();
        this.updateHeadersInterval = setInterval(this.updateHeaders, 1000)
    };

    setData = (data) => {
        const {sortBy, sortOrder} = this.state;
        sortBy && data.sort(Comparators.of(sortBy, sortOrder, data));
        this.setState({data})
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.data !== prevProps.data) {
            this.setData(this.props.data)
        }
        this.updateHeaders();
    };

    render() {
        const {columns = [], onRowClick = NOOP, disabled, className, rowClassName, toKey = getId} = this.props;
        const {sortBy, sortOrder, data = [], editing} = this.state;
        return (
            <table className={classNames(`Table`, className)}>
                <thead>
                <tr ref={headers => this.headers = headers}>
                    {columns.filter(it => !!it).map((column, i) => {
                        const sortable = column.sortable || column.sortable == null;
                        return (
                            <th key={i} onClick={e => sortable && this.sort(e, column.field)}>
                                <div className={classNames('hidden', sortable && 'sortable', sortBy === column.field && 'active')}>
                                    {column.header}
                                    {column.header && sortBy === column.field && sortOrder === SORT_ASC && (<MaterialIcon icon={'keyboard_arrow_up'}/>)}
                                    {column.header && sortBy === column.field && sortOrder === SORT_DESC && (<MaterialIcon icon={'keyboard_arrow_down'}/>)}
                                </div>
                                <div className={classNames('fixed', sortable && 'sortable', sortBy === column.field && 'active')}>
                                    {column.header}
                                    {column.header && sortBy === column.field && sortOrder === SORT_ASC && (<MaterialIcon icon={'keyboard_arrow_up'}/>)}
                                    {column.header && sortBy === column.field && sortOrder === SORT_DESC && (<MaterialIcon icon={'keyboard_arrow_down'}/>)}
                                </div>
                            </th>
                        );
                    })}
                </tr>
                </thead>
                <tbody>
                {data.map(item => (item &&
                    <tr key={toKey(item)} onClick={e => onRowClick(item)}
                        className={classNames(disabled && disabled(item) && 'disabled', rowClassName && rowClassName(item))}>
                        {columns.filter(it => !!it).map((column, i) => {
                            const isEditing = editing && editing.id === item.id && editing.columnIndex === i;
                            const editable = isFunction(column.editable) ? column.editable(item) : !!column.editable;
                            return (
                                <td key={i}
                                    className={classNames(editable ? 'editable' : 'ro', isEditing && 'editing', column.className)}
                                    onClick={!isEditing && editable ? () => this.setEditing(item, i, column.field) : NOOP}>
                                    {(isEditing || column.displayEditor) && !column.editor && (
                                        <TextField
                                            value={column.preEditor ? column.preEditor(editing.value) : editing.value}
                                            focused={true}
                                            onBlur={this.cancelEditing}
                                            onChange={this.handleInputChange}
                                            onKeyDown={e => {
                                                if (e.keyCode === 27/*escape*/) {
                                                    preventDefault(e);
                                                    this.cancelEditing();
                                                }
                                                if (e.keyCode === 13/*enter*/) {
                                                    preventDefault(e);
                                                    this.onFinishEditing();
                                                }
                                            }}
                                        />
                                    )}
                                    {(isEditing || column.displayEditor) && column.editor === 'Select' && (
                                        <AutocompleteSelect
                                            value={column.preEditor ? column.preEditor(editing.value) : editing.value}
                                            data={column.editorData}
                                            focused={true}
                                            withArrow={false}
                                            withFilter={false}
                                            selectedMode={'inline'}
                                            selectedComponent={column.editorSelectedComponent}
                                            mode={column.multiSelect ? MODE_MULTIPLE_MINI : MODE_DEFAULT}
                                            onChange={column.multiSelect && (column.onSelect ? (value => this.selectNewValue(column.onSelect(value))) : this.selectNewValue)}
                                            onSelect={!column.multiSelect && (column.onSelect ? (value => this.selectNewValue(column.onSelect(value))) : this.selectNewValue)}
                                            childComponent={column.editorChildCompononRowClickent}
                                            onCancel={this.cancelEditing}
                                            prefilter={column.prefilter}
                                        />
                                    )}
                                    {(isEditing || column.displayEditor) && column.editor === 'Switch' && (
                                        <Switch onClick={e => {
                                            stopPropagation(e);
                                            preventDefault(e);
                                            this.setState({editing: {...this.prepareEditing(item, column.field, i), value: !item[column.field]}}, this.onFinishEditing);
                                        }} value={item[column.field]}/>
                                    )}
                                    {(isEditing || column.displayEditor) && isFunction(column.editor) && column.editor(item, this.cancelEditing, isEditing)}
                                    {!isEditing && !column.displayEditor && this.formatValue(item, column)}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

    componentWillUnmount() {
        clearInterval(this.updateHeadersInterval)
    };

    updateHeaders = () => {
        const headers = this.headers;

        const hidden = headers.querySelectorAll('.hidden');
        const fixed = headers.querySelectorAll('.fixed');
        for (let i = 0; i < hidden.length; i++) {
            fixed[i].style.width = hidden[i].offsetWidth + 'px'
        }
    };

    cancelEditing = () => this.setState({editing: false});

    setEditing = (item, columnIndex, field) => this.setState({editing: this.prepareEditing(item, field, columnIndex)});

    prepareEditing = (item, field, columnIndex) => ({id: item.id, value: item[field], columnIndex, item, field});

    formatValue = (item, column) => {
        const value = (column.value !== undefined) ? column.value : item[column.field];
        if (column.formatter) {
            return column.formatter(value, item, column.format)
        } else {
            return '' + value
        }
    };

    handleInputChange = (event) => {
        const value = this.extractValue(event);
        this.setState({editing: {...this.state.editing, value}});
    };

    extractValue = (event) => {
        const target = event.target;
        return target.type === 'checkbox' ? target.checked : target.value;
    };

    selectNewValue = (value) => {
        this.setState({editing: {...this.state.editing, value}}, this.onFinishEditing);
    };

    onFinishEditing = (e) => {
        const editing = this.state.editing;
        if (editing.value === null)
            return;

        let value = editing.value;
        if (isString(value))
            value = value.trim();

        if (value === editing.item[editing.field])
            return this.cancelEditing();

        let updated = {
            ...editing.item,
            [editing.field]: value
        };
        this.props.onChange(updated, this.cancelEditing)
    };

    sort = (e, sortBy) => {
        preventDefault(e);
        if (this.state.sortBy === sortBy)
            this.setState({sortOrder: this.state.sortOrder === SORT_ASC ? SORT_DESC : SORT_ASC}, () => this.setData(this.state.data));
        else
            this.setState({sortOrder: SORT_ASC, sortBy}, () => this.setData(this.state.data));
    }
}

Table.defaultProps = {
    columns: [],
    onRowClick: NOOP,
    toKey: getId,
};

if (window.isNotProductionEnvironment) {
    Table.propTypes = {
        className: PropTypes.string,
        rowClassName: PropTypes.string,
        columns: PropTypes.arrayOf(PropTypes.shape({
            header: PropTypes.string,
            className: PropTypes.string,
            sortable: PropTypes.bool,
            field: PropTypes.string,
            formatter: PropTypes.func,
            editable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            editor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
            displayEditor: PropTypes.func,
            preEditor: PropTypes.func,
        })),
        data: PropTypes.array,
        disabled: PropTypes.func,
        onRowClick: PropTypes.func,
        toKey: PropTypes.func,
    };
}


export default Table;