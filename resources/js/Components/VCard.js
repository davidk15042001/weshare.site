import React, { useEffect, useState, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import IconButton from "./IconButton";
import DeleteIconButton from "./DeleteIconButton";
import { Link } from "@inertiajs/inertia-react";
import { translate } from "@/Helpers";
import lightOrDarkImage from "@check-light-or-dark/image";
import lightOrDarkColor from "@check-light-or-dark/color";
import axios from "axios";
import tinycolor from 'tinycolor2';

export default function VCard({
    cover_overlay,
    canDelete,
    width,
    height,
    selected,
    blank,
    cardImage,
    details,
    qrCode,
    onClick,
    onClickRemove,
    onClickEdit,
    onClickView,
    onClickShare,
    editable,
}) {
    const cardRef = useRef(null);
    const [{ y }, setEditableProps] = useSpring(() => ({ y: height + 20 }));
    const [{ opacity }, setIconsProps] = useSpring(() => ({ opacity: 0 }));
    const [bgLightness, setBgLightness] = useState("dark");
    const [qr, setQr] = useState(null);

    console.log('selected', selected, details)

    let cardCover = ''; 
    if(typeof details !== 'undefined') {
        cardCover = !isBlank && details.cover_thumbnail && details.cover_thumbnail > '' ? details.cover_thumbnail : details.cover;
    }


    useEffect(() => {
        if (cardCover) {
            lightOrDarkImage({
                image: cardCover,
                // width,
                // height,
                // x: 1,
                // y: height,
            }).then((res) => {
                setBgLightness(res);
            });
        } else {
            if(details && details.settings && typeof details.settings !== 'undefined') {
                setBgLightness(tinycolor(details.settings.cover_overlay).isLight() ? 'light' : 'dark');
            }
        }
    }, [details]);

    // setBgLightness(lightOrDarkColor(cover_overlay));
    // console.log(bgLightness);

    useEffect(() => {
        if (details && details.id) {
            axios
                .post(
                    route("cards.qr", details.id),
                    { color: bgLightness === "light" ? "black" : "white" },
                    { responseType: "blob" }
                )
                .then(({ data }) => {
                    console.log("Getting QR Code =", data);
                    let blobURL = URL.createObjectURL(data);
                    console.log("Getting QR Code =", blobURL);
                    setQr(blobURL);
                })
                .catch((e) => {
                    console.log("Getting QR Code error =", e);
                });
        }
    }, [details, bgLightness]);

     const isBlank = typeof blank !== "undefined" && blank;
    
    const card = cardCover ? cardCover : typeof cardImage !== "undefined" && cardImage !== "" ? cardImage : "";

    const isEditable = typeof editable !== "undefined" && editable;

    const onMouseEnter = () => {
        if (isEditable || typeof onClickView !== 'undefined') {
            setEditableProps({ y: 0 });
            setIconsProps({ opacity: 1, delay: 300, config: { duration: 10 } });
        }
    };

    const onMouseLeave = () => {
        if (isEditable || typeof onClickView !== 'undefined') {
            setIconsProps({ opacity: 0, config: { duration: 50 } });
            setEditableProps({ y: height + 20, delay: 10 });
        }
    };

    const onClickCard = e => {
        onClick();
    }

    const onShareSite = e => {
        if(typeof onClickShare !== 'undefined') {
            onClickShare();
        }
        e.stopPropagation();
    }

    const onOpenCard = e => {
        if(typeof onClickView !== 'undefined') {
            onClickView();
        }
        e.stopPropagation();
    }

    const onDeleteCard = e => {
        onClickRemove();
        e.stopPropagation();
    }

    return (
        <div
            ref={cardRef}
            id="#cardContainer"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`container-fluid rounded-10 p-0 ${
                selected ? "border-primary-1" : "border-transparent-1"
            }`}
            onClick={onClickCard}
        >
            <div
                className="position-relative rounded-10"
                style={{
                    backgroundColor:
                        !isBlank &&
                        details.settings &&
                        typeof details.settings.cover_overlay !== "undefined"
                            ? details.settings.cover_overlay
                            : '#df2351',
                    backgroundImage: `url(${card})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                    overflow: "hidden",
                    cursor: "pointer",
                }}
            >
                <div className="w-100 h-100 p-4 p-md-3" style={blank ? {} : { ...styles.gradient}}>
                    {(isEditable || typeof onClickView !== 'undefined') ? (
                        <animated.div
                            className="position-absolute w-100 h-100"
                            style={{ ...styles.transparent, top: y, left: 0 }}
                        >
                            <animated.div
                                style={{ opacity }}
                                className="d-flex align-items-center justify-content-end p-3"
                            >
                                <IconButton
                                    onClick={onShareSite}
                                    className="me-3"
                                    width={22}
                                    height={22}
                                    //icon={bgLightness === "light" ? "/assets/images/share_dark.png" : "/assets/images/share_white.png"}
                                    icon="/assets/images/share_white.png"
                                    tooltip={translate('Share Site')}
                                />
                                <IconButton
                                    onClick={onOpenCard}
                                    className="me-2"
                                    width={22}
                                    height={22}
                                    //icon={bgLightness === "light" ? "/assets/svg/globe_dark.svg" : "/assets/svg/globe_white.svg"}
                                    icon="/assets/svg/globe_white.svg"
                                    tooltip={translate('Preview')}
                                />
                                {isEditable && (
                                    <>
                                        {canDelete && (
                                            <IconButton
                                                onClick={onDeleteCard}
                                                width={40}
                                                height={40}
                                                //icon={bgLightness === "light" ? "/assets/svg/trash_dark.svg" : "/assets/svg/trash_white.svg"}
                                                icon="/assets/svg/trash_white.svg"
                                                tooltip={translate('Delete')}
                                            />
                                        )}
                                        <Link href={route("cards.edit", details.id)}>
                                            <IconButton
                                                width={40}
                                                height={40}
                                                //icon={bgLightness === "light" ? "/assets/svg/edit_dark.svg": "/assets/svg/edit_white.svg"}
                                                icon="/assets/svg/edit_white.svg"
                                                tooltip={translate('Edit')}
                                            />
                                        </Link>
                                    </>
                                )}
                            </animated.div>
                        </animated.div>
                    ) : (
                        <animated.div
                            className="position-absolute w-100 h-100"
                            style={{ top: y, left: 0 }}
                        >
                            <animated.div className="d-flex align-items-center justify-content-end">
                                {canDelete && (
                                    <DeleteIconButton
                                        cover_overlay={cover_overlay}
                                        onClick={onClickRemove}
                                        width={36}
                                        height={36}
                                        icon={"/assets/svg/trash_dark.svg"}
                                    />
                                )}
                            </animated.div>
                        </animated.div>
                    )}

                    <div style={{ zIndex: 90 }}>
                        {!isBlank && details.avatar && details.avatar !== "" ? (
                            <div
                                className="rounded-circle"
                                style={{ width: "80px", height: "80px" }}
                            >
                                <img
                                    className="w-100"
                                    src={details.avatar}
                                    style={{
                                        height: "80px",
                                        width: "80px",
                                        objectFit: "cover",
                                        display: "block",
                                        borderRadius: "40px",
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ width: "4.5rem", height: "4.5rem" }}></div>
                        )}
                    </div>

                    <div
                        className="d-flex align-items-end justify-content-between mt-5"
                        style={{ zIndex: 99 }}
                    >
                        <div
                            className="lh-sm"
                            style={{
                                ...styles.details,
                                // color: bgLightness === "light" ? "#000" : "#fff",
                                color: "#fff",
                            }}
                        >
                            <div className="fs-5">
                                {details?.firstname || details?.lastname
                                    ? `${details?.firstname || ""} ${details?.lastname || ""}`.trim()
                                    : ""}
                            </div>
                            <div className="fs-sm">
                                {details?.job || details?.company
                                    ? `${details?.job || ""} ${details?.job && details?.company ? translate("at") : ""} ${details?.company || ""}`
                                    : ""}
                            </div>
                        </div>

                        {!isBlank && qr && <img className="w-20" src={qr} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    logo: {
        marginTop: "5%",
        marginLeft: "5%",
    },
    gradient: {
        top: 0,
        background: "linear-gradient(transparent, rgb(0,0,0, 0.3))",
    },
    transparent: {
        top: 0,
        background: "transparent",
    }
};
