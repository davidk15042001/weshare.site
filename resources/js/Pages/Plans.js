import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/inertia-react';
import { translate, getCookie, setCookie } from '@/Helpers';
import SubscriptionCard from '@/Components/SubscriptionCard';

export default function Plans(props) {
    const [lang, setLang] = useState(getCookie('locale'));

    useEffect(() => {
        if(!lang) {
            const bLang = navigator.language.split('-');
            let newLang = (bLang.length > 0 && ['en', 'de'].includes(bLang[0])) ? bLang[0] : 'en';
            setCookie('locale', newLang);
            setLang(newLang);
        }
    }, [lang]);

    return (
        <section>
            <Head title="Plans" />

            <div className="m-0 p-0 p-lg-4 h-100">
                { props.authenticated && (
                    <div className='d-flex justify-content-center'>
                        <div className='border-radius-20 bg-yellow-800 text-center py-3 px-5 mb-5 rounded-10'>
                            <div className='fs-6 fw-bold d-flex align-items-center'>
                                <i className='bi bi-exclamation-octagon-fill text-danger fs-5 me-2'></i>
                                {translate('Please choose your subscription plan to proceed')}!
                            </div>
                        </div>
                    </div>
                )}
                <div className='text-center pt-4'>
                    <h3 className='fw-bold'>{translate('Flexible')} <span className='text-danger'>{translate('Plans')}</span></h3>
                    <div className='fs-sm'>{translate('Choose a plan that works best for you and your business')}</div>
                </div>

                <div className='d-flex justify-content-center fs-sm mt-4'>
                    <div className='d-inline-block fs-sm' style={{position: 'relative'}}>
                        <span className="d-inline-block rounded-pill d-flex">
                        <a href={route(props.route, 'monthly')} className={`btn btn-sm px-3 py-1 rounded-pill ${props.interval == 'month' ? 'btn-dark':''}`}>{translate('Monthly')}</a>
                            <a href={route(props.route, 'yearly')} className={`d-flex align-items-center btn btn-sm px-3 py-1 rounded-pill ${props.interval == 'year' ? 'btn-dark':''}`}>
                                {translate('Annually')}
                                {/* {(props.interval == 'month') && ( */}
                                    <span className='bg-danger ms-2 text-white py-1 rounded-pill' style={{top: '-5px', right: -85, width: 85, fontSize:'10px', position:'absolute'}}>+40% {translate('Discount')}</span>
                                {/* )} */}
                            </a>
                        </span>
                    </div>
                </div>

                <div className='d-lg-flex justify-content-center mt-4 px-4 px-lg-0'>
                    {!props.plans.length && (
                        <div className='h3 mt-3'>{translate('No plans found')}!</div>
                    )}
                    {props.plans.map(plan => {
                        return (
                            <SubscriptionCard key={plan.id} isPlan={true} plan={plan} interval={props.interval} authenticated={props.authenticated} className='mx-lg-4' />
                        );
                    })}
                </div>
                {!props.authenticated && (
                    <div className="d-flex flex-column align-items-center mt-5">
                        <h5>{translate('Already have an account?')} <Link href={route('login')}><b>{translate('Login')}</b></Link></h5>
                    </div>
                )}
                
                <div className={`d-flex align-items-center justify-content-center mt-6`}>
                    <a href='/set/language?lang=en' className={`text-decoration-none ${lang === 'en' ? 'fw-bold' : ''}`}>EN</a>
                    <span className="mx-2">|</span>
                    <a href='/set/language?lang=de' className={`text-decoration-none ${lang === 'de' ? 'fw-bold' : ''}`}>DE</a>
                </div>
            </div>
        </section>
    );
}