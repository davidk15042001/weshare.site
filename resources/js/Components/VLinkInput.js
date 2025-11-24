import React, { useRef, useState, useCallback } from "react";
import IconButton from "./IconButton";
import { useSpring, animated } from "@react-spring/web";
import "../../css/custom.css";
import { translate } from "@/Helpers";

//cropper
// import Cropper from "react-cropper";
// import "cropperjs/dist/cropper.css";
// import { useDropzone } from "react-dropzone";
// import { Modal } from "bootstrap";

export default function VLinkInput({
    className,
    protocol,
    domain,
    subdomain,
    onHandleChange,
    onHandleShare
}) {

    const inputRef = useRef();

    const [focused, setFocused] = useState(false);
    const [showShare, setShowShare] = useState(true);

    const [
        { labelOpacity, labelDisplay, inputOpacity, inputDisplay },
        setProperties,
    ] = useSpring(() => ({
        labelOpacity: 1,
        labelDisplay: "flex",
        inputOpacity: 0,
        inputDisplay: "none",
    }));

    const domainArr = subdomain.split(domain);
    const domainName = domainArr[0];

    const onMouseEnter = () => {};

    const onMouseLeave = () => {};

    const onClick = () => {
        setFocused(true);
        setShowShare(false);
        setProperties({
            labelOpacity: 0,
            labelDisplay: "none",
            inputOpacity: 1,
            inputDisplay: "flex",
            onRest: () => inputRef.current.focus(),
        });
    };

    const onBlurred = () => {
        setFocused(false);
        setShowShare(true);
        setProperties({
            labelOpacity: 1,
            labelDisplay: "flex",
            inputOpacity: 0,
            inputDisplay: "none",
        });
    };

    const onOpenLink = () => {
        window.open(`${protocol}://${subdomain}.${domain}`);
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-center">
                <div
                    className={`me-4 ${
                        focused ? "bg-white" : "bg-light"
                    } px-2 py-2 d-flex align-items-center rounded-10 justify-content-center border`}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <div
                        onClick={onOpenLink}
                        className="border-end cursor-pointer pe-2 me-2 d-flex align-items-center justify-content-center"
                    >
                        <p style={{fontSize: "0.72rem"}}
                            className={`mb-0 text-black-500 `}>
                            Preview&nbsp;
                        </p>
                        <IconButton
                            icon="/assets/svg/globe.svg"
                            width={18}
                            height={18} />
                    </div>
                    <animated.div
                        onClick={onClick}
                        className="text-center w-85 me-2 fs-sm bg-light border-0 text-black-500"
                        style={{ opacity: labelOpacity, display: labelDisplay }}>
                        {protocol}://{subdomain}.{domain}
                    </animated.div>
                    <animated.div
                        onClick={onClick}
                        style={{ opacity: inputOpacity, display: inputDisplay }}>
                        <div className="fs-sm text-black-500">
                            {protocol}://
                        </div>
                        <input
                            ref={inputRef}
                            className="fs-sm bg-transparent border-0 text-black-500"
                            value={domainName}
                            style={{ boxShadow: "none", outline: 0 }}
                            onBlur={onBlurred}
                            onChange={onHandleChange} />
                        <div
                            onClick={onOpenLink}
                            className="fs-sm border-start ps-2 ms-1 text-black-500">
                            {domain}
                        </div>
                    </animated.div>
                    {showShare && (
                        <div className="d-flex align-items-center">
                            <IconButton
                                icon="/assets/images/share.png"
                                width={20}
                                height={20}
                                tooltip={translate('Share Site')}
                                onClick={onHandleShare} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
