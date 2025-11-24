import React, {useState, useEffect} from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Language from '@/Components/Langauge';
import { Link } from '@inertiajs/inertia-react';
import {translate} from '@/Helpers';
import { useSpring, animated } from '@react-spring/web';
import { fontSize } from 'tailwindcss/defaultTheme';

export default function Guest({ children }) {
    const animatedProps = useSpring({to: {opacity: 1}, from: {opacity: 0}});
    return (
        <div className="container-fluid bg-primary">
            <div className="row vh-100">
                <div className="col-md-5 col-lg-4 bg-white p-5 px-md-6">
                    <div className="d-flex justify-content-between align-items-center">
                        <ApplicationLogo />
                        <Language lang="Eng" width="25" height="25" />
                    </div>
                    <animated.div style={animatedProps} className="mt-5">
                        {children}
                    </animated.div>
                </div>
                <div className="col-md-7 col-lg-8 p-0 d-none d-md-inline-block 100vh position-fixed" style={{top:0, right:0}}>
                    <div className='cardborder-0 rounded-0' style={styles.carouselContainer}>
                        <div className='card-header p-0 border-0 bg-transparent'>
                            <img src={`/assets/images/carousel_img_1.png`} style={{
                                width: '100%',
                            }} />
                        </div>
                        <div className='card-body text-white fs-3 bg-transparent'>
                            {translate('Customize your Vi-Site to match your brand.')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

var styles = {
    carouselContainer: {
        backgroundImage: `url('/assets/images/bg1.jpg')`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    }
}
