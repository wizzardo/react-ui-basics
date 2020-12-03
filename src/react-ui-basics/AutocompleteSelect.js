import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import PropTypes from 'prop-types';
import './AutocompleteSelect.css'
import TextField from "./TextField";
import FilteredList from "./FilteredList";
import {classNames, continuousIncludes, getRandomId, ref, orNoop, preventDefault, stopPropagation, DOCUMENT, addEventListener, removeEventListener} from "./Tools";
import Button from "./Button";
import MaterialIcon from "./MaterialIcon";

export const MODE_DEFAULT = 'default';
export const MODE_INLINE = 'inline';
export const MODE_INLINE_MULTIPLE = 'inline-multiple';
export const MODE_MULTIPLE_AUTO = 'multiple-auto';
export const MODE_MULTIPLE = 'multiple';
export const MODE_MULTIPLE_MINI = 'multiple-mini';
export const MODE_MINI = 'mini';
export const MODE_MULTIPLE_MINI_INLINE = 'multiple-mini-inline';


const DummyChild = ({id, label, dataConsumer}) => {
    orNoop(dataConsumer)(label || id);
    return <div className={`DummyChild`}>{label || id}</div>
};

const prepareSelected = (value) => {
    let result;
    if (value != null) {
        if (Array.isArray(value))
            result = value.reduce((map, obj) => {
                map[obj] = obj;
                return map;
            }, {});
        else if (typeof value === 'object')
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

class AutocompleteSelect extends React.Component {

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
        if (data && typeof data === "function") {
            data(data => that.setState({data}));
        }

        getSelected && getSelected(() => Object.values(that.state.selected));
    }

    componentDidMount() {
        addEventListener(DOCUMENT, 'mousedown', this.listener = (e) => {
            if (this.state.isActive && this.el && !this.el.contains(e.target)) {
                this.setState({isActive: false});
                this.onCancel();
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
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value !== prevProps.value)
            this.initSelected(this.props)
    }

    initSelected = ({value}) => {
        this.setState({selected: prepareSelected(value)});
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
    };

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
        } = this.props;
        const id = this.props.id || this.randomId;
        const selectedComponent = this.props.selectedComponent || childComponent;
        const {isActive, selected = {}, filterValue = '', errored} = this.state;
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

        const list = <FilteredList className={classNames(isActive && 'visible')}
                                   ref={ref('list', this)}
                                   filter={it => {
                                       if (!it) return false;
                                       if (prefilter && !prefilter(it)) return false;
                                       if (!filterValue) return true;

                                       const f = filterValue.toLowerCase();
                                       if (filter) return filter(it, f);

                                       let value = (typeof it === 'string' ? it : it.name).toLowerCase();
                                       return continuousIncludes(value, f);
                                   }}
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
                                   data={data}
                                   labels={labels}
        />;

        return (
            <div className={classNames('AutocompleteSelect', mode, className, withFilter ? 'withFilter' : 'withoutFilter', isActive && 'active', errored && 'errored')}
                 ref={ref('el', this)}>
                {label && <label className={classNames(`label`, (hasSelected || filterValue) && 'active', hasSelected && 'hasSelected')}
                                 htmlFor={'f-' + id}
                                 onClick={() => mode === MODE_MULTIPLE_MINI_INLINE && toggle()}
                >
                    {label}
                    {required && '*'}
                    {withArrow && <span className="arrow"/>}
                </label>}

                {(!isActive || mode === MODE_MULTIPLE || mode === MODE_INLINE_MULTIPLE || mode === MODE_MULTIPLE_MINI_INLINE || mode === MODE_MULTIPLE_AUTO || !withFilter) && hasSelected && (
                    <div
                        className={classNames('selected',
                            !label && 'nolabel',
                            (mode === MODE_MULTIPLE_MINI || mode === MODE_MINI || mode === MODE_MULTIPLE_MINI_INLINE) && 'clickable',
                            selectedMode)}
                        onClick={toggle}>

                        {selectedMode === 'full' && selectedIds.map(id =>
                            <div className="value" key={id}>
                                {React.createElement(selectedComponent, {...childProps, id, label: labels[id], onClick: setActive})}
                                <div className="button remove" onClick={e => {
                                    stopPropagation(e);
                                    this.remove(id);
                                }}>
                                    <MaterialIcon icon="close"/>
                                </div>
                            </div>
                        )}
                        {selectedMode === 'inline' && selectedIds.map(id =>
                            <React.Fragment key={id}>
                                {React.createElement(selectedComponent, {...childProps, id, label: labels[id], onClick: setActive})}
                                {id !== selectedIds[selectedIds.length - 1] && ', '}
                            </React.Fragment>
                        )}
                        {!label && withArrow && <span className="arrow"/>}
                        {withReset && <Button className="reset" raised={false} onClick={this.clean}>
                            <MaterialIcon icon="close"/>
                        </Button>}
                    </div>
                )}
                {(isActive || (!hasSelected && mode !== MODE_MULTIPLE_MINI_INLINE) || mode === MODE_MULTIPLE || (mode === MODE_MULTIPLE_AUTO && selectedIds.length > 1) || mode === MODE_INLINE_MULTIPLE) && (
                    <div className={`input`}>
                        {withFilter && <TextField autoComplete="off" id={'f-' + id}
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
                                                      } else if (keyCode === 8/*backspace*/ || keyCode === 46/*delete*/) {
                                                          this.reset()
                                                      } else if (keyCode === 27/*esc*/) {
                                                          this.setState({isActive: false, filterValue: ''});
                                                          this.onCancel();
                                                      }
                                                      // console.log('key pressed:', e.keyCode)
                                                  }}
                        />}
                        {!withFilter && inputLabel && <label>{inputLabel}</label>}
                        {(mode === MODE_MULTIPLE_MINI_INLINE || mode === MODE_MULTIPLE || mode === MODE_MULTIPLE_AUTO || mode === MODE_INLINE_MULTIPLE) && list}
                    </div>
                )}
                {!(mode === MODE_MULTIPLE_MINI_INLINE || mode === MODE_MULTIPLE || mode === MODE_MULTIPLE_AUTO || mode === MODE_INLINE_MULTIPLE) && list}
            </div>
        )
    }

    onCancel = () => {
        orNoop(this.props.onCancel)()
    };

    onSelect = (selectedId) => {
        if (selectedId == null && this.props.allowCustom && this.input.check())
            selectedId = this.state.filterValue;

        const isSelected = selectedId != null;
        const isMultipleSelect = this.props.mode === MODE_MULTIPLE || this.props.mode === MODE_MULTIPLE_AUTO || this.props.mode === MODE_INLINE_MULTIPLE || this.props.mode === MODE_MULTIPLE_MINI || this.props.mode === MODE_MULTIPLE_MINI_INLINE;

        let selected = {...this.state.selected};
        if (this.state.selected[selectedId] && (this.props.default || isMultipleSelect)) {
            delete selected[selectedId];
            if (this.props.default && Object.keys(selected).length === 0)
                selected[this.props.default] = this.props.default;
        } else if (isSelected && (isMultipleSelect)) {
            selected[selectedId] = selectedId;
        } else if (isSelected) {
            selected = {[selectedId]: selectedId};
        }

        const errored = this.props.required && Object.keys(selected) === 0;

        if (this.props.mode === MODE_MULTIPLE_MINI_INLINE) {
            this.setState({
                isActive: true,
                selected: selected,
                filterValue: isSelected ? '' : this.state.filter,
                errored,
            });

        } else {
            this.setState({
                isActive: !isSelected,
                selected: selected,
                filterValue: isSelected ? '' : this.state.filter,
                errored,
            });
        }

        orNoop(this.props.onSelect)(selectedId);
        orNoop(this.props.onChange)(Object.values(selected));
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

        this.initSelected(this.props);
    };

    remove = (id) => {
        let result = {
            ...this.state,
            selected: {...this.state.selected}
        };
        delete result.selected[id];
        this.setState(result);
        orNoop(this.props.onChange)(Object.values(result.selected));
    };

    onChange = (event) => {
        const value = event.target.value;
        this.setState({filterValue: value});
    }
}

export default AutocompleteSelect;
