import React from 'react';
import ReactCreateElement from '../ReactCreateElement';
import './HistoryTools'
import {pushLocation} from "./HistoryTools";
import {preventDefault} from "../Tools";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    className?: string
}

const Link: React.FC<LinkProps> = ({children, href, className, ...other}) => {
    return <a href={href} className={className} {...other} onClick={(e) => {
        if (!e.ctrlKey) {
            preventDefault(e);
            pushLocation(href);
        }
    }}>{children}</a>;
};

export default Link;