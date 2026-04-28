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

            // Image paths (stored as Cloudinary URLs)
            $table->string('logo_path')->nullable();
            $table->string('login_bg_image')->nullable();

            // Login page customization
            $table->string('login_bg_mode', 50)->default('color');
            $table->string('login_bg_color', 50)->default('#F9FAFB');

            // Brand customization
            $table->string('primary_color', 50)->default('#EA580C');
            $table->string('active_theme', 50)->default('default');
            $table->string('school_tagline')->nullable();

            // Request settings
            $table->string('allowed_proof_types', 255)->default('jpg,png,pdf');
            $table->integer('max_daily_requests')->default(3);

            // System settings
            $table->boolean('public_browse_enabled')->default(false);
            $table->text('maintenance_message')->nullable();

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
