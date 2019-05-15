import React from 'react';
import PropTypes from 'prop-types';
import './FloatingActionButton.css'
import Button from "./Button";
import {classNames} from "./Tools";

const FloatingActionButton = ({icon, onClick, mini, className, hidden}) => {
    return <Button onClick={onClick} round={true} className={classNames("FloatingActionButton", className, mini && 'mini', hidden && 'hidden')}>
        <i className="material-icons">{icon}</i>
    </Button>;
};

FloatingActionButton.propTypes = {
    icon: PropTypes.string,
    mini: PropTypes.bool,
    hidden: PropTypes.bool,
};

FloatingActionButton.defaultProps = {
    icon: 'add',
    mini: false,
    hidden: false,
};

export default FloatingActionButton;