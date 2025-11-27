import React from 'react';
import Authenticated from '@/Layouts/Authenticated';
import IconButton from '@/Components/IconButton';
import { Head, Link } from '@inertiajs/inertia-react';
import { translate } from '@/Helpers';
import SubscriptionCard from '@/Components/SubscriptionCard';

export default function Subscriptions(props) {

    return (
        <Authenticated>
            <Head title="Subscription" />

            <div className="container-fluid m-0 p-0 pt-8 p-lg-4 h-100 overflow-scroll">
                <div className='text-center pt-4'>
                    <h3 className='fw-bold'>{translate('Flexible')} <span className='text-danger'>{translate('Plans')}</span></h3>
                    <div className='fs-sm'>{translate('Choose a plan that works best for you and your business')}</div>
                </div>

                <div className='d-flex justify-content-center fs-sm mt-4'>
                    <div className='d-inline-block fs-sm' style={{position: 'relative'}}>
                        <span className="d-inline-block rounded-pill d-flex">
                        <a href={route('subscriptions.index', 'monthly')} className={`btn btn-sm px-3 py-1 rounded-pill ${props.interval == 'month' ? 'btn-dark':''}`}>{translate('Monthly')}</a>
                        <a href={route('subscriptions.index', 'yearly')} className={`d-flex align-items-center btn btn-sm px-3 py-1 rounded-pill ${props.interval == 'year' ? 'btn-dark':''}`}>
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
                        console.log('Subscription plans', plan);
                        return (
                            <SubscriptionCard key={plan.id} plan={plan} interval={props.interval} authenticated={true} className='mx-lg-2' />
                            // <div key={plan.id} className={`${plan.current ? 'bg-blue-50 text-white subscription-card-popular' : 'bg-white border subscription-card'} mx-2 card`}>
                            //     <div className={`p-4 d-flex align-items-center bg-transparent card-header ${!plan.current ? 'border-bottom' : ''}`} style={{
                            //         borderBottom: plan.popular ? '1px solid #041E4F' : ''
                            //     }}>
                            //         <img className='w-25' src={plan.image} />
                            //         <div className='lh-sm ms-3'>
                            //             <div className='fs-6 fw-bold'>{plan.name}</div>
                            //             {(typeof plan.price !== 'undefined' && plan.price !== 0) && (
                            //                 <div className='fs-4 d-flex align-items-center'>
                            //                     <span className='fw-bold'>{plan.fprice}</span>
                            //                     <span className='fs-sm text-secondary ms-2'> / {props.interval}</span>
                            //                 </div>
                            //             )}
                            //         </div>
                            //     </div>
                            //     <div className='card-body p-4'>
                            //         <div dangerouslySetInnerHTML={{__html: plan.description}}/>
                            //     </div>
                            //     <div className='card-footer p-4 pt-0 d-flex justify-content-center border-0 bg-transparent'>
                            //         {plan.current ? (
                            //             <div class="w-100 d-flex align-items-center"><i className='fs-3 bi bi-stars me-2 text-danger'></i>{translate('Current Plan')}</div>
                            //         ) : (
                            //         <Link href={route('subscriptions.store')} data={{product: plan.id}} method="post" as="button" type="button" className="w-100 btn btn-sm btn-danger d-flex justify-content-between align-items-center py-2 px-3">
                            //             {translate('Choose Plan')}
                            //             <IconButton width={40} height={10} icon='/assets/svg/arrow_right.svg' />
                            //         </Link>
                            //         )}
                            //     </div>
                            // </div>
                        );
                    })}
                </div>
            </div>
        </Authenticated>
    );
}
