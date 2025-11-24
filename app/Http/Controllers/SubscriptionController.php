<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeSubscriptionRequest;
use App\Http\Requests\SubscriptionRequest;
use App\Models\Plan;
use App\Service\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use NumberFormatter;
use stdClass;
use Stripe\Subscription;

class SubscriptionController extends Controller
{
    
    public function index(Request $request, ProductService $product, $interval = 'yearly'){

        $p = function() use ($request){
            $plan = Plan::find($request->user()->product);
            if($plan){
                if(substr($plan->slug, 0, 3) == 'pro'){
                    $subscription = $request->user()->subscriptions()->active()->first();
                    if($subscription) return 'pro';
                    else return 'free';
                }else return $plan->slug;
            }else{
                return 'free';
            }
        };
        
        $currency = getenv('CASHIER_CURRENCY', 'EUR');
        $locale = getenv('CASHIER_CURRENCY_LOCALE', 'de_DE');

        $formatter = new NumberFormatter($locale, NumberFormatter::CURRENCY);
        $plans = [];
        $free = Plan::where('slug', 'free')->first();
        if($free){
            $free->fprice = $formatter->formatCurrency($free->price, $currency);
            $free->current = $p() == 'free' ? true: false;
            $plans[] = $free;
        }
        $pro = Plan::where('slug', 'pro-'.['monthly' => 'month', 'yearly' => 'year'][$interval])->first();
        if($pro){
            $pro->fprice = $formatter->formatCurrency($pro->price, $currency);
            $pro->current = $p() == 'pro' ? true: false;
            $plans[] = $pro;
        }
        
        $enterprise = Plan::where('slug', 'enterprise')->first();
        if($enterprise){
            $enterprise->fprice = $formatter->formatCurrency($enterprise->price, $currency);
            $enterprise->current = $p == 'enterprise' ? true: false;
            $plans[] = $enterprise;
        }

        // $plans = $product->get($interval);
        $template = 'Subscriptions';
        if(empty($request->user()->product)) $template = 'Plans';
        // else{
        //     foreach($plans as $i => $plan){
        //         $plans[$i]->current = $request->user()->product == $plan->id ? true: false;
        //     }
        // }
        return Inertia::render($template, [
            'plans' => $plans,
            'interval' => $product->intervals[$interval],
            'authenticated' => true,
            'route' => 'subscriptions.index'
        ]);
    }

    public function show(){
        
        
    }

    public function store(SubscriptionRequest $request){
        $plan = Plan::find($request->product);
        if(!$plan) return abort(404);

        $user = $request->user();
        $user->product = $request->product;
        $user->save();

        if($plan->stripe_plan){
            $success = route('dashboard').'?session_id={CHECKOUT_SESSION_ID}';
            $cancel = $_SERVER['HTTP_REFERER'];
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
            return redirect()->route('cards.index');
        }

    }

    public function redeemCoupon(Request $request)
    {
        $plan = Plan::find($request->user()->product);
        $request->user()->subscription($plan->id)->updateStripeSubscription(['coupon' => 'yqEaHNSI']);
        // $stripeSubscription = $subscription->asStripeSubscription();

        // dd($stripeSubscription);

        // $stripeSubscription->updateStripeSubscription(['coupon' => 'yqEaHNSI']);

        return response()->json(['status'=>'success']);
    }

    public function change(ChangeSubscriptionRequest $request){

    }
}
