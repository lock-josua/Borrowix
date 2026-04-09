<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolIsActive
{
    /**
     * Routes that are always allowed even when the school is suspended.
     *
     * Auth routes MUST be excluded. Without this, the middleware fires on
     * /login itself, logs the user out, then redirects to /login, which
     * fires the middleware again — creating an infinite redirect loop.
     *
     * logout is allowed so suspended users can explicitly log out.
     * password.* routes allow password reset emails to still work.
     * two-factor.login routes are part of the login flow for 2FA users.
     */
    private const ALLOWED_ROUTES = [
        'login',
        'logout',
        'password.request',
        'password.email',
        'password.reset',
        'password.update',
        'verification.notice',
        'verification.verify',
        'verification.send',
        'two-factor.login',
        'two-factor.login.store',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        // No tenant context = central domain request (super_admin) — always allow
        if (! $tenant) {
            return $next($request);
        }

        // Always allow auth routes to prevent infinite redirect loop.
        // If suspended users hit /login, they see the login page.
        // If they try to log in, the middleware fires AFTER auth — they
        // get redirected to the suspended page immediately.
        if ($request->routeIs(...self::ALLOWED_ROUTES)) {
            return $next($request);
        }

        $status = $tenant->status ?? 'active';

        if ($status !== 'suspended') {
            return $next($request);
        }

        // School is suspended — log out any active session and show
        // the branded suspended page instead of a generic error.
        if (Auth::check()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // Return the Inertia suspended page with the suspension reason
        // so users understand why they are locked out.
        return Inertia::render('suspended', [
            'schoolName' => $tenant->school_name ?? $tenant->id,
            'suspensionReason' => $tenant->suspension_reason ?? null,
            'contactEmail' => $tenant->school_email,
        ])->toResponse($request)->setStatusCode(403);
    }
}
