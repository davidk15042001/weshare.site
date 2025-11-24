<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Plan;

class EnterpriseMiddleware
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
        $plan = Plan::find($request->user()->product);
        $siteAdmin = DB::connection('backoffice')->table('contacts')
            ->leftJoin('con_group', 'con_group.cuid','=', 'contacts.uid')
            ->leftJoin('contactgroups', 'contactgroups.uid', '=', 'con_group.groupuid')
            ->where('contactgroups.name', 'WeShare Admin')
            ->exists() ? true: false;

        if($plan->slug !== 'enterprise' || !$siteAdmin) return abort(404);

        return $next($request);
    }
}
