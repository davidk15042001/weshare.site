import React, { useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

export default function Input({
    type = "text",
    name,
    multiline,
    rows,
    backgroundColor = "#FAFAFA",
    border = "#E6E6E6",
    textColor = "rgb(41, 45, 50, 0.75)",
    textShadow = "#fff",
    placeholder,
    value,
    className,
    autoComplete,
    required,
    error,
    isFocused,
    handleChange,
    style
}) {
    const inputRef = useRef();

    const [{ color, borderColor }, set] = useSpring(() => ({
        color: textColor,
        borderColor: border,
        config: { duration: 100 },
    }));

    const pos = multiline ? (rows ? "6%" : "12%") : "23%";

    const [{ y, fontSize }, setY] = useSpring(() => ({
        y: pos,
        fontSize: 12,
        config: { duration: 100 },
    }));

    function onFocused(e) {
        setY({ y: "-" + pos, fontSize: 11 });
        set({ color: textColor, borderColor: border });
    }

    function onClicked(e) {
        onFocused(e);
        inputRef.current.focus();
    }

    function onBlurred(e) {
        if (e.target.value.length > 0) {
            return;
        }
        setY({ y: pos, fontSize: 12 });
    }

    function onChanged(e) {
        setY({ y: "-" + pos, fontSize: 11 });
        set({ color: textColor, borderColor: border });
        handleChange(e);
    }

    useEffect(() => {
        if (value) onFocused();
    }, [value]);

    let containerStyle = { position: "relative" };
    if(typeof style !== 'undefined') {
        containerStyle = {...containerStyle, ...style};
    }

    return (
        <div
            style={containerStyle}
            className={`flex flex-col items-start ${className}`}
            onMouseEnter={() =>
                set({ color: "rgb(41, 45, 50, 1.0)", borderColor: "#292D32" })
            }
            onMouseLeave={() => set({ color: textColor, borderColor: border })}
        >
            <animated.div
                className="text-blue-100"
                style={{
                    top: y,
                    left: "13px",
                    fontSize,
                    background: "transparent",
                    position: "absolute",
                    textShadow: `-1px 0 ${textShadow}, 0 1px ${textShadow}, 1px 0 ${textShadow}, 0 -1px ${textShadow}`,
                    color,
                }}
                onClick={onClicked}
            >
                {placeholder}
            </animated.div>
            {multiline ? (
                <animated.textarea
                    name={name}
                    value={value || ""}
                    rows={rows}
                    className={`form-control fs-reg` + className}
                    style={{
                        background: backgroundColor,
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor,
                        fontSize: "13px",
                        outline: 0,
                        boxShadow: "none",
                    }}
                    onChange={onChanged}
                    onFocus={onFocused}
                    onBlur={onBlurred}
                ></animated.textarea>
            ) : (
                <animated.input
                    type={type}
                    name={name}
                    className={`form-control fs-reg ${className}`}
                    value={value || ""}
                    style={{
                        background: backgroundColor,
                        borderStyle: "solid",
                        borderWidth: "1px",
                        fontSize: "13px",
                        borderColor,
                        outline: 0,
                        boxShadow: "none",
                    }}
                    ref={inputRef}
                    autoComplete={autoComplete}
                    required={required}
                    onChange={onChanged}
                    onFocus={onFocused}
                    onBlur={onBlurred}
                />
            )}
        </div>
    );
}
