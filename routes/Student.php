<?php

use App\Http\Controllers\Student\BorrowHistoryController;
use App\Http\Controllers\Student\BorrowRequestController;
use App\Http\Controllers\Student\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('student')
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('student.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        // Borrow Requests — submit and track
        Route::get('/borrow-requests', [BorrowRequestController::class, 'index'])
            ->name('requests.index');
        Route::get('/borrow-requests/create', [BorrowRequestController::class, 'create'])
            ->name('requests.create');
        Route::post('/borrow-requests', [BorrowRequestController::class, 'store'])
            ->name('requests.store');
        Route::get('/borrow-requests/{borrowRequest}', [BorrowRequestController::class, 'show'])
            ->name('requests.show');
        Route::post('/borrow-requests/{borrowRequest}/cancel', [BorrowRequestController::class, 'cancel'])
            ->name('requests.cancel');

        // Borrowing History — read only
        Route::get('/history', [BorrowHistoryController::class, 'index'])
            ->name('history.index');
        Route::get('/history/{borrowTransaction}', [BorrowHistoryController::class, 'show'])
            ->name('history.show');
    });
