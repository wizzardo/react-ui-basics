import React from 'react';
import ReactCreateElement from '../ReactCreateElement';
import './HistoryTools'
import Route from "./Route";
import Link, {LinkProps} from "./Link";
import {classNames} from "../Tools";


export interface NavLinkProps extends LinkProps {
    activeClassName: string
    highlightPath?: string
}

const NavLink: React.FC<NavLinkProps> = ({children, href, highlightPath, className, activeClassName, ...other}: NavLinkProps) =>
    <Route path={highlightPath || href}
           controller={matches => <Link href={href} className={classNames(className, matches && activeClassName)} {...other}>
               {children}
           </Link>}
    />;

export default NavLink;