import React from 'react';
import ReactCreateElement from '../ReactCreateElement';
import PropTypes from 'prop-types';
import './HistoryTools'
import {pushLocation} from "./HistoryTools";
import {preventDefault} from "../Tools";

const Link = ({children, href, className}) =>
    <a href={href} className={className} onClick={(e) => {
        if (!e.ctrlKey) {
            preventDefault(e);
            pushLocation(href);
        }
    }}>{children}</a>;

if (window.isNotProductionEnvironment) {
    Link.propTypes = {
        href: PropTypes.string.isRequired,
    };
}

export default Link;