<?php

use App\Http\Controllers\SuperAdmin\AnalyticsController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\PromoCodeController;
use App\Http\Controllers\SuperAdmin\SchoolController;
use App\Http\Controllers\SuperAdmin\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('super-admin')
    ->middleware(['auth', 'verified', 'role:super_admin'])
    ->name('super-admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        // Schools — read only + manual override actions
        Route::get('/schools', [SchoolController::class, 'index'])
            ->name('schools.index');
        Route::get('/schools/{school}', [SchoolController::class, 'show'])
            ->name('schools.show');
        Route::post('/schools/{school}/suspend', [SchoolController::class, 'suspend'])
            ->name('schools.suspend');
        Route::post('/schools/{school}/reactivate', [SchoolController::class, 'reactivate'])
            ->name('schools.reactivate');
        Route::post('/schools/{school}/impersonate', [SchoolController::class, 'impersonate'])
            ->name('schools.impersonate');

        // Subscriptions — read only
        Route::get('/subscriptions', [SubscriptionController::class, 'index'])
            ->name('subscriptions.index');
        Route::get('/subscriptions/{school}', [SubscriptionController::class, 'show'])
            ->name('subscriptions.show');

        // Promo Codes — full CRUD
        Route::resource('/promo-codes', PromoCodeController::class)
            ->names('promo-codes');

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'index'])
            ->name('analytics');
    });