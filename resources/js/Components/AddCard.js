import React from "react";
import { useSpring, animated } from "@react-spring/web";

export default function AddCard({ width, height, onClick }) {
    const [{ wBox, hBox, wPlus }, setSizes] = useSpring(() => ({
        wBox: "100%",
        hBox: "100%",
        wPlus: width * 0.07,
    }));

    function onMouseEnter(e) {
        setSizes({
            wBox: "94%",
            hBox: "94%",
            wPlus: width * 0.07,
            config: { duration: 200 },
        });
    }

    function onMouseLeave(e) {
        setSizes({
            wBox: "100%",
            hBox: "100%",
            wPlus: width * 0.08,
            config: { duration: 100 },
        });
    }

    return (
        <div
            className="container-fluid w-100 h-100 p-0 d-flex align-items-center justify-content-center"
            onClick={onClick}
            style={{ cursor: "pointer" }}
        >
            <animated.div
                className="bg-blue-800 rounded-10 d-flex align-items-center justify-content-center m-auto"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                style={{
                    width: wBox,
                    height: hBox,
                }}
            >
                <animated.img
                    src="../../assets/svg/add.svg"
                    style={{
                        width: wPlus,
                    }}
                />
            </animated.div>
        </div>
    );
}
