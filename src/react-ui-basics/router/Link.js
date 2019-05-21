import React from 'react';
import PropTypes from 'prop-types';
import './HistoryTools'
import {pushLocation} from "./HistoryTools";
import {preventDefault} from "../Tools";

const Link = ({children, href, className}) =>
    <a href={href} className={className} onClick={(e) => {
        if (e.ctrlKey)
            return;

        preventDefault(e);
        pushLocation(href)
    }}>{children}</a>;

Link.propTypes = {
    href: PropTypes.string.isRequired,
};

export default Link;