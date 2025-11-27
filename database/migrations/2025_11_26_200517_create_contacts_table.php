<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::connection('backoffice')->create('contacts', function (Blueprint $table) {
            $table->id('uid');
            $table->string('email')->unique();
            $table->string('password');
            $table->string("firstname")->nullable();
            $table->string("lastname")->nullable();
            $table->string("company")->nullable();
            $table->string('invoice_email')->nullable();
            $table->boolean('active')->default(1);
            $table->unsignedBigInteger('buid')->default(0);
            $table->boolean('customer')->default(1);
            $table->boolean('branch')->default(0);
            $table->boolean('archive')->default(0);
            $table->timestamp('registered')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('backoffice')->dropIfExists('contacts');
    }
};
