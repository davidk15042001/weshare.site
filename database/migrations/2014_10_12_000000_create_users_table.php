<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contact')->nullable();
            $table->unsignedBigInteger('product')->nullable();
            $table->unsignedBigInteger('subscription')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $group = DB::connection('backoffice')->table('contactgroups')->where('name', 'Site Test Member')->first();
        if (!$group) return;
        $contacts = DB::connection('backoffice')->table('con_group')->where('groupuid', $group->uid)->get();
        foreach ($contacts as $contact) {
            DB::connection('backoffice')->table('contacts')->where('uid', $contact->cuid)->delete();
            DB::connection('backoffice')->table('con_group')->where('cuid', $contact->cuid)->delete();
        }
        Schema::dropIfExists('users');
    }
}
