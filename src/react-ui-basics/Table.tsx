import React, {ChangeEvent, Component, ReactElement} from 'react';
import './Table.css'
import TextField from "./TextField";
import AutocompleteSelect, {MODE_DEFAULT, MODE_MULTIPLE_MINI} from "./AutocompleteSelect";
import Switch from "./Switch";
import {Comparators, NOOP, classNames, preventDefault, stopPropagation, isFunction, isString, orNoop, createRef, setInterval} from "./Tools";
import MaterialIcon from "./MaterialIcon";
import {componentDidUpdate, componentWillUnmount, render, PureComponent} from "./ReactConstants";

export const SORT_ASC = Comparators.SORT_ASC;
export const SORT_DESC = Comparators.SORT_DESC;

const getId = item => item.id;

type SortOrder = typeof SORT_ASC | typeof SORT_DESC;
type Comparator = <T>(a: T, b: T) => number;

const editorSelect = 'Select'
const editorSwitch = 'Switch'

export interface RowProps<T> {
    item: T,
    disabled?: (t: T) => boolean,
    editing,
    onClick?: (t: T) => void,
    className?: string | ((e: T) => string),
    columns: TableColumn<T>[],
    cancelEditing: () => void,
    onFinishEditing: () => void,
    handleInputChange: (e: ChangeEvent) => void,
    setValue: (v: any) => void,
    setEditing: (t: T, i: number, field: string) => void,
}

export type Formatter<T, V> = ((value?: V, item?: T, format?: string) => ReactElement) | ((value: V, item: T) => ReactElement) | ((value: V) => ReactElement);

export interface TableColumn<T> {
    field?: string,
    className?: string,
    comparator?: Comparator,
    header?: string | ReactElement,
    sortable?: boolean,
    displayEditor?: boolean,
    formatter?: Formatter<T, any>,
    format?: string,
    editable?: boolean | ((t: T) => boolean),
    editor?: typeof editorSelect | typeof editorSwitch | ((t: T, cancel: () => void, isEditing: boolean) => ReactElement),
    preEditor?: (a: any) => any,
}

export interface TableProps<T> {
    columns: TableColumn<T>[],
    data: T[],
    className?: string,
    sortOrder?: SortOrder
    sortBy?: string,
    onSortChange?: (sortBy: string, sortOrder: SortOrder) => void,
    onRowClick?: (t: T) => void,
    disabled?: (t: T) => boolean,
    toKey?: (t: T) => number | string,
    onChange?: (t: T, cancel: () => void) => void,
    rowClassName?: string | ((t: T) => string),
}


export interface TableState<T> {
    sortOrder?: SortOrder
    sortBy?: string,
    comparator?: Comparator,
    data?: T[],
    editing?: any,
}

class Table<T> extends Component<TableProps<T>, TableState<T>> {

    constructor(props) {
        super(props);
        this.state = {};

        const headers = createRef();
        let updateHeadersInterval = 0;

        const updateHeaders = () => {
            const hidden = headers().querySelectorAll('.hidden');
            const fixed = headers().querySelectorAll('.fixed');
            for (let i = 0; i < hidden.length; i++) {
                fixed[i].style.width = hidden[i].offsetWidth + 'px'
            }
        };

        const cancelEditing = () => this.setState({editing: false});

        const setEditing = (item, columnIndex, field) => {
            this.setState({editing: {id: item.id, value: item[field], columnIndex, item, field}});
        };

        const extractValue = (event) => {
            const target = event.target;
            return target.type === 'checkbox' ? target.checked : target.value;
        };

        const handleInputChange = (event) => {
            const value = extractValue(event);
            this.setState({editing: {...this.state.editing, value}});
        };

        const onFinishEditing = () => {
            const editing = this.state.editing;
            if (editing.value === null)
                return;

            let value = editing.value;
            if (isString(value))
                value = value.trim();

            if (value === editing.item[editing.field])
                return cancelEditing();

            let updated = {
                ...editing.item,
                [editing.field]: value
            };
            this.props.onChange(updated, cancelEditing)
        };

        const setValue = (value) => {
            this.setState({editing: {...this.state.editing, value}}, onFinishEditing);
        };


        const setData = (data) => {
            const {sortBy, sortOrder, comparator} = this.state;
            data = [...data];
            if (sortBy) {
                let c = comparator
                if (c && sortOrder === SORT_DESC)
                    c = Comparators.inverse(c)

                data.sort(c || Comparators.of(sortBy, sortOrder, data));
            }
            this.setState({data}, () => {
                orNoop(this.props.onSortChange)(sortBy, sortOrder)
            })
        };

        const sort = (e, sortBy, comparator) => {
            preventDefault(e);
            this.setState({
                sortOrder: this.state.sortBy === sortBy && this.state.sortOrder === SORT_ASC ? SORT_DESC : SORT_ASC,
                comparator,
                sortBy
            }, () => setData(this.state.data));
        }

        this.componentDidMount = () => {
            const {sortBy, sortOrder = SORT_ASC, columns} = this.props;
            this.setState({
                sortBy,
                sortOrder,
                comparator: columns.find(it => it.field === sortBy)?.comparator
            }, () => setData(this.props.data));

            updateHeaders();
            updateHeadersInterval = setInterval(updateHeaders, 1000)
        };

        this[componentDidUpdate] = (prevProps, prevState, snapshot) => {
            const {sortBy, sortOrder, columns, data} = this.props;
            if (sortBy !== prevProps.sortBy || sortOrder !== prevProps.sortOrder) {
                this.setState({
                    sortBy,
                    sortOrder: sortOrder || SORT_ASC,
                    comparator: columns.find(it => it.field === sortBy)?.comparator
                }, () => setData(data));

            } else if (data !== prevProps.data) {
                setData(data)
            }
            updateHeaders();
        };

        this[render] = () => {
            const {columns = [], onRowClick = NOOP, disabled, className, rowClassName, toKey = getId} = this.props;
            const {sortBy, sortOrder, data = [], editing} = this.state;
            return (
                <table className={classNames(`Table`, className)}>
                    <thead>
                    <tr ref={headers}>
                        {columns.filter(it => !!it).map((column, i) => {
                            const sortable = column.sortable || column.sortable == null;
                            return (
                                <th key={i} onClick={e => sortable && sort(e, column.field, column.comparator)}>
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
                                            editing={editing && editing.id === toKey(item) ? editing : null}
                                            onClick={onRowClick}
                                            className={rowClassName}
                                            columns={columns}
                                            setEditing={setEditing}
                                            cancelEditing={cancelEditing}
                                            onFinishEditing={onFinishEditing}
                                            handleInputChange={handleInputChange}
                                            setValue={setValue}
                        />
                    ))}
                    </tbody>
                </table>
            );
        };

        this[componentWillUnmount] = () => {
            clearInterval(updateHeadersInterval)
        };
    }
}

const formatValue: (<T>(item: T, column: TableColumn<T>) => string | ReactElement) = (item, column) => {
    const value = item[column.field];
    if (column.formatter) {
        return (column.formatter as ((value?: any, item?: any, format?: string) => ReactElement))(value, item, column.format)
    } else {
        return '' + value
    }
};

interface TableColumnSelect extends TableColumn<any> {
    editorData?: any,
    editorSelectedComponent?: any,
    multiSelect?: any,
    onSelect?: any,
    editorChildCompononRowClickent?: any,
    prefilter?: any,
}

class Row<T> extends PureComponent<RowProps<T>> {
    render() {
        let {item, disabled, editing, onClick, className, columns, setEditing, cancelEditing, onFinishEditing, handleInputChange, setValue} = this.props;
        return <tr onClick={e => onClick(item)}
                   className={classNames(
                       disabled && disabled(item) && 'disabled',
                       className && (isFunction(className) ? (className as (t: T) => string)(item) : className as string))
                   }>
            {columns.filter(it => !!it).map((column, i) => {
                const isEditing = editing && editing.columnIndex === i;
                const editable = isFunction(column.editable) ? (column.editable as ((t: T) => boolean))(item) : !!column.editable;
                return (
                    <td key={i}
                        className={classNames(editable ? 'editable' : 'ro', isEditing && 'editing', column.className)}
                        onClick={!isEditing && editable ? () => setEditing(item, i, column.field) : NOOP}>
                        {(isEditing || column.displayEditor) && !column.editor && (
                            <TextField
                                value={column.preEditor ? column.preEditor(editing.value) : editing.value}
                                focused={true}
                                onBlur={cancelEditing}
                                onChange={handleInputChange}
                                onKeyDown={e => {
                                    if (e.keyCode === 27/*escape*/) {
                                        preventDefault(e);
                                        cancelEditing();
                                    }
                                    if (e.keyCode === 13/*enter*/) {
                                        preventDefault(e);
                                        onFinishEditing();
                                    }
                                }}
                            />
                        )}
                        {(isEditing || column.displayEditor) && column.editor === editorSelect && (
                            <AutocompleteSelect
                                value={column.preEditor ? column.preEditor(editing.value) : editing.value}
                                data={(column as TableColumnSelect).editorData}
                                focused={true}
                                withArrow={false}
                                withFilter={false}
                                selectedMode={'inline'}
                                selectedComponent={(column as TableColumnSelect).editorSelectedComponent}
                                mode={(column as TableColumnSelect).multiSelect ? MODE_MULTIPLE_MINI : MODE_DEFAULT}
                                onChange={(column as TableColumnSelect).multiSelect && ((column as TableColumnSelect).onSelect ? (value => setValue((column as TableColumnSelect).onSelect(value))) : setValue)}
                                onSelect={!(column as TableColumnSelect).multiSelect && ((column as TableColumnSelect).onSelect ? (value => setValue((column as TableColumnSelect).onSelect(value))) : setValue)}
                                childComponent={(column as TableColumnSelect).editorChildCompononRowClickent}
                                onCancel={cancelEditing}
                                prefilter={(column as TableColumnSelect).prefilter}
                            />
                        )}
                        {(isEditing || column.displayEditor) && column.editor === editorSwitch && (
                            <Switch onClick={e => {
                                stopPropagation(e);
                                preventDefault(e);
                                setValue(!item[column.field])
                            }} value={item[column.field]}/>
                        )}
                        {(isEditing || column.displayEditor) && isFunction(column.editor)
                            && (column.editor as ((t: T, cancel: () => void, isEditing: boolean) => ReactElement))(item, cancelEditing, isEditing)}
                        {!isEditing && !column.displayEditor && formatValue(item, column)}
                    </td>
                );
            })}
        </tr>
    }
}


export default Table;