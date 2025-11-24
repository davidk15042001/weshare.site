import React from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

export default function IconButton({icon, label, width, height, onClick, className, dataBsToggle, dataBsTarget, tooltip}) {
    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible,
      } = usePopperTooltip();

    return (
        <div className={className} onClick={onClick}
            data-bs-toggle={dataBsToggle}
            data-bs-target={dataBsTarget}
            // data-bs-placement="bottom"
            // title={tooltip}
            style={{
                width: width,
                height: height,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <img ref={setTriggerRef} src={icon} style={{height: '100%', width: '100%', tintColor: 'red'}} />
            {typeof label !== 'undefined' && label !== '' && (<div className='ms-2 font-size-normal'>{label}</div>)}
            {visible && tooltip && (
                <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container py-1 px-2' })}>
                <div {...getArrowProps({ className: 'tooltip-arrow border-dark' })} />
                    <span className='fs-sm'>{tooltip}</span>
                </div>
            )}
        </div>
    );
}