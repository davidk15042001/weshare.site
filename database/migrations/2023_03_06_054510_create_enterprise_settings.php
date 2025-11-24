<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEnterpriseSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('enterprise_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enterprise_id')->nullable();
            $table->boolean('cover')->default(true);
            $table->boolean('avatar')->default(true);
            $table->boolean('logo')->default(true);
            $table->boolean('personal_info')->default(true);
            $table->boolean('services')->default(true);
            $table->boolean('socials')->default(true);
            $table->boolean('gallery')->default(true);
            $table->boolean('projects')->default(true);
            $table->boolean('custom_codes')->default(true);
            $table->boolean('google_review')->default(true);
            $table->boolean('colors')->default(true);
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
        Schema::dropIfExists('enterprise_settings');
    }
}
