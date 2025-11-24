import { translate } from '@/Helpers';
import {PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [problem, setProblem] = useState(null);
  const [processing, setProcessing] = useState(false);


  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmSetup({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: route('account.payments.complete'),
      },
    });
    // console.log('result', result);

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      setProblem(result.error.message);
      // console.log(result.error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {problem !== null && (
        <div className='alert alert-danger d-flex flex-column'>
          <b>{problem}</b>
          <small>{translate('Please check the details below or try another card.')}</small>
        </div>
      )}
      <PaymentElement />
      <button disabled={processing} className='btn btn-danger rounded-5 my-4 w-100'>{translate('Submit')}</button>
    </form>
  );
};