import React from 'react';
import ReactCreateElement from '../ReactCreateElement';
import PropTypes from 'prop-types';
import './HistoryTools'
import Route from "./Route";
import Link from "./Link";
import {classNames} from "../Tools";

const NavLink = ({children, href, highlightPath, className, activeClassName}) =>
    <Route path={highlightPath || href}
           controller={matches => <Link href={href} className={classNames(className, matches && activeClassName)}>
               {children}
           </Link>}
    />;

NavLink.propTypes = Link.propTypes;

export default NavLink;