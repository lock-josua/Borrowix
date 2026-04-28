<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();

            // Type of event — used for icon/color rendering on frontend
            $table->string('event_type');

            // Human-readable description shown in the activity feed
            $table->string('description');

            // Which tenant this event relates to (nullable for platform-level events)
            $table->string('tenant_id')->nullable();
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->nullOnDelete();

            // Who triggered the event
            $table->string('actor')->default('system');

            // Extra context (optional)
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index('event_type');
            $table->index('created_at');
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
