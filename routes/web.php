<?php

use App\Http\Controllers\Admin\PayPalController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\RegisterSuccessController;
use App\Http\Controllers\RoleRedirectController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;

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

        // Registration — central domain only.
        // Fortify's automatic registration is disabled in config/fortify.php
        // so that /register does not exist on tenant subdomains.
        // New school sign-ups only happen here on the central domain.
        Route::get('/register', [RegisteredUserController::class, 'create'])
            ->middleware(['guest'])
            ->name('register');

        Route::post('/register', [RegisteredUserController::class, 'store'])
            ->middleware(['guest'])
            ->name('register.store');

        Route::get('/register/success', RegisterSuccessController::class)
            ->middleware(['guest'])
            ->name('register.success');

        // Super admin panel routes
        require __DIR__.'/Superadmin.php';

        // Settings (for super_admin profile/password)
        require __DIR__.'/settings.php';

        // Notifications API
        Route::prefix('api')->group(function () {
            require __DIR__.'/Api.php';
        });
    });
}

Route::post('/paypal/webhook', [PayPalController::class, 'webhook'])
    ->middleware(['web'])
    ->name('paypal.webhook');
