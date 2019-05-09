import React from 'react';
import './Dropzone.css'
import {classNames, setOf} from "./Tools";

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
    e.preventDefault();
    e.stopPropagation();
    return false;
};

class Dropzone extends React.PureComponent {

    static defaultProps = {
        clickable: true,
        multiple: true,
        droppable: true,
    };

    state = {dragging: false};
    entries = [];

    render = () => {
        const {children, className, disabled, clickable, multiple, droppable, overlayLabel} = this.props;
        const {dragging} = this.state;

        return <div className={classNames('Dropzone', className, dragging && 'dragging')}
                    ref={it => this.el = it}
                    onDragLeave={!disabled && droppable && this.onDragLeave || null}
                    onDragOver={!disabled && droppable && this.onDragOver || null}
                    onDragEnter={!disabled && droppable && this.onDragEnter || null}
                    onDrop={!disabled && droppable && this.onDrop || null}
        >
            {overlayLabel && <div className="overlay">
                <div className={'drop'}>
                    {overlayLabel}
                </div>
            </div>}
            {!disabled && clickable && <input className={'file'} type="file" multiple={!!multiple} onChange={this.onDrop}/>}
            {children}
        </div>
    };

    onDrop = (e) => {
        const dt = e.dataTransfer;
        const files = toArray(dt && dt.files || e.target.files);
        this.props.onDrop(files);
        this.setState({dragging: false});
        this.entries = [];
        prevent(e);
    };
    onDragOver = (e) => {
        const dt = e.dataTransfer;
        if (ignore(dt)) return;

        dt && (dt.dropEffect = 'copy');
        !this.state.dragging && this.setState({dragging: true});
        prevent(e);
    };
    onDragEnter = (e) => {
        const dt = e.dataTransfer;
        if (ignore(dt)) return;
        if (this.entries.indexOf(e.target) === -1) {
            this.entries.push(e.target)
        }

        dt && (dt.dropEffect = 'copy');
        !this.state.dragging && this.setState({dragging: true});
        prevent(e);
    };
    onDragLeave = (e) => {
        this.entries = this.entries.filter(el => el !== e.target);

        if (this.entries.length === 0)
            this.setState({dragging: false});

        prevent(e)
    };
}

const ignoredTypes = setOf([
    'text',
    'Text',
    'text/plain',
]);

const ignore = dt => dt && (!dt.types[0] || ignoredTypes[dt.types[0]]);

export default Dropzone;