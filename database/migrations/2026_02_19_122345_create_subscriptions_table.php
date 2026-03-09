<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();

            $table->enum('plan', ['free', 'basic', 'pro'])->default('free');
            $table->enum('status', ['active', 'trialing', 'past_due', 'canceled', 'paused'])->default('active');
            $table->enum('billing_cycle', ['monthly', 'annual'])->default('monthly');

            // Gateway subscription IDs
            $table->string('stripe_subscription_id')->nullable();
            $table->string('paymongo_subscription_id')->nullable();

            // Promo / discount
            $table->foreignId('promo_code_id')->nullable()->constrained('promo_codes')->nullOnDelete();
            $table->decimal('discount_amount', 10, 2)->default(0);

            // Billing period
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('grace_period_ends_at')->nullable();

            // Payment method on file (display only)
            $table->string('card_brand')->nullable();
            $table->string('card_last_four')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
