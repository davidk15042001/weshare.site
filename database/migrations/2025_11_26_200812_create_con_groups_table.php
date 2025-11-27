<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::connection('backoffice')->create('con_group', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('groupuid');
            $table->unsignedBigInteger('cuid');
            $table->timestamps();

            $table->foreign('groupuid')->references('uid')->on('contactgroups')->onDelete('cascade');
            $table->foreign('cuid')->references('uid')->on('contacts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::connection('backoffice')->dropIfExists('con_group');
    }
};
