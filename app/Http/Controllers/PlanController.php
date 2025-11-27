<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use App\Mail\SendWelcome;
use App\Models\Transaction;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class PlanController extends Controller
{
    //

    public function show(Request $request, $plan_id){
        $plan = Plan::find($plan_id);
        if(!empty($plan->stripe_plan)){
            $transaction = Transaction::create([
                'user_id'           => auth()->id(),
                'plan_id'           => $plan->id,
                'transaction_code'  => generateTransactionCode(),
                'gateway'           => 'stripe',
                'amount'            => $plan->price,
                'narration' => $plan->period. " Subscription",
                "transaction_source" => "subscription",
                "stripe_plan" => $plan->stripe_plan,
                'quantity' => $request->input("quantity", 1),
                'currency'          => 'EUR',
                'status'            => 'pending',
                'meta'              => [
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ],
            ]);
            $success = route('dashboard').'?session_id={CHECKOUT_SESSION_ID}';
            $cancel = route('site.plans', ['cancelled' => true]);
            return $request->user()
                ->newSubscription($plan->id, $plan->stripe_plan)
                ->allowPromotionCodes()
                ->trialDays(!empty($plan->trial) ? $plan->trial+1 : 0)
                ->quantity($request->get("quantity", 1))
                ->checkout([
                    'payment_method_types' => ['card', 'sofort', 'sepa_debit'],
                    'success_url'=>$success,
                    'cancel_url'=>$cancel,
                    'metadata' => [
                        "transaction_id" => $transaction->id
                    ],
                    'subscription_data' => [
                        'metadata' => [
                            "transaction_id" => $transaction->id
                        ],
                    ],
                ]);
        }else{
            $data = [
                "name" => $request->user()->name,
                "email" => $request->user()->email,
                "plan" => 'free'
            ];

            Mail::to($request->user()->email)->send(new SendWelcome($data));
            return redirect()->route('dashboard');
        }
    }

}
