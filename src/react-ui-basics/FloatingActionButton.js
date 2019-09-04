import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import PropTypes from 'prop-types';
import './FloatingActionButton.css'
import Button from "./Button";
import {classNames} from "./Tools";
import MaterialIcon from "./MaterialIcon";

const FloatingActionButton = ({icon, onClick, mini, className, hidden}) => {
    return <Button onClick={onClick} round={true} className={classNames("FloatingActionButton", className, mini && 'mini', hidden && 'hidden')}>
        <MaterialIcon icon={icon}/>
    </Button>;
};

if (window.isNotProductionEnvironment) {
    FloatingActionButton.propTypes = {
        icon: MaterialIcon.propTypes.icon,
        mini: PropTypes.bool,
        hidden: PropTypes.bool,
    };
}

FloatingActionButton.defaultProps = {
    icon: 'add',
    mini: false,
    hidden: false,
};

export default FloatingActionButton;