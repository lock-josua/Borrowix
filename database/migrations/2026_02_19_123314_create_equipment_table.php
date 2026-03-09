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
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->string('description')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('model')->nullable();
            $table->string('brand')->nullable();

            // Total units of this equipment in the school
            $table->unsignedInteger('quantity')->default(1);
            // Units currently available for borrowing
            $table->unsignedInteger('available_quantity')->default(1);

            $table->enum('status', ['available', 'borrowed', 'under_repair', 'reserved', 'retired'])
                ->default('available');

            // QR code (Basic+ plan)
            $table->string('qr_code')->nullable()->unique();

            // Condition / damage notes (Pro plan)
            $table->text('condition_notes')->nullable();
            $table->string('damage_photo')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
