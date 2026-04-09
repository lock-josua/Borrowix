<?php

use App\Http\Controllers\Admin\BorrowRequestController;
use App\Http\Controllers\Staff\BorrowTransactionController;
use App\Http\Controllers\Staff\DashboardController;
use App\Http\Controllers\Staff\EquipmentController;
use Illuminate\Support\Facades\Route;

Route::prefix('staff')
    ->middleware(['auth', 'verified', 'role:staff'])
    ->name('staff.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        // Equipment — read only, check availability
        Route::get('/equipment', [EquipmentController::class, 'index'])
            ->name('equipment.index');
        Route::get('/equipment/{equipment}', [EquipmentController::class, 'show'])
            ->name('equipment.show');

        // Borrow Requests — view + approve/reject
        Route::get('/requests', [BorrowRequestController::class, 'index'])
            ->name('requests.index');
        Route::get('/requests/{borrowRequest}', [BorrowRequestController::class, 'show'])
            ->name('requests.show');
        Route::post('/requests/{borrowRequest}/approve', [BorrowRequestController::class, 'approve'])
            ->name('requests.approve');
        Route::post('/requests/{borrowRequest}/reject', [BorrowRequestController::class, 'reject'])
            ->name('requests.reject');

        // Transactions — process releases and returns
        Route::get('/transactions', [BorrowTransactionController::class, 'index'])
            ->name('transactions.index');
        Route::get('/transactions/{borrowTransaction}', [BorrowTransactionController::class, 'show'])
            ->name('transactions.show');
        Route::post('/transactions/{borrowTransaction}/return', [BorrowTransactionController::class, 'markReturned'])
            ->name('transactions.return');
    });
