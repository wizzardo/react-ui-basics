import React from 'react';
import PropTypes from "prop-types";
import './CircleProgress.css'

const radius = 8.75;
const length = 2 * Math.PI * radius;

const dashoffset = (percent) => length * (100 - percent) / 100;

const CircleProgress = ({value}) => (
    <div className="CircleProgress">
        <svg viewBox="0 0 24 24">
            <path className="line" style={{strokeDashoffset: dashoffset(Number.isFinite(value) ? value : 0), strokeDasharray: length}}
                  d="M12 3.25A8.75 8.75 0 1 1 3.25 12 A 8.75,8.75 0 0 1 12,3.25"/>
        </svg>
    </div>
);

CircleProgress.defaultProps = {
    value: 0,
};
CircleProgress.propTypes = {
    value: PropTypes.number,
};

export default CircleProgress;