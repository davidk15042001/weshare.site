import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Modal } from "bootstrap";
import { socials as socialsHelper, translate, toast } from "@/Helpers";
import { FontAwesome } from "react-web-vector-icons";
import { useSpring, animated } from "@react-spring/web";

export default function AddCover({
    width,
    height,
    image,
    reset,
    round,
    className,
    hideCropping,
    onHandleCropped,
    onRemove,
    onClick,
    dataToggle,
    dataTarget
}) {
    const [{ wBox, hBox, wPlus }, setSizes] = useSpring(() => ({
        wBox: "100%",
        hBox: "100%",
        wPlus: width * 0.07,
    }));

    function onMouseEnter(e) {
        setSizes({
            wBox: "97%",
            hBox: "97%",
            wPlus: width * 0.06,
            config: { duration: 200 },
        });
    }

    function onMouseLeave(e) {
        setSizes({
            wBox: "100%",
            hBox: "100%",
            wPlus: width * 0.09,
            config: { duration: 100 },
        });
    }

    const isRounded = typeof round !== "undefined" && round;
    const isCroppingEnabled =
        typeof hideCropping === "undefined" || !hideCropping;

    const [img, setImg] = useState(null);
    const [cropper, setCropper] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    // useEffect(() => {
    //     if (
    //         typeof props.card === "undefined" ||
    //         props.card.cover === null ||
    //         props.card.cover === ""
    //     ) {
    //         setCardDetails({ ...cardDetails, cover: props.card.covers[0].url });
    //     }
    // }, [props.card]);

    // const [covers, setCovers] = useState(props.card.covers);

    useEffect(() => {
        if (img !== null) {
            if (isCroppingEnabled) {
                new Modal(document.getElementById("cropper-modal")).show();
                document
                    .getElementById("cropper-modal")
                    .addEventListener("shown.bs.modal", function (event) {
                        setShowCropper(true);
                    });
            } else {
                onHandleCropped(img);
                setImg(null);
            }
        }
    }, [img]);

    const onDrop = useCallback((acceptedFiles) => {
        console.log("Image ", acceptedFiles[0]);

        let done = function (url) {
            setImg(url);
        };

        let reader = new FileReader();
        reader.readAsDataURL(acceptedFiles[0]);
        reader.onload = function (event) {
            done(reader.result);
        };
    }, []);

    // const { getRootProps, getInputProps } = useDropzone({
    //     onDrop,
    //     multiple: false,
    //     accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    // });

    const onCloseModal = () => {
        let modal = Modal.getInstance(document.getElementById("cropper-modal"));
        modal.hide();
        setShowCropper(false);
    };

    const onFinishCropping = () => {
        onHandleCropped(cropper.getCroppedCanvas().toDataURL());
        setImg(null);
        onCloseModal();
    };

    const onCancelCropping = () => {
        setImg(null);
        onCloseModal();
    };

    return (
        <div
            style={{ position: "relative" }}
            className="h-100"
            onClick={onClick}
            data-bs-toggle={dataToggle}
            data-bs-target={dataTarget}
        >
            <div className="container-fluid w-100 h-100 p-0 d-flex align-items-center justify-content-center">
                <animated.div
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    style={{
                        width: wBox,
                        height: hBox,
                    }}
                    className={`${
                        isRounded ? "rounded-circle" : ""
                    } overflow-hidden bg-light d-flex justify-content-center align-items-center  ${className}`}
                    role="button"
                >
                    <animated.img
                        className={`${isRounded ? "w-25" : "w-10"}`}
                        src="../../assets/svg/add.svg"
                        style={{
                            width: wPlus,
                        }}
                    />
                </animated.div>
            </div>
        </div>
    );
}
