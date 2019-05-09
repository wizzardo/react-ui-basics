import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './HistoryTools'
import Route from "./Route";
import Link from "./Link";
import {classNames} from "../Tools";

class NavLink extends PureComponent {

    static propTypes = {
        href: PropTypes.string.isRequired,
    };

    render = () => {
        const {children, href, highlightPath, className, activeClassName} = this.props;
        const {match} = this.state || {};
        return <Link href={href} className={classNames(className, match && activeClassName)}>
            <Route onToggle={match => this.setState({match})} path={highlightPath || href}/>
            {children}
        </Link>;
    };
}

export default NavLink;