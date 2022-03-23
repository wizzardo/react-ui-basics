import React from 'react';
import PropTypes from "prop-types";
import ReactCreateElement from './ReactCreateElement';
import './Dropzone.css'
import {classNames, setOf, preventDefault, stopPropagation, UNDEFINED, createRef} from "./Tools";
import {propsGetter, PureComponent, render, stateGS} from "./ReactConstants";

const toArray = (o) => {
    if (o instanceof Array)
        return o;

    const l = [];
    for (let i = 0; i < o.length; i++) {
        l.push(o[i])
    }
    return l;
};

const prevent = (e) => {
    preventDefault(e);
    stopPropagation(e);
    return false;
};

const ignoredTypes = setOf([
    'text',
    'Text',
    'text/plain',
]);

const ignore = dt => dt && (!dt.types[0] || ignoredTypes[dt.types[0]]);

class Dropzone extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        let entries = [];

        const props = propsGetter(that);
        const isDragging = stateGS(that);

        const onDrop = (e) => {
            const dt = e.dataTransfer;
            const files = toArray(dt && dt.files || e.target.files);
            props().onDrop(files);
            isDragging(false);
            entries = [];
            prevent(e);
        };
        const onDragOver = (e) => {
            const dt = e.dataTransfer;
            if (ignore(dt)) return;

            dt && (dt.dropEffect = 'copy');
            !isDragging() && isDragging(true);
            prevent(e);
        };
        const onDragEnter = (e) => {
            const dt = e.dataTransfer;
            if (ignore(dt)) return;
            if (entries.indexOf(e.target) === -1) {
                entries.push(e.target)
            }

            dt && (dt.dropEffect = 'copy');
            !isDragging() && isDragging(true);
            prevent(e);
        };
        const onDragLeave = (e) => {
            entries = entries.filter(el => el !== e.target);

            if (entries.length === 0)
                isDragging(false);

            prevent(e)
        };

        const inputRef = createRef()

        that[render] = () => {
            const {children, className, disabled, clickable, multiple, droppable, overlayLabel, accept} = props();

            return <div className={classNames('Dropzone', className, isDragging() && 'dragging')}
                        onDragLeave={!disabled && droppable && onDragLeave || UNDEFINED}
                        onDragOver={!disabled && droppable && onDragOver || UNDEFINED}
                        onDragEnter={!disabled && droppable && onDragEnter || UNDEFINED}
                        onDrop={!disabled && droppable && onDrop || UNDEFINED}
            >
                {overlayLabel && <div className="overlay">
                    <div className={'drop'}>
                        {overlayLabel}
                    </div>
                </div>}
                {!disabled && clickable && <input className={'file'}
                                                  ref={inputRef}
                                                  type="file"
                                                  accept={accept}
                                                  multiple={!!multiple}
                                                  onClick={() => {
                                                      inputRef().value = '';
                                                  }}
                                                  onChange={onDrop}/>}
                {children}
            </div>
        }
    }
}

Dropzone.defaultProps = {
    clickable: true,
    multiple: true,
    droppable: true,
};

if (window.isNotProductionEnvironment) {
    Dropzone.propTypes = {
        className: PropTypes.string,
        overlayLabel: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        clickable: PropTypes.bool,
        droppable: PropTypes.bool,
        multiple: PropTypes.bool,
        disabled: PropTypes.bool,
        onDrop: PropTypes.func.isRequired,
        accept: PropTypes.string,
    };
}

export default Dropzone;