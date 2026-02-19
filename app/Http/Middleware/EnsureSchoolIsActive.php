<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolIsActive
{
    /**
     * Handle an incoming request.
     *
     * Blocks access if the user's school has been suspended or deleted.
     * Super admins are always allowed through — they have no school.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Super admins don't belong to a school — always allow
        if (! $user || $user->isSuperAdmin()) {
            return $next($request);
        }

        $school = $user->school;

        // School no longer exists (deleted)
        if (! $school) {
            Auth::logout();

            return redirect()->route('login')->withErrors([
                'email' => 'Your school account no longer exists. Please contact support.',
            ]);
        }

        // School is suspended by super admin
        if ($school->isSuspended()) {
            Auth::logout();

            return redirect()->route('login')->withErrors([
                'email' => 'Your school account has been suspended. Please contact support.',
            ]);
        }

        return $next($request);
    }
}
