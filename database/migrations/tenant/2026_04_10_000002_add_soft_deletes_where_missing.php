<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (! Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (! Schema::hasColumn('equipment', 'deleted_at')) {
            Schema::table('equipment', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (! Schema::hasColumn('borrow_requests', 'deleted_at')) {
            Schema::table('borrow_requests', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (! Schema::hasColumn('borrow_transactions', 'deleted_at')) {
            Schema::table('borrow_transactions', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        // No need to remove - this is an optional add-on migration
    }
};
