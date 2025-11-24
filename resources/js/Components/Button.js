import React from 'react';
import IconButton from './IconButton';
import { translate } from '@/Helpers';

export default function Button({
    type = 'submit',
    onClick,
    backgroundColor,
    textColor = "#fff",
    padding = 8,
    style,
    className = '',
    icon,
    processing,
    disabled,
    dataToggle,
    dataTarget,
    dataDismiss,
    children
}) {

    const styles = {
        fontSize: 12,
        padding: `${padding}px`,
        backgroundColor,
        borderColor: backgroundColor,
        ...style,
    }

    return (
        <button
            data-bs-toggle={dataToggle}
            data-bs-target={dataTarget}
            data-bs-dismiss={dataDismiss}
            type={type}
            className={`d-flex align-items-center justify-content-center ${className}`}
            disabled={processing || disabled}
            style={typeof textColor !== 'undefined' ? {
                ...styles,
                color: textColor
            } : styles}
            onClick={onClick}
        >
            {processing ? (
                translate('Loading...')
            ) : (
                <>
                    {typeof icon !== 'undefined' && <IconButton className='me-2' width={15} height={15} icon={icon} />}
                    {children}
                </>
            )}
        </button>
    );
}
