import React from 'react';
import MobileIcon from '@/svg/MobileIcon';
import DesktopIcon from '@/svg/DesktopIcon';
import {useSpring, animated} from '@react-spring/web';

export default function SwitchView({width, height="100%"}) {
    const [{pos}, setPos] = useSpring(() => ({
        pos: 2,
    }));
    const iconSize = 15;

    const onClickMobile = () => {
        setPos({pos: 2, config: {duration: 100}});
    }

    const onClickDesktop = () => {
        setPos({pos: width/2, config: {duration: 100}});
    }

    return(
        <div className="d-flex align-items-center bg-blue-800" style={{
            position: 'relative',
            borderRadius: '8px',
            paddingInline: '4px',
            width,
            height
        }}>
            <animated.div className="bg-primary rounded-10" style={{
                ...styles.box,
                left: pos,
                width: width / 2,
                height: '90%'
            }} />
            <div onClick={onClickMobile} style={styles.iconContainer}>
                <MobileIcon width={iconSize} height={iconSize} color="#f2f2f2" />
            </div>
            <div onClick={onClickDesktop} style={styles.iconContainer}>
                <DesktopIcon width={iconSize} height={iconSize} color="#f2f2f2" />
            </div>
        </div>
    );
}

const styles = {
    iconContainer: {
        width: '50%',
        zIndex: 9,
        cursor: 'pointer',
    },
    box: {
        position: 'absolute',
        zIndex: 0,
    }
};