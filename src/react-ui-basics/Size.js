import React from 'react';

const Size = ({value}) => (
    <span className="Size">
        {formatNumber(value)}&nbsp;{formatAbbreviation(value)}
    </span>
);

export const formatNumberWithMaxLength = (size, fractionalLength = 1, toAbbreviation = null, maxLength = -1) => {
    let result;
    do {
        result = formatNumber(size, fractionalLength, toAbbreviation);
        fractionalLength--;
    } while (maxLength !== -1 && fractionalLength >= 0 && result.length > maxLength);
    return result;
};

const formatNumber = (size, fractionalLength = 1, toAbbreviation = null) => {
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

export const formatAbbreviation = (size) => {
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

export default Size