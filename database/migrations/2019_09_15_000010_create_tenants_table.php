<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();

            // Contact identity columns — stored as dedicated columns for
            // fast querying in the SuperAdmin school listing.
            $table->string('school_email')->unique();
            $table->string('admin_email');
            $table->string('contact_number')->nullable();

            // The package stores all other tenant attributes here as JSON.
            // school_name, plan, status, address, logo, etc. go here.
            $table->json('data')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
