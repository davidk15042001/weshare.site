import React, { useEffect } from 'react';
import Guest from '@/Layouts/Guest';
import CheckoutForm from '@/Components/CheckoutForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { translate } from '@/Helpers';


export default function AccountPayment(props) {
    // const stripePromise = loadStripe(props.pk);
    const options = {
        clientSecret: props.sk,
    };
    useEffect(() => {
        console.log('sk', props.sk);
    },[props.sk]);
    useEffect(() => {
        console.log('direct', props.direct);
    },[props.direct]);
    return (
        <>
        {props.direct == true  ? (
            <div className='row justify-content-center'>
                <div className='col-lg-6 pt-5'>
                    <div className='d-flex justify-content-between align-items-center mb-5'>
                        <h5>{translate('Add Payment Method')}</h5>
                        <a href={route('logout')}>{translate('Logout')} <i className='bi bi-arrow-right'></i></a>
                    </div>
                    <Elements stripe={loadStripe(props.pk)} options={options}>
                        <CheckoutForm />
                    </Elements>
                </div>
            </div>
        ):(
            <Elements stripe={loadStripe(props.pk)} options={options}>
                <CheckoutForm />
            </Elements>
        )}
        </>
    );

}