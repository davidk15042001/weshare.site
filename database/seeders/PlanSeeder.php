<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $plans = [
            // [
            //     'name' => 'Vi-Site Enterprise', 
            //     'slug' => 'enterprise', 
            //     'stripe_plan' => '', 
            //     'price' => 0, 
            //     'description' => 'For your teams or companies. Create unlimited Vi-Sites',
            //     'period' => ''
            // ],
            // [
            //     'name' => 'Vi-Site Free', 
            //     'slug' => 'free', 
            //     'stripe_plan' => '', 
            //     'price' => 0, 
            //     'description' => 'For the basics, to introduce yourself very simply',
            //     'period' => ''
            // ],
            // [
            //     'name' => 'Vi-Site Yearly', 
            //     'slug' => 'pro-year', 
            //     'stripe_plan' => 'price_1MXIR6DYLRukPQODWo3S1hhW', 
            //     'price' => 47, 
            //     'description' => 'Share your services, projects, reviews quickly & easily',
            //     'period' => 'year',
            //     'trial' => 14
            // ],
            [
                'name' => 'Yearly', 
                'slug' => 'pro-year', 
                'stripe_plan' => 'price_1MaBXiDYLRukPQODBKJsrYVm', 
                'price' => 47, 
                'description' => 'Share your services, projects, reviews quickly & easily',
                'period' => 'year',
                'trial' => 14
            ],
        ];

        $gname = env('APP_PRODUCT', 'WeShare Site');
        $group = DB::connection('backoffice')->table('product_groups')->where('properties->name->def', $gname)->first();
        if(!$group) die("Please setup group with a default name \"{$gname}\"".PHP_EOL);
  
        foreach ($plans as $plan) {
            $product = DB::connection('backoffice')->table('products')->where('groupuid', $group->uid)->where('properties->slug', $plan['slug'])->first();
            if(!$product){
                $productuid = DB::connection('backoffice')->table('products')->insertGetId([
                    'properties' => json_encode([
                        'name' => ['def' => $plan['name']],
                        'stripe' => $plan['stripe_plan'],
                        'slug' => $plan['slug'],
                        'sales_prices' => ['EUR' => $plan['price']],
                        'details' => ['def' => $plan['description']],
                        'period' => $plan['period']
                    ])
                ]);
            }else $productuid = $product->uid;
            $plan['product_uid'] = $productuid;
            Plan::create($plan);
        }
    }
}
