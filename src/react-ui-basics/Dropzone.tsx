import React, {ReactElement, ReactNode} from 'react';
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

export interface DropzoneProps {
    onDrop: (files: File[]) => void,
    className?: string,
    overlayLabel?: string | ReactElement,
    clickable?: boolean,
    droppable?: boolean,
    multiple?: boolean,
    disabled?: boolean,
    accept?: string,
    children?: ReactNode
}

class Dropzone extends PureComponent<DropzoneProps> {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        let entries = [];

        const props = propsGetter(that);
        const isDragging = stateGS<boolean>(that);

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

        const inputRef = createRef<HTMLInputElement>()

        that[render] = () => {
            const {
                children,
                className,
                disabled,
                clickable = true,
                multiple = true,
                droppable = true,
                overlayLabel,
                accept
            } = props();

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

export default Dropzone;