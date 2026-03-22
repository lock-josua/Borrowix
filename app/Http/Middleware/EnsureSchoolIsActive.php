<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolIsActive
{
    /**
     * Check if the current tenant's school is active.
     *
     * Uses tenant() helper from the tenancy package to get the current Tenant model.
     * The status is stored in the `data` JSON column on the Tenant model.
     *
     * This middleware should only be applied to tenant routes (inside routes/Admin.php etc.).
     * Super admin routes on the central domain will have tenant() return null, which
     * means they always pass through.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        // No tenant context means this is a central domain request (super_admin) — allow
        if (! $tenant) {
            return $next($request);
        }

        // Read status from the data JSON column.
        // tenant()->status works because the Tenant model's data column
        // is automatically decoded — attributes are accessible as properties.
        $status = $tenant->status ?? 'active';

        if ($status === 'suspended') {
            Auth::logout();

            return redirect()->route('login')->withErrors([
                'email' => 'Your school account has been suspended. Please contact support.',
            ]);
        }

        return $next($request);
    }
}
