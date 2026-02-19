<?php

use App\Http\Controllers\Admin\BorrowRequestController;
use App\Http\Controllers\Admin\BorrowTransactionController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EquipmentController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:admin', 'school.active', 'school.scope'])
    ->name('admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        // Users — manage staff and students
        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');
        Route::get('/users/invite', [UserController::class, 'invite'])
            ->name('users.invite');
        Route::post('/users/invite', [UserController::class, 'store'])
            ->name('users.store');
        Route::get('/users/{user}', [UserController::class, 'show'])
            ->name('users.show');
        Route::patch('/users/{user}', [UserController::class, 'update'])
            ->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->name('users.destroy');

        // Equipment — full CRUD
        Route::resource('/equipment', EquipmentController::class)
            ->names('equipment');

        // Categories
        Route::resource('/categories', CategoryController::class)
            ->names('categories');

        // Borrow Requests — view + approve/reject
        Route::get('/requests', [BorrowRequestController::class, 'index'])
            ->name('requests.index');
        Route::get('/requests/{borrowRequest}', [BorrowRequestController::class, 'show'])
            ->name('requests.show');
        Route::post('/requests/{borrowRequest}/approve', [BorrowRequestController::class, 'approve'])
            ->name('requests.approve');
        Route::post('/requests/{borrowRequest}/reject', [BorrowRequestController::class, 'reject'])
            ->name('requests.reject');

        // Borrow Transactions — view + process returns
        Route::get('/transactions', [BorrowTransactionController::class, 'index'])
            ->name('transactions.index');
        Route::get('/transactions/{borrowTransaction}', [BorrowTransactionController::class, 'show'])
            ->name('transactions.show');
        Route::post('/transactions/{borrowTransaction}/return', [BorrowTransactionController::class, 'markReturned'])
            ->name('transactions.return');

        // Reports
        Route::get('/reports', [ReportController::class, 'index'])
            ->name('reports.index');
        Route::get('/reports/export', [ReportController::class, 'export'])
            ->name('reports.export');

        // Settings
        Route::get('/settings', [SettingsController::class, 'index'])
            ->name('settings.index');
        Route::patch('/settings', [SettingsController::class, 'update'])
            ->name('settings.update');

        // Subscription
        Route::get('/subscription', [SubscriptionController::class, 'index'])
            ->name('subscription.index');
        Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade'])
            ->name('subscription.upgrade');
        Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel'])
            ->name('subscription.cancel');
    });