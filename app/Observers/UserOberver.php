<?php

namespace App\Observers;

use App\Models\User;
use App\Service\ProductService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Plan;

class UserOberver
{

    /**
     * Handle the User "created" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function creating(User $user)
    {
        $plan = Plan::find($user->product);
        if(empty($plan)) {
            $plan = Plan::where('slug', 'free')->first();
        }
        $user->identifiers = json_encode([]);
        
        $g = ['WeShare Member'];
        if ($plan->slug != 'enterprise') {
            $g[] = 'WeShare Customer';
        }
        $groups = DB::connection('backoffice')->table('contactgroups')->whereIn('name', $g)->get();
        $branch = DB::connection('backoffice')->table('contacts')->where('branch', 1)->where('archive', 0)->first();

        $contact = DB::connection('backoffice')->table('contacts')->where('email', $user->email)->first();
        if (!$contact) {
            $user->contact = DB::connection('backoffice')->table('contacts')->insertGetId([
                'email' => $user->email,
                'password' => $user->password,
                'invoice_email' => $user->email,
                'active' => 1,
                'buid' => $branch ? $branch->uid : 0,
                'customer' => 1,
                'registered' => date('Y-m-d H:i:s'),
            ]);
            foreach ($groups as $group) {
                DB::connection('backoffice')->table('con_group')->insert([
                    'groupuid' => $group->uid,
                    'cuid' => $user->contact,
                ]);
            }

            if($plan->slug == 'enterprise') {
                $company = DB::connection('backoffice')->table('c2c')->where('cuid2', Auth::user()->contact)->first();
                DB::connection('backoffice')->table('c2c')->insert([
                    'cuid' => $company->cuid,
                    'cuid2' => $user->contact,
                ]);
                $user->enterprise_id = $company->cuid;
            }

        } else {
            $user->contact = $contact->uid;
            
            if($plan->slug == 'enterprise') {
                $company = DB::connection('backoffice')->table('c2c')->where('cuid2', Auth::user()->contact)->first();
                DB::connection('backoffice')->table('c2c')->insert([
                    'cuid' => $company->cuid,
                    'cuid2' => $user->contact,
                ]);
                $user->enterprise_id = $company->cuid;

                foreach ($groups as $group) {
                    DB::connection('backoffice')->table('con_group')->insert([
                        'groupuid' => $group->uid,
                        'cuid' => $user->contact,
                    ]);
                }
            }
        }
    }

    /**
     * Handle the User "updated" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function deleted(User $user)
    {
        //
    }

    /**
     * Handle the User "restored" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function restored(User $user)
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function forceDeleted(User $user)
    {
        //
    }
}
