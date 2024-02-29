import React, {ReactNode} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './FormUploadProgress.css'
import Button from "./Button";
import Animated from "./Animated";
import CircleProgress from "./CircleProgress";
import SpinningProgress from "./SpinningProgress";
import {formatAbbreviation, formatNumberWithMaxLength} from "./Size";
import {preventDefault} from "./Tools";


const defaultValueFormat = (value: number, loaded: number, total: number) => {
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

export interface FormUploadProgressProps {
    value: number
    loaded: number
    total: number
    formatValue?: (value: number, loaded: number, total: number) => ReactNode
    processingLabel?: ReactNode
    cancelLabel?: ReactNode
    cancel?: () => void
}

const FormUploadProgress = ({
                                value,
                                cancel,
                                loaded,
                                total,
                                formatValue,
                                processingLabel,
                                cancelLabel,
                            }: FormUploadProgressProps) => {
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

export default FormUploadProgress;
