<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoleRedirectController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        return match ($request->user()->role) {
            UserRole::SuperAdmin => redirect('/super-admin/dashboard'),
            UserRole::Admin => redirect('/admin/dashboard'),
            UserRole::Staff => redirect('/staff/dashboard'),
            UserRole::Student => redirect('/student/dashboard'),
            default => redirect('/login'),
        };
    }
}
