import React, {Component} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './Table.css'
import PropTypes from "prop-types";
import TextField from "./TextField";
import AutocompleteSelect, {MODE_DEFAULT, MODE_MULTIPLE_MINI} from "./AutocompleteSelect";
import Switch from "./Switch";
import {Comparators, NOOP, classNames, preventDefault, stopPropagation, isFunction, isString, orNoop} from "./Tools";
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
        const {sortBy, sortOrder = SORT_ASC, columns} = this.props;
        this.setState({
            sortBy,
            sortOrder,
            comparator: columns.find(it => it.field === sortBy)?.comparator
        }, () => this.setData(this.props.data));

        this.updateHeaders();
        this.updateHeadersInterval = setInterval(this.updateHeaders, 1000)
    };

    setData = (data) => {
        const {sortBy, sortOrder, comparator} = this.state;
        if (sortBy) {
            let c = comparator
            if(c && sortOrder === SORT_DESC)
                c = Comparators.inverse(c)

            data.sort(c || Comparators.of(sortBy, sortOrder, data));
        }
        this.setState({data}, () => {
            orNoop(this.props.onSortChange)(sortBy, sortOrder)
        })
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
                            <th key={i} onClick={e => sortable && this.sort(e, column.field, column.comparator)}>
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
                {data.map(item => (<Row key={toKey(item)}
                                        item={item}
                                        disabled={disabled}
                                        editing={editing && editing.id === item.id ? editing : null}
                                        onClick={onRowClick}
                                        className={rowClassName}
                                        columns={columns}
                                        editingContext={this}
                    />
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

    sort = (e, sortBy, comparator) => {
        preventDefault(e);
        this.setState({
            sortOrder: this.state.sortBy === sortBy && this.state.sortOrder === SORT_ASC ? SORT_DESC : SORT_ASC,
            comparator,
            sortBy
        }, () => this.setData(this.state.data));
    }
}

const formatValue = (item, column) => {
    const value = (column.value !== undefined) ? column.value : item[column.field];
    if (column.formatter) {
        return column.formatter(value, item, column.format)
    } else {
        return '' + value
    }
};

const Row = React.memo(({item, disabled, editing, onClick, className, columns, editingContext}) => {
    return <tr onClick={e => onClick(item)}
               className={classNames(disabled && disabled(item) && 'disabled', className && (isFunction(className) ? className(item) : className))}>
        {columns.filter(it => !!it).map((column, i) => {
            const isEditing = editing && editing.id === item.id && editing.columnIndex === i;
            const editable = isFunction(column.editable) ? column.editable(item) : !!column.editable;
            return (
                <td key={i}
                    className={classNames(editable ? 'editable' : 'ro', isEditing && 'editing', column.className)}
                    onClick={!isEditing && editable ? () => editingContext.setEditing(item, i, column.field) : NOOP}>
                    {(isEditing || column.displayEditor) && !column.editor && (
                        <TextField
                            value={column.preEditor ? column.preEditor(editing.value) : editing.value}
                            focused={true}
                            onBlur={editingContext.cancelEditing}
                            onChange={editingContext.handleInputChange}
                            onKeyDown={e => {
                                if (e.keyCode === 27/*escape*/) {
                                    preventDefault(e);
                                    editingContext.cancelEditing();
                                }
                                if (e.keyCode === 13/*enter*/) {
                                    preventDefault(e);
                                    editingContext.onFinishEditing();
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
                            onChange={column.multiSelect && (column.onSelect ? (value => editingContext.selectNewValue(column.onSelect(value))) : editingContext.selectNewValue)}
                            onSelect={!column.multiSelect && (column.onSelect ? (value => editingContext.selectNewValue(column.onSelect(value))) : editingContext.selectNewValue)}
                            childComponent={column.editorChildCompononRowClickent}
                            onCancel={editingContext.cancelEditing}
                            prefilter={column.prefilter}
                        />
                    )}
                    {(isEditing || column.displayEditor) && column.editor === 'Switch' && (
                        <Switch onClick={e => {
                            stopPropagation(e);
                            preventDefault(e);
                            editingContext.setState({
                                editing: {
                                    ...editingContext.prepareEditing(item, column.field, i),
                                    value: !item[column.field]
                                }
                            }, editingContext.onFinishEditing);
                        }} value={item[column.field]}/>
                    )}
                    {(isEditing || column.displayEditor) && isFunction(column.editor) && column.editor(item, editingContext.cancelEditing, isEditing)}
                    {!isEditing && !column.displayEditor && formatValue(item, column)}
                </td>
            );
        })}
    </tr>
    }
)

Table.defaultProps = {
    columns: [],
    onRowClick: NOOP,
    toKey: getId,
};

if (window.isNotProductionEnvironment) {
    Table.propTypes = {
        className: PropTypes.string,
        rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        columns: PropTypes.arrayOf(PropTypes.shape({
            header: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
            className: PropTypes.string,
            sortable: PropTypes.bool,
            field: PropTypes.string,
            formatter: PropTypes.func,
            comparator: PropTypes.func,
            editable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            editor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
            displayEditor: PropTypes.bool,
            preEditor: PropTypes.func,
        })),
        data: PropTypes.array,
        disabled: PropTypes.func,
        onRowClick: PropTypes.func,
        onSortChange: PropTypes.func,
        onChange: PropTypes.func,
        toKey: PropTypes.func,
    };
}


export default Table;