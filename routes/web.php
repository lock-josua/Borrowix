<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\RoleRedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/', [RoleRedirectController::class, 'redirect'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Settings route
require __DIR__.'/settings.php';

require __DIR__.'/Superadmin.php';
require __DIR__.'/Admin.php';
require __DIR__.'/Staff.php';
require __DIR__.'/Student.php';
