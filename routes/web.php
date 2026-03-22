<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\RoleRedirectController;
use Illuminate\Support\Facades\Route;

// Central routes are only accessible on central domains (huwam.test, huwam.com).
// This follows the tenancy docs pattern exactly.
foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {

        // Post-login redirect for super_admin
        Route::get('/', [RoleRedirectController::class, 'redirect'])
            ->middleware(['auth', 'verified'])
            ->name('central.dashboard');

        // Google OAuth only on central domain
        Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
        Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

        // Super admin panel routes
        require __DIR__.'/Superadmin.php';

        // Settings (for super_admin profile/password)
        require __DIR__.'/settings.php';
    });
}
