import React, {MouseEventHandler} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './FloatingActionButton.css'
import Button from "./Button";
import {classNames} from "./Tools";
import MaterialIcon, {MaterialIconType} from "./MaterialIcon";

export interface FloatingActionButtonProps {
    icon?: MaterialIconType,
    mini?: boolean,
    hidden?: boolean,
    className?: string,
    onClick: MouseEventHandler
}

const FloatingActionButton = ({icon, onClick, mini, className, hidden}: FloatingActionButtonProps) => {
    return <Button onClick={onClick} round={true} className={classNames("FloatingActionButton", className, mini && 'mini', hidden && 'hidden')}>
        <MaterialIcon icon={icon}/>
    </Button>;
};

FloatingActionButton.defaultProps = {
    icon: 'add',
    mini: false,
    hidden: false,
};

export default FloatingActionButton;