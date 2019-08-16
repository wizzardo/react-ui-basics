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

const FormUploadProgress = ({
                                value,
                                cancel,
                                loaded,
                                total,
                                processingLabel,
                                cancelLabel,
                            }) => {

    const abbreviation = formatAbbreviation(total);
    return (
        <Animated value={value > 0}>
            <div className="FormUploadProgress">
                <div className="wrapper">
                    <div className="progress">
                        {loaded === total && <SpinningProgress/>}
                        {loaded !== total && <CircleProgress value={value}/>}
                        {total == null && <div className={'value'}>{Math.floor(Number.isFinite(value) ? value : 0)}%</div>}
                        {total != null && <div className={'value'}>
                            {formatNumberWithMaxLength(loaded, 1, abbreviation, 4)}
                            /
                            {formatNumberWithMaxLength(total, 1, abbreviation, 4)}
                            <br/>
                            {abbreviation}
                        </div>}
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
};

if (window.isNotProductionEnvironment) {
    FormUploadProgress.propTypes = {
        value: PropTypes.number,
        loaded: PropTypes.number,
        total: PropTypes.number,
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
