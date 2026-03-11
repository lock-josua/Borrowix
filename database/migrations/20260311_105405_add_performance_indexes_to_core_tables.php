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
        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->index('status');
            $table->index(['school_id', 'status']);
            $table->index(['school_id', 'created_at']);
        });

        Schema::table('borrow_transactions', function (Blueprint $table) {
            $table->index('status');
            $table->index(['school_id', 'status']);
            $table->index('due_date');
            $table->index(['school_id', 'due_date']);
        });

        Schema::table('equipment', function (Blueprint $table) {
            $table->index('status');
            $table->index(['school_id', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['school_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['school_id', 'status']);
            $table->dropIndex(['school_id', 'created_at']);
        });

        Schema::table('borrow_transactions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['school_id', 'status']);
            $table->dropIndex(['due_date']);
            $table->dropIndex(['school_id', 'due_date']);
        });

        Schema::table('equipment', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['school_id', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['school_id', 'role']);
        });
    }
};
