import React from 'react';
import { translate, getCookie } from '@/Helpers';
import { Link } from '@inertiajs/inertia-react';
import IconButton from '@/Components/IconButton';
import parse from 'html-react-parser'
import { usePage } from "@inertiajs/inertia-react";

export default function SubscriptionCard({interval, isPlan, plan, authenticated, className}) {
    const { domain, protocol } = usePage().props;

    console.log('isPlan', isPlan, plan)

    const ContactButton = () => {
        let lang = getCookie("locale");
        if (lang == null) lang = "en";
        const url = `${protocol}://${domain}/${lang}/contact/`;
        return (
            <a href={url} target="_blank" className="w-100 btn btn-lg btn-danger d-flex justify-content-between align-items-center py-2 px-3">
                {translate('CONTACT NOW')}
                <IconButton width={40} height={10} icon='/assets/svg/arrow_right.svg' />
            </a>
        )
    }
    return (
        <div className={`${((plan.popular && isPlan) || (authenticated && plan.current)) ? 'bg-blue-50 text-white' : 'bg-white'} subscription-card w-100 ${className}`}>
            <div className='p-5 pb-4 bg-transparent' style={{border:0}}>
                <div>
                    <div><h2 className='fw-bold'>{plan.name}</h2></div>
                    <div>{translate(plan.description)}</div>

                    {(typeof plan.price !== 'undefined' && plan.slug.toLowerCase() !== 'enterprise') ? (
                        <>
                            <div className='fs-4 mt-4 d-flex align-items-center'>
                                <span className='fw-bold'>{plan.fprice}</span>
                            </div>
                            <div><h5 className='fw-normal'>{translate('User')} / {interval}</h5></div>
                            {plan.trial && plan.trial > 0 && (
                                <div className='fs-sm mt-2 text-secondary fst-italic'><b>{plan.trial}</b> <span className='fw-light'>{translate('days trial period')}</span></div>
                            )}
                        </>
                    ) : (
                        <div className={`fs-4 ${isPlan ? 'mt-5 mb-4' : 'mt-4 mb-3'} d-flex align-items-center`}>
                            <span className='fw-bold'>{translate('On Request')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className='pt-0 pb-3 px-5 d-flex justify-content-center card-footer bg-transparent border-0'>
                {authenticated ? (
                    <>
                        {plan.current ? (
                            <div class="w-100 d-flex align-items-center"><i className='fs-3 bi bi-stars me-2 text-danger'></i>{translate('Current Plan')}</div>
                        ) : plan.slug.toLowerCase() === 'enterprise' ? (
                                <ContactButton />
                            ) : (
                                <form className='w-100' method="POST" action={route('subscriptions.store')}>
                                    <input type="hidden" value={csrf_token} name="_token" />
                                    <input type="hidden" value={plan.id} name="product" />
                                    <p>{plan.current}</p>
                                    <button type="submit" className='w-100 btn btn-lg btn-danger d-flex justify-content-between align-items-center py-2 px-3'>
                                        {translate('Choose Plan').toUpperCase()}
                                        <IconButton width={40} height={10} icon='/assets/svg/arrow_right.svg' />
                                    </button>
                                </form>
                            )
                        }
                    </>
                ): plan.slug.toLowerCase() === 'enterprise' ? (
                        <ContactButton />
                    ) : (
                        <Link href={route('register')} data={{plan: plan.id}} className="w-100 btn btn-lg btn-danger d-flex justify-content-between align-items-center py-2 px-3">
                            {translate('Choose Plan').toUpperCase()}
                            <IconButton width={40} height={10} icon='/assets/svg/arrow_right.svg' />
                        </Link>
                    )
                }
            </div>

            <div className='card-body p-5 pt-2'>
                {parse(plan.description)}
            </div>
        </div>
    );
}
