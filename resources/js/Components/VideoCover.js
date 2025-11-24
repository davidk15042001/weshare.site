import React, { useRef, useEffect } from 'react';
import BrandLogo from './BrandLogo';
import PoweredByBanner from './PoweredByBanner';
import ProfilePicture from './ProfilePicture';

export default function VideoCover({ coverRef, url, logo, cardAvatar, color, isPublic, isMobile, isDesktop, plan, className }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            console.log('Reloading video with URL:', url);
            videoRef.current.pause();
            videoRef.current.load();
            videoRef.current.play().catch(err => {
                console.warn('Autoplay error:', err);
            });
        }
    }, [url]);

    // let coverStyle = { overflow: 'hidden' };
    // if (isMobile) coverStyle = { ...coverStyle, height: '250px' };

    return (
        <div
            ref={coverRef}
            className={`cover-video-wrapper p-0 position-relative rounded-0 rounded-lg-top-left-20 rounded-lg-top-right-20 ${className}`}
            // style={coverStyle}
        >
            {!isPublic && plan === "free" && <PoweredByBanner />}
             <ProfilePicture
                                profileImg={cardAvatar}
                                brandImg={logo}
                                brandColor={color}
                                size={150}
                                className="position-absolute profile-picture"
                                style={{
                                    // zIndex: 10,
                                    // top: profileTop,
                                    // ...profileStyle
                                    bottom: '-75px'
                                }}
                            />       
            <BrandLogo src={logo} isPublic={isPublic} isDesktop={isDesktop} isMobile={isMobile} plan={plan} />

            <div className="bg-transparent">
                <video
                    ref={videoRef}
                    src={url}
                    autoPlay
                    loop
                    muted
                    defaultMuted
                    playsInline
                    preload="auto"
                    width="100%"
                    height="100%"
                    className="m-0 p-0 rounded-0 rounded-lg-top-left-20 rounded-lg-top-right-20 overflow-hidden"
                />
            </div>
        </div>
    );
}
