import React from 'react';
import './SpinningProgress.css'

const SpinningProgress = () => (
    <div className="SpinningProgress">
        <svg className="circular" viewBox="0 0 24 24">
            <circle className="line" cx="12" cy="12" r="10" fill="none"/>
        </svg>
    </div>
);

export default SpinningProgress;