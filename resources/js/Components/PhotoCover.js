import React from 'react';
import BrandLogo from './BrandLogo';
import PoweredByBanner from './PoweredByBanner';
import ProfilePicture from './ProfilePicture';

export default function PhotoCover({coverRef, url, cardAvatar, color, logo, isPublic, isMobile, isDesktop, plan, className}) {
    let coverStyle = {backgroundColor: color,
        // overflow: 'hidden'
        };
    // if(isMobile) coverStyle = {...coverStyle, height: '250px'};
    return (
        <div ref={coverRef}
            className={`cover-photo-wrapper p-0 position-relative rounded-0 rounded-lg-top-left-20 rounded-lg-top-right-20 ${className}`}
            style={{
                // backgroundImage: `url('${url}')`,
                // backgroundPosition: "center",
                // backgroundRepeat: "no-repeat",
                // backgroundSize: "cover",
                // backgroundColor: color,
                ...coverStyle
            }}>
            <div style={{display: 'flex'}}>
            <img 
                src={url} 
                style={{ 
                width: '100%', 
                backgroundSize: 'contain', 
                ...( !isPublic && plan === "free" && { marginTop: '20px' } ) 
                }} 
                alt="" 
            />
            {!isPublic && plan === "free" && <PoweredByBanner />}
            </div>
             <ProfilePicture
                                profileImg={cardAvatar}
                                brandImg={logo}
                                brandColor={color}
                                size={150}
                                className="position-absolute profile-picture"
                                style={{
                                    bottom: '-75px'
                                //     zIndex: 10,
                                //     top: profileTop,
                                //     ...profileStyle
                                }}
                            />       
            <BrandLogo src={logo} isPublic={isPublic} isDesktop={isDesktop} isMobile={isMobile} plan={plan} />
        </div>
    )
}