<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class AuthenticatedLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if (! $user) {
            return redirect('/dashboard');
        }

        // Force session to save completely before redirect
        // This ensures the tenant context is properly initialized
        $request->session()->save();

        // Determine redirect path based on user role
        $redirectPath = match ($user->role?->value) {
            'admin' => '/admin/dashboard',
            'staff' => '/staff/dashboard',
            'student' => '/student/dashboard',
            'super_admin' => '/super-admin/dashboard',
            default => '/dashboard',
        };

        return redirect($redirectPath);
    }
}
