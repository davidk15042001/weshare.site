<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Plan;
use App\Service\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use NumberFormatter;
use stdClass;
use App\Mail\SendWelcome;
use Illuminate\Support\Facades\Mail;

class DashboardController extends Controller
{
    public function show(Request $request){
        if($request->has('session_id')) {
            $data = [
                "name" => $request->user()->name,
                "email" => $request->user()->email,
                "plan" => 'pro'
            ];
            Mail::to($request->user()->email)->send(new SendWelcome($data));
        }

        // if($request->has('session_id')){
        //     $checkout = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

        //     if($checkout->mode == 'subscription'){
        //         $stripeSubscription = $request->user()->stripe()->subscriptions->retrieve($checkout->subscription);
        //         $plan = Plan::find($request->user()->product);
        //         $firstItem = $stripeSubscription->items->first();
        //         $isSinglePrice = $stripeSubscription->items->count() === 1;
        //         $existingSubscription = $request->user()->subscriptions()->where('stripe_id', $stripeSubscription->id)->first();

        //         if (!$existingSubscription) {
        //             $subscription = $request->user()->subscriptions()->create([
        //                 'name' => $plan->name,
        //                 'stripe_id' => $stripeSubscription->id,
        //                 'stripe_status' => $stripeSubscription->status,
        //                 'stripe_price' => $isSinglePrice ? $firstItem->price->id : null,
        //                 'quantity' => $isSinglePrice ? ($firstItem->quantity ?? null) : null,
        //                 'trial_ends_at' => $stripeSubscription->trial_end,
        //                 'ends_at' => null,
        //             ]);

        //             foreach ($stripeSubscription->items as $item) {
        //                 $subscription->items()->create([
        //                     'stripe_id' => $item->id,
        //                     'stripe_product' => $item->price->product,
        //                     'stripe_price' => $item->price->id,
        //                     'quantity' => $item->quantity ?? null,
        //                 ]);
        //             }
        //         }
        //     }
        // }

        $cards = Card::where('user_id', $request->user()->id)->get();
        return Inertia::render('Dashboard', [
            'cards' => $cards,
        ]);
    }

}
