<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Service\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use NumberFormatter;

class SiteController extends Controller
{
    //
    public function plans(Request $request, ProductService $product, $interval = 'yearly')
    {
        if($request->user()){
            return redirect()->route('subscriptions.index', ['interval' => $interval]);
        }
        $currency = getenv('CASHIER_CURRENCY', 'EUR');
        $locale = getenv('CASHIER_CURRENCY_LOCALE', 'de_DE');

        $formatter = new NumberFormatter($locale, NumberFormatter::CURRENCY);
        $plans = [];

        $free = Plan::where('slug', 'free')->first();
        if($free){
            $free->fprice = $formatter->formatCurrency($free->price, $currency);
            $plans[] = $free;
        }
        $pro = Plan::where('slug', 'pro-'.['monthly' => 'month', 'yearly' => 'year'][$interval])->first();
        if($pro){
            $pro->fprice = $formatter->formatCurrency($pro->price, $currency);
            $pro->popular = true;
            $plans[] = $pro;
        }
        $enterprise = Plan::where('slug', 'enterprise')->first();
        if($enterprise){
            $enterprise->fprice = $formatter->formatCurrency($enterprise->price, $currency);
            $plans[] = $enterprise;
        }
        return Inertia::render('Plans', [
            'authenticated' => Auth::check(),
            'plans' => $plans,
            'interval' => $product->intervals[$interval],
            'route' => 'site.plans'
        ]);

    }
}
