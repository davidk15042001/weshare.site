import React from 'react';

export default function Label({ forInput, value, className, style, children }) {
    return (
        <label htmlFor={forInput} className={`text-color font-size-normal ` + className} style={style}>
            {value ? value : children}
        </label>
    );
}
