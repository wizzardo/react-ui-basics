import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './DropFileInput.css'
import Dropzone from "./Dropzone";
import PropTypes from "prop-types";
import {classNames} from "./Tools";

const DropFileInput = ({icon, label, onDrop, droppable}) => (
    <section className="DropFileInput">
        <Dropzone droppable={droppable} onDrop={onDrop}>
            <i className={classNames(`material-icons icon`, label && 'withText')}>{icon}</i>
            {label && <div>{label}</div>}
        </Dropzone>
    </section>
);

DropFileInput.defaultProps = {
    icon: 'cloud_upload',
    droppable: false,
};

if (window.isNotProductionEnvironment) {
    DropFileInput.propTypes = {
        icon: PropTypes.string,
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        droppable: PropTypes.bool,
        onDrop: PropTypes.func,
    };
}


export default DropFileInput;
