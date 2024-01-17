import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import {isUndefined} from "./Tools";

export type ToAbbreviationType = 'B' | 'KB' | 'MB' | 'GB';

const formatNumber = (size: number, fractionalLength: number, toAbbreviation?: ToAbbreviationType) => {
    if (size < 1000 && !toAbbreviation || toAbbreviation === 'B')
        return size + '';
    size /= 1024;
    if (size < 1000 && !toAbbreviation || toAbbreviation === 'KB')
        return size.toFixed(fractionalLength);
    size /= 1024;
    if (size < 1000 && !toAbbreviation || toAbbreviation === 'MB')
        return size.toFixed(fractionalLength);
    size /= 1024;
    return size.toFixed(fractionalLength);
};

export const formatNumberWithMaxLength = (size: number, fractionalLength: number, toAbbreviation?: ToAbbreviationType, maxLength?: number) => {
    let result;
    if (isUndefined(fractionalLength))
        fractionalLength = 1;
    if (isUndefined(maxLength))
        maxLength = -1;

    do {
        result = formatNumber(size, fractionalLength, toAbbreviation);
        fractionalLength--;
    } while (maxLength !== -1 && fractionalLength >= 0 && result.length > maxLength);
    return result;
};

export const formatAbbreviation = (size: number) => {
    if (size < 1000)
        return 'B';
    size /= 1024;
    if (size < 1000)
        return 'KB';
    size /= 1024;
    if (size < 1000)
        return 'MB';
    size /= 1024;
    return 'GB';
};

const Size = ({value}: { value: number }) => (
    <span className="Size">
        {formatNumber(value, 1)}&nbsp;{formatAbbreviation(value)}
    </span>
);

export default Size