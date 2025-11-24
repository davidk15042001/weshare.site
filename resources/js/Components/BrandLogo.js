import React, {useState, useEffect} from 'react';

export default function BrandLogo({src, className, plan, isPublic, isMobile, isDesktop}) {
    if(typeof src === 'undefined' || src === '' || !src) return null;

    const [logoClass, setLogoClass] = useState(isPublic ? 'vw-15 vw-lg-30' : isDesktop ? 'vw-30' : 'vw-15');
    const [isLogoWidthHigher, setIsLogoWidthHigher] = useState(false);

    const onLoadLogoImage = ({target:img}) => {
        if (img.offsetHeight >= img.offsetWidth) {
            setIsLogoWidthHigher(true);
            setLogoClass(isPublic ? 'vw-15 vw-lg-20' : isDesktop ? 'vw-15' : 'vw-15')
        }
    }

    useEffect(() => {
        if(!isPublic) {
            setLogoClass(isLogoWidthHigher ? (isDesktop ? 'vw-15' : 'vw-15') : (isDesktop ? 'vw-30' : 'vw-20'))
        }
    }, [isLogoWidthHigher, isDesktop, isPublic]);

    return (
        <div
            className={`d-flex p-1 align-items-center justify-content-center ${!isPublic && plan === "free" ? 'mt-4' : ''} ${logoClass} ${className}`}
            style={{
                backgroundSize: "cover",
                borderRadius: "10px",
                position: "absolute",
                top: 18,
                right: 18,
                backgroundColor: "#ffffff",
                zIndex: 9,
            }}>
            <img
                className="w-100 h-100"
                style={{objectFit: "contain", borderRadius: "10px", borderColor: "#fffff"}}
                src={src}
                onLoad={onLoadLogoImage}
            />
        </div>
    )
}