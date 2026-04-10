<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            // school_id REMOVED — each DB is already one school
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique('name'); // unique within this tenant's own DB
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
