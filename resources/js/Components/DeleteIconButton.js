import React from "react";

export default function DeleteIconButton({
    icon,
    label,
    width,
    height,
    onClick,
    className,
    cover_overlay,
}) {
    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                marginRight: "10px",
                width: width,
                height: height,
                cursor: "pointer",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "50%",
            }}
        >
            <img
                src={icon}
                style={{
                    height: "100%",
                    width: "100%",
                    tintColor: "red",
                }}
            />
            {typeof label !== "undefined" && label !== "" && (
                <div className="ms-2 font-size-normal">{label}</div>
            )}
        </div>
    );
}
