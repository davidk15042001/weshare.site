import React from "react";
import { FontAwesome } from "react-web-vector-icons";

export default function Document({
    file,
    className,
    icon,
    onclick,
    handleOnClickIcon,
    isDesktop,
}) {
    const openDocument = () => {
        window.open(file.url);
    };
    return (
        <div
            role="button"
            className={`row p-2 bg-light  rounded-10 mb-2 me-0 me-2`}
        >
            <div
                onClick={openDocument}
                className={`col-10  ${className} p-0 ps-1 m-0 d-flex align-items-center'`}
            >
                <div className="bg-primary p-2 px-3 d-flex align-items-center justify-content-center rounded-10">
                    <FontAwesome name="file-o" color="#fff" size={20} />
                </div>
                <div className="ms-2 text-break">
                    <div className="fs-sm fw-bold">{file.title}</div>
                    <div className="fs-sm">{file.size}KB</div>
                </div>
            </div>
            {icon && (
                <div className="col-1">
                    <div role="button" onClick={() => handleOnClickIcon(file)}>
                        <FontAwesome
                            name={icon || "download"}
                            className="#333"
                            size={18}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
