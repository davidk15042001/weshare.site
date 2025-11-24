<?php

namespace App\Console\Commands;

use App\Models\Card;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearTestAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deploy:reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear Test Accounts';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $plans = Plan::where('slug', 'like', '%-old%')->get();
        foreach($plans as $plan){
            if(DB::connection('backoffice')->table('products')->where('uid', $plan->product_uid)->exists()){
                DB::connection('backoffice')->table('products')->where('uid', $plan->product_uid)->delete();
            }
            $plan->delete();
            echo $plan->name . " deleted...".PHP_EOL;
        }
        $proMonthly = Plan::where('slug', 'pro-month')->first();
        if($proMonthly){
            $proMonthly->stripe_plan = 'price_1MaD1TDYLRukPQODeahpSjze';
            $proMonthly->save();
        }
        $proYearly = Plan::where('slug', 'pro-year')->first();
        if($proYearly){
            $proYearly->stripe_plan = 'price_1MaD1TDYLRukPQODBxOibjcv';
            $proYearly->save();
        }
        $users = User::withTrashed()->get();
        foreach($users as $user){
            $c = DB::connection('backoffice')->table('contacts')->where('uid', $user->contact)->first();
            if($c){
                DB::connection('backoffice')->table('billevents')->where('cuid', $c->uid)->delete();
                DB::connection('backoffice')->table('con_group')->where('cuid', $c->uid)->delete();
                DB::table('payment_methods')->where('user_id', $user->id)->delete();
            }

            $canDelete = true;

            $skip = [
                'Karim.hyahia+3@gmail.com',
                'info@lokalxperten.de',
                'info@businesstour360.de',
                'h.nikisch.hn@gmail.com',
                'guidogrewe@web.de',
                'haraldnikisch@lokalxperten.de',
                'ml@d3.net',
                'muehlbachmichael@gmail.com',
                'booking@noue-macrame.de',
                'ceciliaunertl1@gmail.com',
                'anjasteinbeck49@gmail.com',
                'anja.steinbeck@freenet.de',
            ];
            if(in_array($user->email, $skip)) $canDelete = false;
            $cards = DB::table('cards')->where('user_id', $user->id)->get();
            foreach($cards as $card){
                if(!empty($card->deleted_at) || $canDelete){
                    DB::table('card_services')->where('card_id', $card->id)->delete();
                    DB::table('card_projects')->where('card_id', $card->id)->delete();
                    DB::table('card_documents')->where('card_id', $card->id)->delete();
                    DB::table('card_custom_codes')->where('card_id', $card->id)->delete();
                    DB::table('card_custom_codes')->where('card_id', $card->id)->delete();
                    DB::table('call_backs')->where('card_id', $card->id)->delete();
                    DB::table('analytics')->where('card_id', $card->id)->delete();
                    DB::table('cards')->where('id', $card->id)->delete();
                }
            }
            //Delete subscription items 
            DB::table('subscription_items')->truncate();
            DB::table('subscriptions')->truncate();

            if($canDelete){
                DB::table('card_covers')->where('user_id', $user->id)->delete();
                if($c) DB::connection('backoffice')->table('contacts')->where('uid', $c->uid)->delete();

                DB::table('users')->where('id', $user->id)->delete();
                echo $user->name . "(".$user->email.") deleted...".PHP_EOL;
            }else{
                $user->identifiers = json_encode([]);
                $user->stripe_id = null;
                $user->save();
            }
        }
    }
}
