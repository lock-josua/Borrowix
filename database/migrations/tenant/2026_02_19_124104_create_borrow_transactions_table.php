<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrow_transactions', function (Blueprint $table) {
            $table->id();
            // school_id REMOVED
            $table->foreignId('borrow_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('borrower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('equipment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('returned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('issued_at');
            $table->datetime('due_date');
            $table->timestamp('returned_at')->nullable();
            $table->enum('status', ['active', 'returned', 'overdue'])->default('active');
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->text('fine_reason')->nullable();
            $table->text('return_condition_notes')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->timestamp('overdue_notification_sent_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_transactions');
    }
};
