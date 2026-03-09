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
        Schema::create('borrow_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();       // the student/staff requesting
            $table->foreignId('equipment_id')->constrained()->cascadeOnDelete();

            $table->text('purpose');
            $table->datetime('borrow_date');
            $table->datetime('expected_return_date');

            $table->enum('status', ['pending', 'approved', 'rejected', 'canceled'])
                ->default('pending');

            // Admin/staff who processed the request
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();    // approval/rejection notes
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrow_requests');
    }
};
