import { auto } from "@popperjs/core";
import React from "react";

export default function ProfilePicture({
    className,
    rounded,
    brandColor,
    style,
    size,
    profileImg,
    brandImg,
}) {
    return (
        <div
            className={`${
                !profileImg ? "bg-primary" : ""
            } d-flex align-items-center justify-content-start ${
                className || ""
            }`}
            style={{
                //width: `${!profileImg ? 120 : size + 30}px`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: `${rounded ? size * 0.2 : size / 2}px`,
                ...style,
            }}
        >
            {profileImg ? (
                <img
                    // className="w-100"
                    src={profileImg}
                    style={{
                        height: size,
                        width: size,
                        objectFit: "cover",
                        display: "block",
                        borderRadius: `${rounded ? size * 0.2 + "px" : "50%"}`,
                    }}
                />
            ) : (
                <img
                    src={"/assets/svg/no-profile.svg"}
                    style={{
                        width: size,
                        height: "50%",
                        objectFit: "contain",
                        display: "block",
                        borderRadius: "50%",
                    }}
                />
            )}

            {/* {typeof brandImg !== "undefined" && brandImg && (
                <div
                    className="d-flex align-items-center justify-content-center overflow-hidden"
                    style={{
                        ...styles.brand,
                        backgroundColor: brandColor,
                    }}
                >
                    <img
                        className="w-90 h-95"
                        style={{ objectFit: "contain", borderRadius: "25px" }}
                        src={brandImg}
                    />
                </div>
            )} */}
        </div>
    );
}

// const styles = {
//     brand: {
//         backgroundSize: "contain",
//         maxWidth: "70%",
//         width: "auto",
//         height: "45px",
//         borderRadius: "25px",
//         position: "absolute",
//         left: 70,
//         bottom: -15,
//     },
// };
