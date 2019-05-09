import React from 'react';
import PropTypes from 'prop-types';
import './HistoryTools'
import {pushLocation} from "./HistoryTools";

const Link = ({children, href, className}) =>
    <a href={href} className={className} onClick={(e) => {
        e.preventDefault();
        pushLocation(href)
    }}>{children}</a>;

Link.propTypes = {
    href: PropTypes.string.isRequired,
};

export default Link;