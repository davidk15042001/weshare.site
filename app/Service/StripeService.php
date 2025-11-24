<?php
namespace App\Service;

use stdClass;
use Stripe\StripeClient;

class StripeService {

    public $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(env('STRIPE_SK'));
    }

    public function createCustomer($email, $name = ''){
        return $this->stripe->customers->create([
            'email' => $email,
            'name' => $name
        ]);

    }

    public function setupIntent($identifier, $types = ['card']){
        $intent = $this->stripe->setupIntents->create([
            'customer' => $identifier,
            'payment_method_types' => $types,
        ]);

        session()->put('intent', $intent);

        return $intent;

    }

    public function paymentCallback($intent){

        $intent = $this->stripe->setupIntents->retrieve($intent);
        $payment = null;
        if(!empty($intent->payment_method)){
            $payment = $this->stripe->paymentMethods->retrieve($intent->payment_method);
        }
        return $payment;
    }

    public function detachPaymentMethod($id){
        $this->stripe->paymentMethods->detach($id);
    }

}