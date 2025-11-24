<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangeAccountRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Models\Card;
use App\Models\CardCover;
use App\Models\CardCustomCode;
use App\Models\CardGallery;
use App\Models\CardDocument;
use App\Models\CardProject;
use App\Models\CardService;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\User;
use App\Service\ProductService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Cashier\Subscription;
use NumberFormatter;
use stdClass;
use Stripe\StripeClient;
use Illuminate\Support\Facades\Auth;

class AccountSettingsController extends Controller
{

    // public function settings(Request $request) {
    //     $card = Card::where('user_id', $request->user()->id)->first();
    //     return Inertia::render('Account/Settings', [
    //         'card' => $card
    //     ]);
    // }

    // public function subscription(Request $request) {
    //     $card = Card::where('user_id', $request->user()->id)->first();
    //     $paymentmethods = PaymentMethod::where('user_id', $request->user()->id)->get();
    //     $subscription = DB::connection('backoffice')->table('products')->where('uid', $request->user()->product)->first();

    //     return Inertia::render('Account/Subscription', [
    //         'card' => $card,
    //         'paymentmethod' => $paymentmethods,
    //         'subscription' => $subscription,
    //         'payme'
    //     ]);
    // }


    public function settings(Request $request)
    {
        $card = Card::where('user_id', $request->user()->id)->first();
        $lastbill = new stdClass;
        $subscription = $request->user()->subscriptions()->active()->first();

        if($subscription){
            $subscription->plan = Plan::find($subscription->name);
            if($subscription->plan){
                $subscription->plan->fprice = (new NumberFormatter('en_US', NumberFormatter::CURRENCY))->formatCurrency((float)$subscription->plan->price, 'EUR');
            }
        }

        // $subscription = DB::connection('backoffice')
        //     ->table('billevents')
        //     ->leftJoin('products', 'products.uid', '=', 'billevents.puid')
        //     ->select('products.properties', 'billevents.*')
        //     ->where('billevents.uid', $request->user()->subscription)->first();
        $payments = [];
        /*if ($subscription) {
            $payments = DB::connection('backoffice')
                ->table('session_pos as sp1')
                ->leftJoin('sessions as s', 's.uid', '=', 'sp1.sessuid')
                ->leftJoin('session_pos as sp2', 'sp2.sessuid', '=', 's.uid')
                ->select('sp1.*', 's.number', DB::raw('SUM(sp2.amount) as amount'))
                ->where('sp1.sessuid2', $subscription->uid)
                ->orderBy('s.date', 'DESC')
                ->groupBy('s.uid')
                ->get();

            $properties = json_decode($subscription->properties);
            $price = !empty($properties->sales_prices->{'EUR'})  ? $properties->sales_prices->{'EUR'} : '';
            $subscription->info = !empty($properties->description->def) ? $properties->description->def : '';
            // dd($properties->info);

            $subscription->interval = $properties->Interval;
            $subscription->price = (new NumberFormatter('en_US', NumberFormatter::CURRENCY))->formatCurrency((float)$price, 'EUR');
            $subscription->started = false;

            $subscription->nextbill = $subscription->deactivation = '';

            if ($subscription->enddate != '0000-00-00' || empty($subscription->enddate)) {
                $subscription->deactivation = date('M d, Y', strtotime($subscription->enddate));
            } else {
                if (date('Ymd') <= date('Ymd', strtotime($subscription->startdate))) {
                    $subscription->tobill = $subscription->startdate;
                } else {
                    $lastbill = !empty($payments[0]) ? $payments[0] : null;
                    if (!empty($lastbill) && !empty($lastbill->date) && $lastbill->date != '0000-00-00') {
                        $subscription->started = true;
                        switch ($subscription->interval) {
                            case 'month':
                                $subscription->tobill = date('Y-m-d', strtotime("$lastbill->date + 1 month"));
                                break;
                            case 'year':
                                $subscription->tobill = date('Y-m-d', strtotime("$lastbill->date + 1 year"));
                                break;
                        }
                    } else {
                        $subscription->tobill = $subscription->startdate;
                    }
                }
                $subscription->nextbill = date('M d, Y', strtotime($subscription->tobill));
            }
        }*/

        $paymentmethods = $request->user()->paymentmethods();
        // $stripe = new StripeClient(env('STRIPE_SK'));
        // $paymentmethods = PaymentMethod::where('user_id', $request->user()->id)->where('status', 'attached')->get();
        // $paymentmethods->each(function ($paymentmethod) use ($stripe) {
        //     if (!empty($paymentmethod->external_id)) {
        //         $paymentmethod->stripe = $stripe->paymentMethods->retrieve($paymentmethod->external_id);
        //     } else {
        //         $paymentmethod->stripe = new stdClass;
        //     }
        // });

        return Inertia::render('Auth/AccountSettings', [
            'card' => $card,
            'subscription' => $subscription,
            'lastbill' => $lastbill,
            'paymentmethods' => $paymentmethods,
            'payments' => $payments
        ]);
    }
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = User::find($request->user()->id);
        $user->password = Hash::make($request->new);
        $user->save();

        return response()->json(['message' => translate('Password changed.')]);
    }
    public function changeAccount(ChangeAccountRequest $request)
    {
        $user = User::find($request->user()->id);
        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json(['message' => translate('Account changed.')]);
    }

    public function deactivate(Request $request)
    {
        try {
            $user = $request->user();
            (new ProductService())->unsubscribe($user);
            return response()->json(['status' => 'success', 'message' => translate('Account has been deativated. It will only be available until the last bill period date.')]);
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => translate('Cannot deactivate account. Please contact support.')]);
        }
    }

    public function destroy(Request $request)
    {
        try {
            DB::transaction(function () use($request) {
                $user = $request->user();
                $cardIds = Card::where('user_id', $user->id)->get()->pluck('id');

                CardCover::where('user_id', $user->id)->delete();
                CardCustomCode::whereIn('card_id', $cardIds)->delete();
                CardDocument::whereIn('card_id', $cardIds)->delete();
                CardGallery::whereIn('card_id', $cardIds)->delete();
                CardProject::whereIn('card_id', $cardIds)->delete();
                CardService::whereIn('card_id', $cardIds)->delete();

                Card::where('user_id', $user->id)->forceDelete();

                $plan = Plan::find($user->product);
                if(substr($plan->slug, 0, 3) == 'enterprise') {
                    //  if(substr($plan->slug, 0, 3) == 'pro') {
                    $request->user()->subscription($plan->id)->cancel();
                }

                User::where('id', $user->id)->forceDelete();
                DB::connection('backoffice')->table('contacts')->where('uid', $user->contact)->delete();

                Auth::logout();

                return response()->json(['status' => 'success', 'message' => translate('Account has been permanently deleted.')]);
            });
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => translate('Cannot delete account. Please contact support.')]);
        }
    }
}
