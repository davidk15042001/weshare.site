import React, {useRef} from 'react';
import IconButton from './IconButton';
import {useSpring, animated} from '@react-spring/web';
import {translate} from '@/Helpers';

export default function SearchBar({width = '100%'}) {
    const [{borderColor, px}, setContainerProps] = useSpring(() => ({
        borderColor: '#fff',
        px: 30,
    }));

    const inputRef = useRef();

    const onMouseEnter = () => {
        setContainerProps({borderColor: '#B4BCCA'});
    }

    const onMouseLeave = () => {
        setContainerProps({borderColor: '#fff'});
    }

    const onClick = () => {
        inputRef.current.focus();
    }

    return (
        <animated.div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            className="rounded-10 bg-white text-color font-size-normal d-flex align-items-center justify-content-between py-2 mx-auto"
            style={{...styles.container, paddingInline: px, borderColor, width}}>
            <img src='../../assets/svg/magnifying.svg' style={{width: 20, height: 20}} />
            <input ref={inputRef} type="text" placeholder='Search Anything' style={styles.input} />
            {/* <div className="ms-2">
                {translate('Search Anything')}
            </div> */}
            <IconButton className="ms-1" width={15} height={15} icon='../../assets/svg/close-circle.svg' />
        </animated.div>
    );
}

const styles = {
    container: {
        cursor: 'pointer',
        borderWidth: 1,
        borderStyle: 'solid',
    },
    input: {
        borderColor: 'transparent',
        borderWidth: 0,
        outline: 0,
        boxShadow: 'none',
        marginLeft: '5px',
        width: '40%',
        flex: 1
    }
}