import React, {DragEventHandler, ReactElement} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './DropFileInput.css'
import Dropzone from "./Dropzone";
import {classNames} from "./Tools";
import MaterialIcon, {MaterialIconType} from "./MaterialIcon";

export interface DropFileInputProps {
    icon?: MaterialIconType,
    label?: string | ReactElement,
    droppable?: boolean,
    onDrop?: DragEventHandler,
    multiple?: boolean,
    accept?: string,
}

const DropFileInput = ({icon, label, onDrop, droppable, multiple, accept}: DropFileInputProps) => (
    <section className="DropFileInput">
        <Dropzone droppable={droppable} onDrop={onDrop} accept={accept} multiple={multiple}>
            <MaterialIcon className={classNames(`icon`, label && 'withText')} icon={icon}/>
            {label && <div>{label}</div>}
        </Dropzone>
    </section>
);

DropFileInput.defaultProps = {
    icon: 'cloud_upload',
    droppable: false,
    multiple: true,
};

export default DropFileInput;
