import React from 'react';
import { FontAwesome } from "react-web-vector-icons";

export default function SocialIcon({ className, url, icon, color, onClick }){
    return (
        <div
            onClick={onClick}
            className={`rounded-10 text-decoration-none d-flex align-items-center justify-content-center ${className}`}
            style={{
                width: "40px",
                height: "40px",
                backgroundColor: color,
                cursor: "pointer",
            }}
        >
            {icon === 'tiktok' ? (
                <img src='/assets/svg/tiktok.svg'/>
            ) : (
                <FontAwesome name={icon} color="white" size={25} />
            )}
        </div>
    );
};