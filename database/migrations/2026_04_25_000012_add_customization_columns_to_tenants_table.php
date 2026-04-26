<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Image paths (stored as Cloudinary public_ids)
            $table->string('logo_path')->nullable()->after('contact_number');
            $table->string('login_bg_image')->nullable()->after('logo_path');

            // Login page customization
            $table->string('login_bg_mode', 50)->default('color')->after('login_bg_image');
            $table->string('login_bg_color', 50)->default('#F9FAFB')->after('login_bg_mode');

            // Brand customization
            $table->string('primary_color', 50)->default('#EA580C')->after('login_bg_color');
            $table->string('school_tagline')->nullable()->after('primary_color');

            // Request settings
            $table->string('allowed_proof_types', 255)->default('jpg,png,pdf')->after('school_tagline');
            $table->integer('max_daily_requests')->default(3)->after('allowed_proof_types');

            // System settings
            $table->boolean('public_browse_enabled')->default(false)->after('max_daily_requests');
            $table->text('maintenance_message')->nullable()->after('public_browse_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'logo_path',
                'login_bg_image',
                'login_bg_mode',
                'login_bg_color',
                'primary_color',
                'school_tagline',
                'allowed_proof_types',
                'max_daily_requests',
                'public_browse_enabled',
                'maintenance_message',
            ]);
        });
    }
};
