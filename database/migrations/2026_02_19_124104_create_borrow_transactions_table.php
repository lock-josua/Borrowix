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
        Schema::create('borrow_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('borrow_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('borrower_id')->constrained('users')->cascadeOnDelete();   // the student
            $table->foreignId('equipment_id')->constrained()->cascadeOnDelete();

            // Staff who released the equipment
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            // Staff who received the return
            $table->foreignId('returned_to')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamp('issued_at');
            $table->datetime('due_date');
            $table->timestamp('returned_at')->nullable();

            $table->enum('status', ['active', 'returned', 'overdue'])->default('active');

            // Pro plan: penalty / fine tracking
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->text('fine_reason')->nullable();

            // Pro plan: condition on return
            $table->text('return_condition_notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrow_transactions');
    }
};