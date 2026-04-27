<?php

use App\Http\Controllers\SuperAdmin\AnalyticsController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\SchoolController;
use App\Http\Controllers\SuperAdmin\SettingsController;
use App\Http\Controllers\SuperAdmin\SubscriptionController;
use App\Http\Controllers\SuperAdmin\UpdateController;
use Illuminate\Support\Facades\Route;

Route::prefix('super-admin')
    ->middleware(['auth', 'verified', 'role:super_admin'])
    ->name('super-admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        // Schools — full management
        Route::get('/schools', [SchoolController::class, 'index'])
            ->name('schools.index');
        Route::get('/schools/create', [SchoolController::class, 'create'])
            ->name('schools.create');
        Route::post('/schools', [SchoolController::class, 'store'])
            ->name('schools.store');
        Route::get('/schools/{tenant}', [SchoolController::class, 'show'])
            ->name('schools.show');
        Route::get('/schools/{tenant}/edit', [SchoolController::class, 'edit'])
            ->name('schools.edit');
        Route::patch('/schools/{tenant}', [SchoolController::class, 'update'])
            ->name('schools.update');
        Route::post('/schools/{tenant}/suspend', [SchoolController::class, 'suspend'])
            ->name('schools.suspend');
        Route::post('/schools/{tenant}/reactivate', [SchoolController::class, 'reactivate'])
            ->name('schools.reactivate');
        Route::post('/schools/{tenant}/resend-credentials', [SchoolController::class, 'resendCredentials'])
            ->name('schools.resend-credentials');

        // Subscriptions
        Route::get('/subscriptions', [SubscriptionController::class, 'index'])
            ->name('subscriptions.index');
        Route::get('/subscriptions/{tenant}', [SubscriptionController::class, 'show'])
            ->name('subscriptions.show');
        Route::patch('/subscriptions/{tenant}', [SubscriptionController::class, 'update'])
            ->name('subscriptions.update');

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'index'])
            ->name('analytics');

        // Settings
        Route::get('/settings', [SettingsController::class, 'index'])
            ->name('settings');
        Route::patch('/settings/profile', [SettingsController::class, 'updateProfile'])
            ->name('settings.profile.update');
        Route::put('/settings/password', [SettingsController::class, 'updatePassword'])
            ->name('settings.password.update');

        // Updates
        Route::get('/settings/updates', [UpdateController::class, 'index'])
            ->name('settings.updates');
        Route::post('/settings/updates/check', [UpdateController::class, 'check'])
            ->name('settings.updates.check');
        Route::post('/settings/updates/install', [UpdateController::class, 'install'])
            ->name('settings.updates.install');

        // Feedbacks
        Route::get('/feedbacks', [\App\Http\Controllers\SuperAdmin\FeedbackController::class, 'index'])
            ->name('feedbacks.index');
        Route::put('/feedbacks/{feedback}', [\App\Http\Controllers\SuperAdmin\FeedbackController::class, 'update'])
            ->name('feedbacks.update');
    });
