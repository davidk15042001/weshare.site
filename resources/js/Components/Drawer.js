import React, {useEffect} from 'react';
import ApplicationLogo from './ApplicationLogo';
import { useSpring, animated } from '@react-spring/web';
import { translate } from '@/Helpers';

export default function Drawer({width, menus, defaultRoute, onReady, auth}) {
    const rowH = 50;
    const cursorH = 102;

    let index = menus.findIndex(menu => menu.route == defaultRoute);
    index = index < 0 ? 0 : index;
    const initialTop = -(cursorH/2) + 8 + (cursorH/2 * index);
    
    const [{ position }, setPosition] = useSpring(() => ({
        position: initialTop
    }));

    function onClicked(i) {
        const selectedPos = i == 0 ? -(cursorH/2) + 8 : -(cursorH/2) + 8 + (cursorH/2 * i);
        const route = menus[i]['route'];
        console.log('route', route, width);
        console.log('route', defaultRoute);

        let routeindex = menus.findIndex(menu => menu.route == defaultRoute);
        if (route == defaultRoute || routeindex < 0) {
            return onReady(route);
        }

        setPosition({
            position: selectedPos,
            config: { duration: 200 },
            onRest: () => onReady(route),
        });
    }

    return(
        <div className="pt-4 pb-5 h-100 position-relative">
            <div className="d-flex justify-content-center" //style={{maxWidth: '100px'}}
            >
                <ApplicationLogo />
                {/* {width} */}
            </div>
            <div style={{marginTop: 70, position: 'relative'}}>

                <animated.div style={{
                    position: 'absolute',
                    left: -23,//(route().current('account.*') ? -50: -23),
                    top: position
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="37" height={cursorH} viewBox="0 0 37 102.233">
                        <path
                            id="Path_151"
                            data-name="Path 151"
                            d="M23.5-20C23.5,10.57,37,10.521,37,23.5S23.5,40.965,23.5,67,0,36.479,0,23.5,23.5-50.57,23.5-20Z"
                            transform="translate(0 28.464)"
                            fill="#fa2157"
                        />
                    </svg>
                </animated.div>

                {menus.map((menu, i) => {
                    if(!menu.visible) return null;
                    return (
                        <div role="button"
                            onClick={(e) => onClicked(i)}
                            key={menu.id}
                            className={`${menu.route == defaultRoute ? 'text-red-300' : 'text-color'} px-5`}
                            style={{height: rowH}}>
                            {menu.title}
                        </div>
                    )
                })}
            </div>

            {auth.plan === 'free' && (
                <a
                    href={route("subscriptions.index")}
                    className="position-absolute btn btn-lg btn-danger fs-sm d-flex align-items-center"
                    style={{
                        bottom: '3vh',
                        left: 0,
                        right: 0,
                        margin: 'auto',
                        width: '70%'
                    }}
                >
                    <i className="bi bi-stars me-2"></i>
                    {translate('Upgrade account')}
                </a>
            )}
        </div>
    );
}