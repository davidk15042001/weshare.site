<?php

namespace App\Http\Middleware;

use App\Models\Card;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;
use App\Models\Plan;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request)
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request)
    {
        return array_merge(parent::share($request), [
            'appname' => env('APP_NAME'),
            'domain' => env('APP_DOMAIN'),
            'protocol' => env('APP_PROTOCOL'),
            'auth' => function() use ($request) {
                $return = [];
                $user = $request->user();
                $subscription = null;
                $siteAdmin = false;
                if($user) {
                    $card = $user->cards->where('primary', true)->first();
                    if ($card) $user->avatar = $card->avatar;
                    else $user->avatar = asset('/assets/svg/no-profile.svg');
                    $user->unsetRelation('cards');
                    if(!empty($user->product)) $subscription = $request->user()->subscriptions()->active()->first();
                    $siteAdmin = DB::connection('backoffice')->table('contacts')
                                ->leftJoin('con_group', 'con_group.cuid','=', 'contacts.uid')
                                ->leftJoin('contactgroups', 'contactgroups.uid', '=', 'con_group.groupuid')
                                ->where('contactgroups.name', 'WeShare Admin')
                                ->where('contacts.uid', $request->user()->contact)
                                ->exists();
                }
                $return['user'] = $user;
                $return['subscription'] = $subscription;
                $return['siteAdmin'] = $siteAdmin;

                if(!$user && !empty($request->identifier)){
                    $card = Card::where('identifier', $request->identifier)->first();
                    $user = User::find($card->user_id);
                    if(!empty($user->product)) $subscription = $user->subscriptions()->active()->first();
                }

                $return['plan'] = function() use($user, $subscription){
                    if($user && !empty($user->product)) {
                        $plan = Plan::find($user->product);
                        if($plan){
                            if(substr($plan->slug, 0, 3) == 'pro'){
                                if(!empty($subscription)) return 'pro';
                                else return 'free';
                            }else return $plan->slug;
                        }else{
                            return 'free';
                        }
                    }
                    return 'free'; 
                };

                return $return;

            },
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
        ]);
    }
}
