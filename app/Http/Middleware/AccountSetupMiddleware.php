<?php

namespace App\Http\Middleware;

use App\Models\Card;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Service\ProductService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountSetupMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if(empty($redirect) && !Card::where('user_id', $request->user()->id)->exists()) return redirect()->route('account.setup');
        if(empty($redirect) && empty($request->user()->product)) return redirect()->route('subscriptions.index');

        return $next($request);
    }
}
