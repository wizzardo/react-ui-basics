import React, {ChangeEvent, Component, ReactElement, SyntheticEvent} from 'react';
import './Table.css'
import TextField from "./TextField";
import AutocompleteSelect, {MODE_DEFAULT, MODE_MULTIPLE_MINI} from "./AutocompleteSelect";
import Switch from "./Switch";
import {
    Comparators,
    NOOP,
    classNames,
    preventDefault,
    stopPropagation,
    isFunction,
    isString,
    orNoop,
    createRef,
    setInterval,
    createAccessor,
    UNDEFINED, DOCUMENT
} from "./Tools";
import MaterialIcon from "./MaterialIcon";
import {componentDidUpdate, componentWillUnmount, render, PureComponent, propsGetter, componentDidMount, stateGSs, stateGS} from "./ReactConstants";

export const SORT_ASC = Comparators.SORT_ASC;
export const SORT_DESC = Comparators.SORT_DESC;

const getId = item => item.id;

type SortOrder = typeof SORT_ASC | typeof SORT_DESC;
type Comparator = <T>(a: T, b: T) => number;

const editorSelect = 'Select'
const editorSwitch = 'Switch'

export interface RowProps<T> {
    i: number,
    item: T,
    disabled?: (t: T) => boolean,
    editing,
    onClick?: (t: T, e: SyntheticEvent) => void,
    className?: string | ((e: T) => string),
    columns: TableColumn<T>[],
    cancelEditing: () => void,
    onFinishEditing: () => void,
    handleInputChange: (e: ChangeEvent) => void,
    setValue: (v: any, t: T, field: keyof T) => void,
    setEditing: (t: T, row: number, column: number, value?: any, focused?: boolean) => void,
    onMouseDown?: (e: SyntheticEvent, row: number, column: number) => void,
    onMouseUp?: (e: SyntheticEvent, row: number, column: number) => void,
    onMouseEnter?: (e: SyntheticEvent, row: number, column: number) => void,
    onMouseLeave?: (e: SyntheticEvent, row: number, column: number) => void,
}

export type Formatter<T, V> = ((value: V, item?: T, format?: string) => ReactElement | string);

export type CellClassName<T> = (item: T, field: keyof T, row: number, column: number) => string;
export type ColumnClassName<T> = string | CellClassName<T>

export interface TableColumn<T> {
    field?: keyof T,
    className?: ColumnClassName<T>,
    onClick?: (e: SyntheticEvent, startEditing: () => void, item: T, field: keyof T, row: number, column: number) => void,
    comparator?: Comparator,
    header?: string | ReactElement,
    headerColspan?: number,
    sortable?: boolean,
    displayEditor?: boolean,
    formatter?: Formatter<T, T[keyof T]>,
    format?: string,
    editable?: boolean | ((t: T) => boolean),
    editor?: typeof editorSelect | typeof editorSwitch | ((t: T, cancel: () => void, isEditing: boolean) => ReactElement),
    preEditor?: (a: T[keyof T]) => any,
}

export interface TableColumnTyped<T, F extends keyof T> extends TableColumn<T>{
    field?: F,
    onClick?: (e: SyntheticEvent, startEditing: () => void, item: T, field: F, row: number, column: number) => void,
    formatter?: Formatter<T, T[F]>,
    preEditor?: (a: T[F]) => any,
}

export interface TableProps<T> {
    columns: TableColumn<T>[],
    data: T[],
    className?: string,
    sortOrder?: SortOrder
    sortBy?: string,
    onSortChange?: (sortBy: string, sortOrder: SortOrder) => void,
    onRowClick?: (t: T, e: SyntheticEvent) => void,
    disabled?: (t: T) => boolean,
    toKey?: (t: T) => number | string,
    onChange?: (t: T, cancel: () => void, rowIndex: number) => void,
    rowClassName?: string | ((t: T) => string),
    onMouseDown?: (e: SyntheticEvent, row: number, column: number) => void,
    onMouseUp?: (e: SyntheticEvent, row: number, column: number) => void,
    onMouseEnter?: (e: SyntheticEvent, row: number, column: number) => void,
    onMouseLeave?: (e: SyntheticEvent, row: number, column: number) => void,
}


export interface TableState<T> {
    sortOrder?: SortOrder
    sortBy?: string,
    comparator?: Comparator,
    data?: T[],
}

export interface EditingState<T> {
    id: number | string
    value: any
    rowIndex: number
    columnIndex: number
    item: T
    field: keyof T
    focused: boolean
}

class Table<T> extends Component<TableProps<T>, TableState<T>> {
    startEditing: (item: T, rowIndex: number, columnIndex: number, value?, focused?: boolean) => void;
    finishEditing: () => void;
    getEditingState: () => EditingState<T>;

    constructor(properties) {
        super(properties);
        const props = propsGetter(this);

        const headers = createRef();
        let updateHeadersInterval = 0;

        const updateHeaders = () => {
            const hidden = headers().querySelectorAll('.hidden');
            const fixed = headers().querySelectorAll('.fixed');
            for (let i = 0; i < hidden.length; i++) {
                fixed[i].style.width = hidden[i].offsetWidth + 'px'
            }
        };

        const editingState = stateGS<EditingState<T>>(this)
        const [dataState, sortByState, sortOrderState, comparatorState] = stateGSs(this, 4);
        const comparatorGetter = createAccessor('comparator');

        const cancelEditing = () => {
            editingState(null)
        };

        const setEditing = (item, rowIndex, columnIndex, value, focused = true) => {
            const {columns} = props()
            const field = columns[columnIndex].field
            editingState({id: item.id, value: (value != null ? value : item[field]), rowIndex, columnIndex, item, field, focused: !!focused})
        };
        this.startEditing = setEditing
        this.getEditingState = () => editingState()

        const handleInputChange = (event) => {
            const target = event.target;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            editingState({...editingState(), value});
        };

        const onFinishEditing = () => {
            const editing = editingState();
            if (!editing || editing.value === null)
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
            props().onChange(updated, cancelEditing, editing.rowIndex)
        };
        this.finishEditing = onFinishEditing

        const setValue = (value, item, field) => {
            editingState({...editingState(), item, field, value}, onFinishEditing)
        };


        const setData = (data, sortBy?, sortOrder?, comparator?) => {
            data = data ? [...data] : [];
            sortBy = sortBy || sortByState()
            sortOrder = sortOrder || sortOrderState()
            comparator = comparator || comparatorState()
            if (sortBy) {
                let c = comparator
                if (c && sortOrder === SORT_DESC)
                    c = Comparators.inverse(c)

                data.sort(c || Comparators.of(sortBy, sortOrder, data));
            }
            sortOrderState(sortOrder)
            comparatorState(comparator)
            sortByState(sortBy)
            dataState(data, () => {
                orNoop(props().onSortChange)(sortBy, sortOrder)
            })
        };

        const sort = (e, sortBy, comparator) => {
            preventDefault(e);
            const sortOrder = sortByState() === sortBy && sortOrderState() === SORT_ASC ? SORT_DESC : SORT_ASC;
            setData(dataState(), sortBy, sortOrder, comparator)
        }

        this[componentDidMount] = () => {
            const {sortBy, sortOrder = SORT_ASC, columns, data} = props();
            setData(data, sortBy, sortOrder, comparatorGetter(columns.find(it => it.field === sortBy)))
            updateHeaders();
            updateHeadersInterval = setInterval(updateHeaders, 1000)
        };

        this[componentDidUpdate] = (prevProps, prevState, snapshot) => {
            const {sortBy, sortOrder, columns, data} = props();
            if (sortBy !== prevProps.sortBy || sortOrder !== prevProps.sortOrder) {
                setData(dataState(), sortBy, sortOrder || SORT_ASC, comparatorGetter(columns.find(it => it.field === sortBy)))
            } else if (data !== prevProps.data) {
                setData(data)
            }
            updateHeaders();
        };

        this[render] = () => {
            const {columns = [], onRowClick = NOOP, disabled, className, rowClassName, toKey = getId, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave} = props();
            const sortBy = sortByState()
            const sortOrder = sortOrderState()
            const editing = editingState();
            const data = dataState() || [];
            return (
                <table className={classNames(`Table`, className)}>
                    <thead>
                    <tr ref={headers}>
                        {columns.filter(it => !!it).map((column, i) => {
                            const sortable = column.sortable || column.sortable == null;
                            if (column.headerColspan === 0)
                                return null

                            return (
                                <th key={i} colSpan={column.headerColspan} onClick={e => sortable && sort(e, column.field, comparatorGetter(column))}>
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
                    {data.map((item, i) => (<Row
                            key={toKey(item)}
                            i={i}
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
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
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
    const formatter = column.formatter;
    return formatter ? (formatter as ((value?: any, item?: any, format?: string) => ReactElement))(value, item, column.format) : '' + value;
};

export interface TableColumnSelect<T> extends TableColumn<T> {
    editorData?: any,
    multiSelect?: any,
    onSelect?: any,
    editorSelectedComponent?: any,
    editorChildComponent?: any,
    prefilter?: any,
    filter?: (value: any, filterValue: string) => boolean,
}

class Row<T> extends PureComponent<RowProps<T>> {
    render() {
        let {item, i, disabled, editing, onClick, className, columns, setEditing, cancelEditing, onFinishEditing, handleInputChange, setValue, onMouseDown, onMouseEnter, onMouseUp, onMouseLeave} = this.props;
        return <tr onClick={e => onClick(item, e)}
                   className={classNames(
                       disabled && disabled(item) && 'disabled',
                       className && (isFunction(className) ? (className as (t: T) => string)(item) : className as string))
                   }>
            {columns.filter(it => !!it).map((column, j) => {
                const isEditing = editing && editing.columnIndex === j;
                const editable = isFunction(column.editable) ? (column.editable as ((t: T) => boolean))(item) : !!column.editable;
                const startEditing = !isEditing && editable ? () => setEditing(item, i, j) : NOOP;
                const onClick = (!!column.onClick ? (e) => column.onClick(e, startEditing, item, column.field, i, j) : startEditing)

                let displayEditor = isEditing || column.displayEditor;
                let value =  item[column.field];
                if(editing) {
                    value = editing.value != null ? editing.value : value;
                    value = column.preEditor ? column.preEditor(value) : value
                }
                return (
                    <td key={j}
                        onMouseDown={onMouseDown ? (e) => onMouseDown(e, i, j) : UNDEFINED}
                        onMouseUp={onMouseUp ? (e) => onMouseUp(e, i, j) : UNDEFINED}
                        onMouseEnter={onMouseEnter ? (e) => onMouseEnter(e, i, j) : UNDEFINED}
                        onMouseLeave={onMouseLeave ? (e) => onMouseLeave(e, i, j) : UNDEFINED}
                        className={classNames(
                            editable ? 'editable' : 'ro',
                            isEditing && 'editing',
                            isString(column.className) && (column.className as string),
                            isFunction(column.className) && (column.className as CellClassName<T>)(item, column.field, i, j),
                        )}
                        onClick={onClick}>
                        {displayEditor && !column.editor && (
                            <TextField
                                value={value}
                                focused={editing.focused}
                                onFocus={() => {
                                    setEditing(item, i, j, value, true)
                                }}
                                onBlur={onFinishEditing}
                                onChange={handleInputChange}
                                onKeyUp={e => {
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
                        {displayEditor && column.editor === editorSelect && (
                            <AutocompleteSelect
                                value={value}
                                data={(column as TableColumnSelect<T>).editorData}
                                focused={true}
                                withArrow={false}
                                withFilter={true}
                                selectedMode={'inline'}
                                selectedComponent={(column as TableColumnSelect<T>).editorSelectedComponent}
                                mode={(column as TableColumnSelect<T>).multiSelect ? MODE_MULTIPLE_MINI : MODE_DEFAULT}
                                onChange={(column as TableColumnSelect<T>).multiSelect && ((column as TableColumnSelect<T>).onSelect ? (value => {
                                    setValue((column as TableColumnSelect<T>).onSelect(value), item, column.field);
                                }) : value => setValue(value, item, column.field))}
                                onSelect={!(column as TableColumnSelect<T>).multiSelect && ((column as TableColumnSelect<T>).onSelect ? (value => {
                                    setValue((column as TableColumnSelect<T>).onSelect(value), item, column.field);
                                }) : value => setValue(value, item, column.field))}
                                childComponent={(column as TableColumnSelect<T>).editorChildComponent}
                                onCancel={cancelEditing}
                                prefilter={(column as TableColumnSelect<T>).prefilter}
                                filter={(column as TableColumnSelect<T>).filter}
                                listPortal={DOCUMENT.body}
                            />
                        )}
                        {displayEditor && column.editor === editorSwitch && (
                            <Switch onClick={e => {
                                stopPropagation(e);
                                preventDefault(e);
                                setValue(!value, item, column.field)
                            }} value={value}/>
                        )}
                        {displayEditor && isFunction(column.editor)
                            && (column.editor as ((t: T, cancel: () => void, isEditing: boolean) => ReactElement))(item, cancelEditing, isEditing)}
                        {!isEditing && !column.displayEditor && formatValue(item, column)}
                    </td>
                );
            })}
        </tr>
    }
}


export default Table;