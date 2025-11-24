<?php

namespace App\Service;

use Illuminate\Support\Facades\DB;
use NumberFormatter;
use stdClass;

class ProductService
{

    public $intervals;

    public function __construct()
    {
        $this->intervals = [
            'yearly' => 'year',
            'monthly' => 'month',
            'both' => 'both'
        ];
    }

    public function get($interval = 'monthly')
    {

        if (!in_array($interval, ['yearly', 'monthly', 'both'])) return abort(404);

        DB::enableQueryLog();

        $order = "CAST(JSON_EXTRACT(products.properties, '$.sales_prices.EUR') AS DECIMAL(10,2) ), JSON_EXTRACT ASC";
        $products = DB::connection('backoffice')
            ->table('products')
            ->leftJoin('product_groups', 'product_groups.uid', '=', 'products.groupuid')
            ->select('products.*')
            ->where('product_groups.properties->name->def', env('APP_PRODUCT', 'Site'))
            ->where('products.active', 1)
            ->whereIn('products.properties->Interval', [$this->intervals[$interval], 'both'])
            ->orderBy('products.properties->Business', 'ASC')
            ->orderBy('products.properties->sales_prices->EUR', 'ASC')
            ->get();
        
        $plans = [];
        $formatter = new NumberFormatter('de_DE', NumberFormatter::CURRENCY);
        $products->each(function ($product) use (&$plans, $formatter) {
            $properties = json_decode($product->properties);
            $plan = new stdClass;
            $plan->id = $product->uid;
            $plan->name = text($properties->name);
            $plan->price = price($properties->sales_prices);
            $plan->description = text($properties->webdetails);
            $plan->image = !empty($properties->image) ? $properties->image : '';
            $plan->trial = !empty($properties->Trial) ? $properties->Trial : 0;
            $plan->popular = $product->uid == 2;
            $plan->category = $properties->Category;

            $plan->fprice = $formatter->formatCurrency($plan->price, 'EUR');
            $plans[] = $plan;
        });

        return $plans;
    }

    public function subscribe(&$user)
    {
        if (!empty($user->product)) {
            $product = DB::connection('backoffice')->table('products')->where('uid', $user->product)->first();
        } else {
            $product = DB::connection('backoffice')->table('products')->where('properties->Category', 'Free')->first();
        }
        $contact = new stdClass;
        if ($user->contact > 0) $contact = DB::connection('backoffice')->table('contacts')->where('uid', $user->contact)->first();
        if (empty($contact->uid)) return; #no contacts record tied to this user

        if ($product) {
            $product->properties = json_decode($product->properties);
            $now = date('Y-m-d');
            $startdate = $now;
            if (!empty($product->properties->Trial)) {
                $startdate = date('Y-m-d', strtotime("{$startdate} + {$product->properties->Trial} days"));
            }

            $month = '';
            switch ($product->properties->Interval) {
                case 'year':
                    $month = date('n', strtotime($startdate));
                    break;
                case 'month':
                    $month = '1,2,3,4,5,6,7,8,9,10,11,12';
                    break;
            }

            $text = translate('Site') . ' ' . text($product->properties->name) . ' ' . translate('Subscription');

            # check if it has existing subscriptions
            if (DB::connection('backoffice')->table('billevents')->where('cuid', $contact->uid)->exists()) {
                $running = DB::connection('backoffice')
                    ->table('billevents')
                    ->where('cuid', $contact->uid)
                    ->where(function ($query) {
                        $query->where('enddate', '0000-00-00')
                            ->orWhereNull('enddate');
                    })
                    ->orderBy('date', 'desc')->first();

                #end the current plan running
                if ($running) DB::connection('backoffice')->table('billevents')->where('uid', $running->uid)->update(['enddate' => ($running->startdate > $now ? $running->startdate : $now)]);


                $same = DB::connection('backoffice')->table('billevents')->where('cuid', $contact->uid)->where('puid', $product->uid)->orderBy('date', 'desc')->first();
                if ($same) {
                    if ($same->startdate > $now) $startdate = $same->startdate; #trial doesn't end yet
                    else $startdate = $now; #trial already ends
                    # end the existing plan if it's not ended yet
                    if (empty($same->enddate) || $same->enddate == '0000-00-00') DB::connection('backoffice')->table('billevents')->where('uid', $same->uid)->update(['enddate' => $same->startdate]);
                }
            }

            # create billevent entry
            $subscription = [
                'status' => 'done',
                'cuid' => $contact->uid,
                'buid' => $contact->buid,
                'puid' => $product->uid,
                'date' => $now,
                'startdate' => $startdate,
                'bill' => 'f', # frequently
                'billondate' => 1,
                'qty' => 1,
                'month' => $month,
                'checkpos' => 0,
                'text' => $text
            ];

            foreach ($product->properties->sales_prices as $currency => $price) {
                if ($price > 0) {
                    $subscription['currency'] = $currency;
                    break;
                }
            }
            if (empty($subscription['currency'])) $subscription['currency'] = 'EUR';
            if (!empty($subscription)) {
                $user->subscription = DB::connection('backoffice')->table('billevents')->insertGetId($subscription);
            }
        }
    }

    public function unsubscribe($user)
    {
        $lastbill = new stdClass;
        $subscription = DB::connection('backoffice')
            ->table('billevents')
            ->leftJoin('products', 'products.uid', '=', 'billevents.puid')
            ->select('products.properties', 'billevents.*')
            ->where('billevents.uid', $user->subscription)->first();
        $payments = [];
        if ($subscription) {
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

            $subscription->interval = $properties->Interval;

            if (date('Ymd') <= date('Ymd', strtotime($subscription->startdate))) {
                $subscription->tobill = $subscription->startdate;
            } else {
                $lastbill = !empty($payments[0]) ? $payments[0] : null;
                if ($lastbill) {
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
            //end current subscription
            DB::connection('backoffice')
                ->table('billevents')
                ->where('uid', $subscription->uid)
                ->update(['enddate' => date('Y-m-d', strtotime("$subscription->tobill - 1 day"))]);
        }
    }
}
