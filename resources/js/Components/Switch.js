import React from 'react';

export default function Switch({className, switchClass, label, name, checked, onHandleChange}) {
    return (
        <div className={`d-flex align-items-center ${className}`}>
            <div className={`form-check form-switch ${switchClass}`}>
                <input className="form-check-input" type="checkbox" name={name} role="switch" checked={checked} onChange={onHandleChange} />
            </div>
            <span>{label}</span>
        </div>
    );
}