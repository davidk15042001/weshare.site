import React from 'react';

export default function UpgradeToProOverlay({visible, title, zIndex, buttonPosition, dashboard}) {
    if(!visible) return null;

    return (
        <div className={`d-flex  ${dashboard ? 'pt-10 dashboard-overlay' : 'align-items-center'} justify-content-center pt-lg-0 overflow-none`} style={{   
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: zIndex || 9,
            backgroundColor: 'rgba(0, 0, 0, 0)'
        }}>
            <a
                href={route("subscriptions.index")}
                className={`btn btn-lg btn-danger fs-sm ${dashboard && 'my-10'} mt-lg-0`}
                style={{position: buttonPosition || 'none'}}
            >
                <i className="bi bi-stars me-2"></i>
                {title}
            </a>
        </div>
    )
}