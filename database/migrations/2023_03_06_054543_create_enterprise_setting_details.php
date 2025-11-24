<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEnterpriseSettingDetails extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('enterprise_setting_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enterprise_id')->nullable();
            $table->string('avatar')->nullable();
            $table->string('logo')->nullable();
            $table->json('cover')->nullable();
            $table->json('socials')->nullable();
            $table->json('services')->nullable();
            $table->json('galleries')->nullable();
            $table->json('projects')->nullable();
            $table->json('documents')->nullable();
            $table->json('custom_codes')->nullable();
            $table->json('settings')->nullable();
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
        Schema::dropIfExists('enterprise_setting_details');
    }
}
