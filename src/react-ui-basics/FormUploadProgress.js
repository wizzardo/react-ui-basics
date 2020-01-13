import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './FormUploadProgress.css'
import Button from "./Button";
import Animated from "./Animated";
import CircleProgress from "./CircleProgress";
import SpinningProgress from "./SpinningProgress";
import {formatAbbreviation, formatNumberWithMaxLength} from "./Size";
import PropTypes from "prop-types";
import {preventDefault} from "./Tools";


const defaultValueFormat = (value, loaded, total) => {
    if (total == null)
        return Math.floor(Number.isFinite(value) ? value : 0) + '%';

    const abbreviation = formatAbbreviation(total);
    return <>
        {formatNumberWithMaxLength(loaded, 1, abbreviation, 4)}
        /
        {formatNumberWithMaxLength(total, 1, abbreviation, 4)}
        <br/>
        {abbreviation}
    </>
};

const FormUploadProgress = ({
                                value,
                                cancel,
                                loaded,
                                total,
                                formatValue,
                                processingLabel,
                                cancelLabel,
                            }) => {
    return (
        <Animated value={total > 0}>
            <div className="FormUploadProgress">
                <div className="wrapper">
                    <div className="progress">
                        {loaded === total && <SpinningProgress/>}
                        {loaded !== total && <CircleProgress value={value}/>}
                        <div className={'value'}>{formatValue(value, loaded, total)}</div>
                    </div>
                    {cancel && <Button className={"cancel"} disabled={loaded === total} onClick={e => {
                        preventDefault(e);
                        cancel();
                    }}>
                        {loaded === total && processingLabel}
                        {loaded !== total && cancelLabel}
                    </Button>}
                </div>
            </div>
        </Animated>
    );
};

FormUploadProgress.defaultProps = {
    value: 0,
    formatValue: defaultValueFormat,
};

if (window.isNotProductionEnvironment) {
    FormUploadProgress.propTypes = {
        value: PropTypes.number,
        loaded: PropTypes.number,
        total: PropTypes.number,
        formatValue: PropTypes.func,
        processingLabel: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        cancelLabel: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        cancel: PropTypes.func,
    };
}

export default FormUploadProgress;
