import React from 'react';

export default function Accordion({className, headerClassName, headerBackground, headerTextColor, headerTextSize, show, icon, id, title, titleComponent, children}) {
    return(
        <div className={`accordion ${className}`}>
            <div className="accordion-item border-0 m-0 p-0">
                <h2 className={`accordion-header ${headerClassName}`} id={id}>
                    <div className={`accordion-button ${headerClassName}`} data-bs-toggle="collapse" data-bs-target={`#collapse${id}`} aria-expanded={show ? 'true' : 'false'} aria-controls={`collapse${id}`}>
                        {typeof icon !== 'undefined' && icon !== '' && <img className="me-2" src={icon} />}{' '}
                        {typeof titleComponent !== 'undefined' ? titleComponent() : title}
                    </div>
                </h2>
                <div id={`collapse${id}`} className={`accordion-collapse collapse show`} aria-labelledby={id}>
                    <div className="accordion-body p-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}