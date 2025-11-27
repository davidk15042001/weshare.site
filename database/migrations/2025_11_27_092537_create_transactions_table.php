<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string("transaction_type")->nullable();
            $table->string("stripe_plan")->nullable();
            $table->string('transaction_code')->unique();
            $table->string("transaction_source", 100)->nullable();
            $table->string('gateway')->nullable(); // paystack, flutterwave, stripe, paypal
            $table->string('gateway_reference')->nullable(); // returned reference from gateway
            $table->decimal('amount', 10, 2);
            $table->integer("quantity")->default(1);
            $table->string("narration")->nullable();
            $table->decimal("vat", 10, 2)->default(0);
            $table->decimal("tax", 10, 2)->default(0);
            $table->string('currency', 10)->default('EUR');
            $table->enum('status', ['pending', 'success', 'failed', 'cancelled'])
                  ->default('pending');
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
