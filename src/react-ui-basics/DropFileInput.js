import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './DropFileInput.css'
import Dropzone from "./Dropzone";
import PropTypes from "prop-types";
import {classNames} from "./Tools";
import MaterialIcon from "./MaterialIcon";

const DropFileInput = ({icon, label, onDrop, droppable}) => (
    <section className="DropFileInput">
        <Dropzone droppable={droppable} onDrop={onDrop}>
            <MaterialIcon className={classNames(`icon`, label && 'withText')} icon={icon}/>
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
        icon: MaterialIcon.propTypes.icon,
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        droppable: PropTypes.bool,
        onDrop: PropTypes.func,
    };
}


export default DropFileInput;
