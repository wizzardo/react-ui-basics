import React from 'react';
import './HistoryTools'
import Route from "./Route";
import Link, {LinkProps} from "./Link";
import {classNames} from "../Tools";


export interface NavLinkProps extends LinkProps {
    activeClassName: string
    highlightPath?: string
}

const NavLink: React.FC<NavLinkProps> = (props) => {
    const {href, highlightPath, className, activeClassName} = props;
    const other = {...props}
    delete other.activeClassName
    delete other.highlightPath

    return <Route
        path={highlightPath || href}
        controller={matches => <Link {...props} className={classNames(className, matches && activeClassName)}/>}
    />;
};

export default NavLink;