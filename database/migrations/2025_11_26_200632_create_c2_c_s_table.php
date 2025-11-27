<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::connection('backoffice')->create('c2c', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cuid');   // company contact ID
            $table->unsignedBigInteger('cuid2');  // user contact ID
            $table->timestamps();

            $table->foreign('cuid')->references('uid')->on('contacts')->onDelete('cascade');
            $table->foreign('cuid2')->references('uid')->on('contacts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::connection('backoffice')->dropIfExists('c2c');
    }
};
