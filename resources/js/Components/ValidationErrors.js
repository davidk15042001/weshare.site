import React from 'react';
import {translate} from '@/Helpers';

export default function ValidationErrors({ errors }) {
    return (
        Object.keys(errors).length > 0 && (
            <div className="mb-4 bg-light p-2 pt-3 ps-3 rounded">
                <div
                    className="font-medium text-red-100"
                    style={{fontSize: '12px'}}>
                        {translate('Whoops! Something went wrong.')}
                </div>

                <ul className="mt-2 list-disc list-inside text-red-100" style={{fontSize: '12px'}}>
                    {Object.keys(errors).map(function (key, index) {
                        return <li key={index}>{translate(errors[key])}</li>;
                    })}
                </ul>
            </div>
        )
    );
}
