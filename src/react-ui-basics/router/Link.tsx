import React from 'react';
import './HistoryTools'
import {pushLocation} from "./HistoryTools";
import {preventDefault} from "../Tools";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    className?: string
}

const Link: React.FC<LinkProps> = (props) => {
    return <a {...props} onClick={(e) => {
        if (!e.ctrlKey) {
            preventDefault(e);
            pushLocation(props.href);
        }
    }}/>;
};

export default Link;