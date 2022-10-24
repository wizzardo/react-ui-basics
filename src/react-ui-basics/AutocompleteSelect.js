import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import PropTypes from 'prop-types';
import './AutocompleteSelect.css'
import TextField from "./TextField";
import FilteredList, {getLabel} from "./FilteredList";
import {
    classNames,
    continuousIncludes,
    getRandomId,
    ref,
    orNoop,
    preventDefault,
    stopPropagation,
    DOCUMENT,
    addEventListener,
    removeEventListener,
    isObject,
    isFunction,
    isString, UNDEFINED, memo
} from "./Tools";
import Button from "./Button";
import MaterialIcon from "./MaterialIcon";
import {PureComponent} from "./ReactConstants";
import ReactDOM from "react-dom";

export const MODE_DEFAULT = 'default';
export const MODE_INLINE = 'inline';
export const MODE_INLINE_MULTIPLE = 'inline-multiple';
export const MODE_MULTIPLE_AUTO = 'multiple-auto';
export const MODE_MULTIPLE = 'multiple';
export const MODE_MULTIPLE_MINI = 'multiple-mini';
export const MODE_MINI = 'mini';
export const MODE_MULTIPLE_MINI_INLINE = 'multiple-mini-inline';


const DummyChild = ({id, label, dataConsumer, onClick}) => {
    orNoop(dataConsumer)(label || id);
    return <div className={`DummyChild`} onClick={onClick}>{label || id}</div>
};

const prepareSelected = (value) => {
    let result;
    if (value != null) {
        if (Array.isArray(value))
            result = value.reduce((map, obj) => {
                map[obj] = obj;
                return map;
            }, {});
        else if (isObject(value))
            result = value;
        else if (value)
            result = {[value]: value};
        else
            result = {}
    } else {
        result = {};
    }
    return result;
};

const findParent = (el, tag) => {
    if (el != null) {
        const tagName = el.tagName;
        if (tagName && tagName.toUpperCase() === tag.toUpperCase()) {
            return el;
        } else {
            return findParent(el.parentNode, tag)
        }
    }
    return null;
}

function isMultipleSelect(mode) {
    return mode === MODE_MULTIPLE || mode === MODE_MULTIPLE_AUTO || mode === MODE_INLINE_MULTIPLE || mode === MODE_MULTIPLE_MINI || mode === MODE_MULTIPLE_MINI_INLINE;
}

class AutocompleteSelect extends PureComponent {

    static propTypes = {
        mode: PropTypes.oneOf([MODE_DEFAULT, MODE_INLINE, MODE_MULTIPLE, MODE_MULTIPLE_AUTO, MODE_MULTIPLE_MINI, MODE_MULTIPLE_MINI_INLINE, MODE_INLINE_MULTIPLE, MODE_MINI])
    };

    constructor(props) {
        super(props);
        const that = this;
        that.state = {
            selected: prepareSelected(props.value),
            isActive: !!props.focused,

        };
        that.randomId = getRandomId('acs-');

        const {data, getSelected} = props;
        isFunction(data) && data(data => that.setState({data}));

        getSelected && getSelected(() => Object.values(that.state.selected));
    }

    componentDidMount() {
        addEventListener(DOCUMENT, 'mousedown', this.listener = (e) => {
            if (this.state.isActive && this.el && !this.el.contains(e.target)) {
                if(!this.props.listPortal || !this.list?.el?.el || !this.list.el.el.contains(e.target)){
                    this.onClickOutside()
                }
            }
        })
        if (this.props.required) {
            const form = findParent(this.el.parentNode, 'form')
            if (form) {
                addEventListener(this.submitButton = form.querySelector('button[type=submit]'), 'click', this.formSubmitListener = (e) => {
                    const errored = Object.keys(this.state.selected).length === 0;
                    this.setState({errored: errored})
                })
            }
        }
        this.initSelected(this.props, this.state)
        this.updateListPosition()
    }

    updateListPosition = () => {
        if (this.props.listPortal && this.state.isActive) {
            var rect = this.el.getBoundingClientRect();
            this.setState({
                listStyles: {
                    position: 'absolute',
                    top: rect.bottom + 'px',
                    left: rect.left + 'px',
                    minWidth: rect.width + 'px',
                    maxHeight: '300px',
                }
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value !== prevProps.value)
            this.initSelected(this.props, this.state)
        if (this.state.isActive && !prevState.isActive)
            this.updateListPosition()
    }

    initSelected = ({value, mode, allowCustom}, {filterValue = ''}) => {
        this.setState({
            selected: prepareSelected(value),
            filterValue: allowCustom && isString(value) && !isMultipleSelect(mode) ? value : filterValue,
        });
    };

    componentWillUnmount() {
        removeEventListener(DOCUMENT, 'mousedown', this.listener)
        removeEventListener(this.submitButton, 'click', this.formSubmitListener)
    }

    static defaultProps = {
        childComponent: DummyChild,
        withArrow: true,
        withFilter: true,
        withReset: false,
        scrollToValue: false,
        mode: MODE_DEFAULT,
        selectedMode: 'full',
        removeIcon: <MaterialIcon icon="close"/>,
    };

    createFilter = memo((prefilter, filterValue, filterValueTrimmed, filter) => it => {
            if (!it) return false;
            if (prefilter && !prefilter(it)) return false;
            if (!filterValue) return true;

            if (filter) return filter(it, filterValueTrimmed);

            let value = (isString(it) ? it : (it.name || it.label || '')).toLowerCase().trim();
            return continuousIncludes(value, filterValueTrimmed);
        }
    )

    render() {
        const {
            childComponent,
            childProps,
            withArrow,
            withFilter,
            withReset,
            filter,
            label,
            inputLabel,
            mode,
            selectedMode,
            prefilter,
            className,
            scrollToValue,
            scroll,
            required,
            allowCustom,
            inlineSelected,
            removeIcon,
            listPortal,
        } = this.props;
        const id = this.props.id || this.randomId;
        const selectedComponent = this.props.selectedComponent || childComponent;
        const {selected = {}, filterValue = '', errored} = this.state;
        let {isActive, listStyles} = this.state;
        if (this.props.isActive !== UNDEFINED) {
            isActive = this.props.isActive
        }
        let {data = [], labels = {}} = this.props;
        if (this.state.data)
            data = this.state.data;

        if (!Array.isArray(data))
            data = [];

        const selectedIds = Object.values(selected);
        const hasSelected = selectedIds.length !== 0;
        const setActive = (e) => {
            stopPropagation(e);
            this.setState({isActive: true}, () => (scrollToValue && selectedIds.length > 0) && this.list.scrollTo(selectedIds[0]));
        };
        const toggle = (e) => {
            if (!this.state.isActive) {
                setActive(e);
            } else {
                stopPropagation(e);
                this.setState({isActive: false});
            }
        };

        const isInline = mode === MODE_INLINE || mode === MODE_INLINE_MULTIPLE || mode === MODE_MULTIPLE_MINI_INLINE;
        const filterValueTrimmed = filterValue.trim();
        const dataFiltered = allowCustom ? [filterValueTrimmed, ...data.filter(suggestion => suggestion !== filterValueTrimmed)] : data;

        const filterFunction = this.createFilter(prefilter, filterValue, filterValueTrimmed.toLowerCase(), filter)
        let filteredList = <FilteredList className={classNames(isActive && 'visible', listPortal && 'portal')}
                                         style={listStyles}
                                         ref={ref('list', this)}
                                         filter={filterFunction}
                                         selectSingle={!allowCustom}
                                         scroll={scroll}
                                         inline={isInline}
                                         nextProvider={ref('next', this)}
                                         prevProvider={ref('prev', this)}
                                         selectedProvider={ref('getSelected', this)}
                                         resetProvider={ref('reset', this)}
                                         onSelect={this.onSelect}
                                         selected={selected}
                                         childComponent={childComponent}
                                         childProps={childProps}
                                         data={dataFiltered}
                                         labels={labels}
        />;
        filteredList = listPortal ? ReactDOM.createPortal(filteredList, listPortal) : filteredList

        return (
            <div id={id}
                 className={classNames(
                     'AutocompleteSelect',
                     mode,
                     isMultipleSelect(mode) && 'multi',
                     className,
                     withFilter ? 'withFilter' : 'withoutFilter',
                     isActive && 'active',
                     errored && 'errored',
                     inlineSelected && 'inlineSelected',
                     hasSelected && 'hasSelected',
                 )}
                 ref={ref('el', this)}>
                {label && <label className={classNames(`label`, (hasSelected || filterValue) && 'active', hasSelected && 'hasSelected')}
                                 htmlFor={'f-' + id}
                                 onClick={() => {
                                     if (mode === MODE_MULTIPLE_MINI_INLINE || !isActive) {
                                         toggle();
                                     }
                                 }}
                >
                    {label}
                    {required && ' *'}
                    {withArrow && <span className="arrow"/>}
                </label>}

                {(!isActive || mode === MODE_MULTIPLE || mode === MODE_INLINE_MULTIPLE || mode === MODE_MULTIPLE_MINI_INLINE || mode === MODE_MULTIPLE_AUTO || !withFilter) && !inlineSelected && hasSelected && (
                    <div
                        className={classNames('selected',
                            !label && 'nolabel',
                            (mode === MODE_MULTIPLE_MINI || mode === MODE_MINI || mode === MODE_MULTIPLE_MINI_INLINE) && 'clickable',
                            selectedMode)}
                        onClick={toggle}>

                        {selectedMode === 'full' && selectedIds.map(id =>
                            <div className="value" key={id}>
                                {React.createElement(selectedComponent, {...childProps, id, label: getLabel(labels, id), onClick: setActive})}
                                <div className="button remove" onClick={e => {
                                    stopPropagation(e);
                                    this.remove(id);
                                }}>
                                    {removeIcon}
                                </div>
                            </div>
                        )}
                        {selectedMode === 'inline' && selectedIds.map(id =>
                            <React.Fragment key={id}>
                                {React.createElement(selectedComponent, {...childProps, id, label: getLabel(labels, id), onClick: setActive})}
                                {id !== selectedIds[selectedIds.length - 1] && ', '}
                            </React.Fragment>
                        )}
                        {!label && withArrow && <span className="arrow"/>}
                        {withReset && <Button className="reset" raised={false} onClick={this.clean}>
                            {removeIcon}
                        </Button>}
                    </div>
                )}

                {inlineSelected && hasSelected && <>
                    {selectedMode === 'full' && selectedIds.map(id =>
                        <div className="value" key={id}>
                            {React.createElement(selectedComponent, {...childProps, id, label: getLabel(labels, id), onClick: setActive})}
                            <div className="button remove" onClick={e => {
                                stopPropagation(e);
                                this.remove(id);
                            }}>
                                {removeIcon}
                            </div>
                        </div>
                    )}
                    {selectedMode === 'inline' && selectedIds.map(id =>
                        <React.Fragment key={id}>
                            {React.createElement(selectedComponent, {...childProps, id, label: getLabel(labels, id), onClick: setActive})}
                            {id !== selectedIds[selectedIds.length - 1] && ', '}
                        </React.Fragment>
                    )}
                </>}

                {(isActive || (!hasSelected && mode !== MODE_MULTIPLE_MINI_INLINE) || mode === MODE_MULTIPLE || (mode === MODE_MULTIPLE_AUTO && selectedIds.length > 1) || mode === MODE_INLINE_MULTIPLE) && (
                    <div className={`input`} data-value={filterValue}>
                        {withFilter && <TextField autoComplete="new-password" id={'f-' + id}
                                                  ref={ref('input', this)}
                                                  focused={isActive}
                                                  value={filterValue}
                                                  label={inputLabel}
                                                  onChange={this.onChange}
                                                  onFocus={e => this.setState({isActive: true})}
                                                  check={this.props.filterCheck}
                                                  onKeyDown={e => {
                                                      const keyCode = e.keyCode;
                                                      if (keyCode === 38/*up*/) {
                                                          preventDefault(e);
                                                          this.prev();
                                                      } else if (keyCode === 40/*down*/) {
                                                          preventDefault(e);
                                                          this.next();
                                                      } else if (keyCode === 13/*enter*/) {
                                                          preventDefault(e);
                                                          this.onSelect(this.getSelected())
                                                      } else if (keyCode === 9/*tab*/) {
                                                          this.onSelect(this.getSelected())
                                                      } else if (keyCode === 8/*backspace*/) {
                                                          if (!filterValue && (selectedIds.length !== 0) && isMultipleSelect(mode)) {
                                                              this.remove(selectedIds[selectedIds.length - 1]);
                                                          }
                                                          this.reset()
                                                      } else if (keyCode === 46/*delete*/) {
                                                          this.reset()
                                                      } else if (keyCode === 27/*esc*/) {
                                                          this.setState({
                                                              isActive: false,
                                                              filterValue: isMultipleSelect(mode) ? '' : (allowCustom ? filterValue : ''),
                                                          });
                                                          this.input.getInput().blur()
                                                          this.onCancel();
                                                      }
                                                      // console.log('key pressed:', e.keyCode)
                                                  }}
                        />}
                        {!withFilter && inputLabel && <label>{inputLabel}</label>}
                    </div>
                )}

                {filteredList}
            </div>
        )
    }

    onClickOutside = () => {
        const {allowCustom, required} = this.props;
        const {filterValue} = this.state;
        if (allowCustom && (!!filterValue || !required)) {
            this.onSelect()
        }

        this.setState({isActive: false});

        this.onCancel();
    };

    onCancel = () => {
        orNoop(this.props.onCancel)()
    };

    onSelect = (selectedId) => {
        const {mode, required, allowCustom, onSelect, onChange, default: defaultValue} = this.props;
        const {filterValue, selected: currentSelection} = this.state;
        const {labels = {}, onFilterInputChange} = this.props;

        if (selectedId == null && (!!filterValue || !required) && allowCustom && (!this.input || !this.input.check()))
            selectedId = filterValue.trim();

        const isMultiSelect = isMultipleSelect(mode);

        if (!selectedId && isMultiSelect) {
            selectedId = null;
        }

        // debugger

        const isSelected = selectedId != null;

        let selected = {...currentSelection};
        if (selected[selectedId] && (defaultValue || isMultiSelect)) {
            delete selected[selectedId];
            if (defaultValue && Object.keys(selected).length === 0)
                selected[defaultValue] = defaultValue;
        } else if (isSelected && (isMultiSelect)) {
            selected[selectedId] = selectedId;
        } else if (isSelected) {
            selected = {[selectedId]: selectedId};
        }

        const errored = required && Object.keys(selected) === 0;

        const isActive = mode === MODE_MULTIPLE_MINI_INLINE || (isMultiSelect && isSelected)

        let customValue = '';
        if (allowCustom && selectedId) {
            let label
            if (isFunction(labels))
                label = labels(selectedId)
            else
                label = labels[selectedId]

            if (label && isString(label))
                customValue = label
        }

        let filterValueWithCustom = isMultiSelect ? '' : customValue;
        this.setState({
            isActive: isActive,
            selected: selected,
            filterValue: filterValueWithCustom,
            errored,
        });

        if (filterValueWithCustom !== filterValue)
            orNoop(onFilterInputChange)(filterValueWithCustom)

        if (isActive && this.input)
            this.input.getInput().focus()

        orNoop(onSelect)(selectedId);
        orNoop(onChange)(Object.values(selected));
    };

    clean = (e) => {
        preventDefault(e);
        stopPropagation(e);

        this.setState({
            isActive: false,
            selected: {},
            filterValue: '',
        });

        orNoop(this.props.onSelect)(null);
        orNoop(this.props.onChange)([]);

        this.initSelected(this.props, this.state);
    };

    remove = (id) => {
        let result = {
            ...this.state,
            selected: {...this.state.selected},
            filterValue: '',
        };
        delete result.selected[id];
        this.setState(result);
        orNoop(this.props.onChange)(Object.values(result.selected));
    };

    onChange = (event) => {
        const value = event.target.value;
        this.setState({filterValue: value});
        this.props.onFilterInputChange?.(value);
    }
}

export default AutocompleteSelect;
