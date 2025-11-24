<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\EnterpriseSetting;
use Illuminate\Support\Facades\Auth;

class PopulateUsersWithEnterprise extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'enterprise:populate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate enterprise ids to the users';

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
        $users = User::get();

        foreach($users as $user) {
            $c2c = DB::connection('backoffice')->table('c2c')->where('cuid2', $user->contact)->first();
            if($c2c) {
                $user->enterprise_id = $c2c->cuid;
                $user->save();

                $settings = EnterpriseSetting::where('enterprise_id', $c2c->cuid)->first();
                if(!$settings) {
                    EnterpriseSetting::create(["enterprise_id" => $c2c->cuid]);
                }
            }
        }
        
        return 0;
    }
}
