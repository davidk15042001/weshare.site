import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Modal } from "bootstrap";
import { FontAwesome } from "react-web-vector-icons";
import { translate, toast } from "@/Helpers";

export default function     UploadImage({
    width,
    height,
    image,
    reset,
    round,
    className,
    hideCropping,
    onHandleCropped,
    onRemove,
    loading
}) {
    const isRounded = typeof round !== "undefined" && round;
    const isCroppingEnabled =
        typeof hideCropping === "undefined" || !hideCropping;

    const [img, setImg] = useState(null);
    const [cropper, setCropper] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

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

    // const onDrop2 = useCallback((acceptedFiles) => {
    //     console.log("Image ", acceptedFiles[0]);

    //     let done = function (url) {
    //         setImg(url);
    //     };

    //     let reader = new FileReader();
    //     reader.readAsDataURL(acceptedFiles[0]);
    //     reader.onload = function (event) {
    //         done(reader.result);
    //     };
    // }, []);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
    
        if (!file) return;
    
        const maxSizeInMB = 2;
        const fileSizeInMB = file.size / (1024 * 1024);
    
        console.log(`Selected file size: ${fileSizeInMB.toFixed(2)} MB`);
    
        if (fileSizeInMB > maxSizeInMB) {
            toast(`File is too large! Maximum size is ${maxSizeInMB} MB.`, 'error');
            return;
        }
    
        let done = function (url) {
            setImg(url);
        };
    
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            done(reader.result);
        };
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    });

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

    let rootProps = !loading ? {...getRootProps({ className: "dropzone" })} : {};

    return (
        <div style={{ position: "relative" }}>
            <div {...rootProps}>
                {!loading ? <input {...getInputProps()} /> : null}
                <div className="d-flex justify-content-center mb-2" style={{ position: "relative" }}>
                    {!image ? (
                        <div
                            className={`${
                                isRounded ? "rounded-circle" : ""
                            } overflow-hidden bg-light d-flex justify-content-center align-items-center ${className}`}
                            role="button"
                            style={{ width, height }}
                        >
                            {!loading ? <img className={`${isRounded ? "w-25" : "w-10"}`} src="/assets/svg/camera.svg" /> : null}
                        </div>
                    ) : (
                        <div
                            className={`${
                                isRounded ? "rounded-circle" : ""
                            } overflow-hidden bg-light d-flex justify-content-center align-items-center ${className}`}
                            role="button"
                            style={{
                                width,
                                height,
                                backgroundImage: `url('${image}')`,
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "cover",
                            }}
                        />
                    )}

                    {loading && (
                        <div className="position-absolute d-flex align-items-center justify-content-center w-100 h-100">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">{translate('Loading...')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {image && (
                <div
                    onClick={() => onRemove()}
                    style={{
                        cursor: "pointer",
                        position: "absolute",
                        top: 0,
                        right: 30,
                    }}
                >
                    <FontAwesome name="close" color="#df2351" size={18} />
                </div>
            )}

            {img !== null && (
                <div
                    className="modal fade"
                    id="cropper-modal"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"
                    tabIndex="-1"
                    aria-labelledby="cropper-modal-label"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5
                                    className="modal-title"
                                    id="cropper-modal-label"
                                >
                                    Crop Image
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="w-100" style={{ height: 400 }}>
                                    {showCropper && (
                                        <Cropper
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                            }}
                                            zoomTo={0}
                                            initialAspectRatio={
                                                isRounded ? 1 : 16 / 9
                                            }
                                            preview=".img-preview"
                                            src={img}
                                            viewMode={1}
                                            minCropBoxHeight={10}
                                            minCropBoxWidth={10}
                                            background={false}
                                            responsive={true}
                                            autoCropArea={1}
                                            checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                                            onInitialized={(instance) => {
                                                console.log(
                                                    "Cropper =",
                                                    instance
                                                );
                                                setCropper(instance);
                                            }}
                                            guides={true}
                                        />
                                    )}
                                </div>
                                <div className="d-flex mt-2">
                                    <button
                                        type="button"
                                        onClick={onFinishCropping}
                                        className="btn-sm btn-danger btn px-3 py-0 mx-1"
                                    >
                                        Done
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onCancelCropping}
                                        className="btn-sm btn-light btn px-3 py-0 mx-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
