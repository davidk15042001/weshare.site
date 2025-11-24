<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Service\StripeService;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    //
    public function create(Request $request){
        $plan = Plan::find($request->user()->product);
        if(!$plan) return abort(404);

        $success = route('dashboard');
        $cancel = route('site.plans', ['success' => false]);
        return $request->user()
            ->newSubscription($plan->slug, $plan->stripe_plan)
            ->checkout([
                'payment_method_types' => ['card', 'sofort', 'sepa_debit'],
                'success_url'=>$success,
                'cancel_url'=>$cancel,
            ]);
        // dd('aha');
        // // $session = $request->session()->pull('intent');
        // if($form && PaymentMethod::where('user_id', auth()->id())->where('status', 'attached')->exists()) return redirect()->route('dashboard');

        // $identifiers = (object) json_decode($request->user()->identifiers);

        // $new = false;
        // if(empty($identifiers->stripe)){
        //     $customer = $stripeService->createCustomer($request->user()->email, $request->user()->name);
        //     $new = true;
        // }else{
        //     $customer = $stripeService->stripe->customers->retrieve($identifiers->stripe);
        //     if(!$customer || ($customer && $customer->deleted)){
        //         $customer = $stripeService->createCustomer($request->user()->email, $request->user()->name);
        //         $new = true;
        //     }
        // }
        // $identifiers->stripe = $customer->id;
        // if($new) User::where('id', $request->user()->id)->update(['identifiers' => json_encode($identifiers)]);

        // if($request->session()->has('intent')) $intent = $request->session()->get('intent');
        // else $intent = $stripeService->setupIntent($identifiers->stripe);
        
        // if(empty($intent->client_secret)){ 
        //     Log::critical('Payment method setup is not working');
        //     return abort(410);
        // }

        // if($form){
        //     return Inertia::render('Auth/AccountPayment', [
        //         'pk' => env('STRIPE_PK'),
        //         'sk' => $intent->client_secret,
        //         'direct' => true
        //     ]);
        // }else{
        //     return response()->json([
        //         'pk' => env('STRIPE_PK'),
        //         'sk' => $intent->client_secret,
        //     ]);
        // }

    }

    public function store(Request $request, StripeService $stripeService){
        if(!$request->has('setup_intent')) return abort(410);

        $payment = $stripeService->paymentCallback($request->setup_intent);

        $session = $request->session()->pull('intent');
        

        if(empty($payment)) return abort(422);

        $default = PaymentMethod::where('user_id', $request->user()->id)->count() == 0 ? true : false;

        if(!PaymentMethod::where('user_id', $request->user()->id)->where('external_id', $payment->id)->exists()){
            $pm = new PaymentMethod();
            $pm->user_id = $request->user()->id;
            $pm->external_id = $payment->id;
            $pm->name = $request->user()->name;
            $pm->number = $payment->card->last4;
            $pm->expires = $payment->card->exp_month.'/'.$payment->card->exp_year;
            $pm->type = $payment->type;
            $pm->gateway = 'stripe';
            $pm->default = $default;
            $pm->save();
        }


        return redirect()->route('account.settings', '#subscriptions');

    }

    public function update(Request $request, PaymentMethod $paymentmethod){

        if($request->has('default')){
            $paymentmethod->default = $request->default;
        }
        $paymentmethod->save();

        return redirect()->route('account.settings', '#subscriptions');

    }

    public function destroy(PaymentMethod $paymentmethod, StripeService $stripeService)
    {
        $stripeService->detachPaymentMethod($paymentmethod->external_id);
        $paymentmethod->status = 'detached';
        $paymentmethod->default = 0;
        $paymentmethod->save();

        if(!Paymentmethod::where('user_id', auth()->id())->where('status', 'attached')->where('default', 1)->exists()){
            $pm = Paymentmethod::where('user_id', auth()->id())->where('status', 'attached')->first();
            if($pm){
                $pm->default = 1;
                $pm->save();
            }
        }

        return response()->json(['message' => translate('Payment method successfully removed.')]);
    }
}
