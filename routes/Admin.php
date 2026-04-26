<?php

use App\Http\Controllers\Admin\BorrowRequestController;
use App\Http\Controllers\Admin\BorrowTransactionController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EquipmentController;
use App\Http\Controllers\Admin\PayPalController;
use App\Http\Controllers\Admin\RbacController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UpdateController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:admin'])
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
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])
            ->name('users.edit');
        Route::patch('/users/{user}', [UserController::class, 'update'])
            ->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->name('users.destroy');

        // Equipment — full CRUD
        Route::resource('/equipment', EquipmentController::class)
            ->names('equipment');

        // QR Code management
        Route::post('/equipment/{equipment}/qr-code/generate', [EquipmentController::class, 'generateQrCode'])
            ->name('equipment.qr-code.generate');
        Route::get('/equipment/{equipment}/qr-code', [EquipmentController::class, 'showQrCode'])
            ->name('equipment.qr-code.show');

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

        // Subscription
        Route::get('/subscription', [SubscriptionController::class, 'index'])
            ->name('subscription.index');
        Route::post('/subscription/checkout', [PayPalController::class, 'checkout'])
            ->name('subscription.checkout');
        Route::get('/subscription/success', [PayPalController::class, 'success'])
            ->name('subscription.success');
        Route::get('/subscription/cancel-return', [PayPalController::class, 'cancelReturn'])
            ->name('subscription.cancel-return');

        // School Settings
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::get('/settings/general', [SettingsController::class, 'general'])->name('settings.general');
        Route::patch('/settings/general', [SettingsController::class, 'updateGeneral'])->name('settings.general.update');
        Route::get('/settings/school', [SettingsController::class, 'school'])->name('settings.school');
        Route::patch('/settings/school', [SettingsController::class, 'updateSchool'])->name('settings.school.update');
        Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update');
        Route::get('/settings/customization', [SettingsController::class, 'customization'])
            ->name('settings.customization');
        Route::post('/settings/customization', [SettingsController::class, 'updateCustomization'])
            ->name('settings.customization.update');

        // Updates
        Route::get('/settings/updates', [UpdateController::class, 'index'])
            ->name('settings.updates');
        Route::post('/settings/updates/check', [UpdateController::class, 'check'])
            ->name('settings.updates.check');

        // RBAC — role permissions matrix
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::patch('/rbac', [RbacController::class, 'update'])->name('rbac.update');
    });
