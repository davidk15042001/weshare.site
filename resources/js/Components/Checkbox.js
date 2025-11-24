import React from 'react';

export default function Checkbox({ name, value, handleChange, checked }) {
    return (
        <input
            type="checkbox"
            name={name}
            value={value}
            className="rounded bg-dark"
            checked={checked}
            style={{
                background: '#000',
                border: '1px solid red',
                borderColor: 'red'
            }}
            onChange={(e) => handleChange(e)}
        />
    );
}
