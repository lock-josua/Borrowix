<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoleRedirectController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        return match ($request->user()->role) {
            'super_admin' => redirect('/super-admin/dashboard'),
            'admin' => redirect('/admin/dashboard'),
            'staff' => redirect('/staff/dashboard'),
            'student' => redirect('/student/dashboard'),
            default => redirect('/login'),
        };
    }
}
