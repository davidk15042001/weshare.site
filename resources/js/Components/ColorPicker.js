import React, { useEffect, useState } from 'react';
import { SketchPicker, ChromePicker } from 'react-color';
import tinycolor from 'tinycolor2';
import rgbHex from "rgb-hex";

export default function ColorPicker({color, onHandleChange, type}) {
    const [newColor, setNewColor] = useState(color || '#df2351');
    const [showPicker, setShowPicker] = useState(false);

    const togglePicker = () => {
        setShowPicker(!showPicker);
    }

    const onChangeColor = (c) => {
        if (c.rgb.a === 0) {
            return setNewColor('TRANSPARENT');
        }
        setNewColor("#" + rgbHex(c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a));
    }

    const onChangeComplete = (c) => {
        if (c.rgb.a === 0) {
            return onHandleChange('TRANSPARENT');
        }
        onHandleChange("#" + rgbHex(c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a));
    }

    const colorFunc = tinycolor(newColor);

    if(type === 'chromepicker') return <ChromePicker color={newColor} onChange={onChangeColor} onChangeComplete={onChangeComplete} />

    return (
        <div style={styles.container} className="w-75">
            <div onClick={togglePicker} className={`row m-0 bg-light rounded ${colorFunc.isLight() ? 'border' : ''}`} style={{height: '35px'}}>
                <div className="col-3 rounded-start" style={{backgroundColor: newColor}}></div>
                <div className="col-9 p-0 ps-2 fs-sm h-100 d-flex align-items-center">{newColor}</div>
            </div>
            {showPicker ? 
                (
                    <div style={styles.popover}>
                        <div style={styles.cover} onClick={togglePicker} />
                        <SketchPicker presetColors={['TRANSPARENT','#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF']} color={newColor} onChange={onChangeColor} onChangeComplete={onChangeComplete} />
                    </div>
                ) : null }
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
    },
    popover: {
        position: 'absolute',
        right: 0,
        zIndex: 99,
    },
    cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }
}