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
    onDrop?: (files: File[]) => void,
    multiple?: boolean,
    accept?: string,
}

const DropFileInput = ({icon = 'cloud_upload', label, onDrop, droppable = false, multiple = true, accept}: DropFileInputProps) => (
    <section className="DropFileInput">
        <Dropzone droppable={droppable} onDrop={onDrop} accept={accept} multiple={multiple}>
            <MaterialIcon className={classNames(`icon`, label && 'withText')} icon={icon}/>
            {label && <div>{label}</div>}
        </Dropzone>
    </section>
);

export default DropFileInput;
