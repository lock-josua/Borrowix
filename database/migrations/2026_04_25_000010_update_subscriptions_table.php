<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('subscriptions');

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();
            $table->enum('plan', ['monthly', 'annually'])->nullable();
            $table->enum('status', ['trialing', 'subscribed', 'trial_expired', 'suspended'])
                ->default('trialing');
            $table->string('paypal_subscription_id')->nullable()->unique();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->text('suspension_reason')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->boolean('trial_warning_sent')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
