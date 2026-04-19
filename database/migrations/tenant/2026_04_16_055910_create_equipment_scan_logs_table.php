<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_scan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('qr_token_scanned');
            $table->enum('result', ['success', 'not_found', 'unavailable', 'already_borrowed', 'already_requested']);
            $table->string('failure_reason')->nullable();
            $table->ipAddress('ip_address');
            $table->timestamp('scanned_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_scan_logs');
    }
};
