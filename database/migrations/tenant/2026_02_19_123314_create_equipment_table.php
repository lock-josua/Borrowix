<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            // school_id REMOVED
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('model')->nullable();
            $table->string('brand')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('available_quantity')->default(1);
            $table->enum('status', ['available', 'borrowed', 'under_repair', 'reserved', 'retired'])
                ->default('available');
            $table->string('qr_code')->nullable()->unique();
            $table->text('condition_notes')->nullable();
            $table->string('damage_photo')->nullable();
            // image        — primary display photo (Cloudinary URL, uploaded via equipment form)
            // damage_photo — photo captured during return when damage is reported (Cloudinary URL)
            $table->string('image')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
