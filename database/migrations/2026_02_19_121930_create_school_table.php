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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->unique();
            $table->string('logo')->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();

            // Subscription / plan
            $table->enum('plan', ['free', 'basic', 'pro'])->default('free');
            $table->enum('status', ['active', 'suspended', 'canceled'])->default('active');
            $table->string('suspension_reason')->nullable();

            // Payment gateway references
            $table->string('stripe_customer_id')->nullable();
            $table->string('paymongo_customer_id')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school');
    }
};
