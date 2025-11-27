<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use App\Mail\SendWelcome;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class PlanController extends Controller
{
    //

    public function show(Request $request, $plan_id){
        $plan = Plan::find($plan_id);
        if(!empty($plan->stripe_plan)){
            $success = route('dashboard').'?session_id={CHECKOUT_SESSION_ID}';
            $cancel = route('site.plans', ['cancelled' => true]);
            return $request->user()
                ->newSubscription($plan->id, $plan->stripe_plan)
                ->allowPromotionCodes()
                ->trialDays(!empty($plan->trial) ? $plan->trial+1 : 0)
                ->quantity(3)
                ->checkout([
                    'payment_method_types' => ['card', 'sofort', 'sepa_debit'],
                    'success_url'=>$success,
                    'cancel_url'=>$cancel,
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
