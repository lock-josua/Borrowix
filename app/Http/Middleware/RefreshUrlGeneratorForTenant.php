<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RefreshUrlGeneratorForTenant
{
    /**
     * After InitializeTenancyBySubdomain switches the DB, refresh the
     * UrlGenerator's request so that route() / url() calls generate
     * URLs with the tenant's hostname (e.g. demo-school.localhost)
     * instead of the central domain (localhost).
     *
     * This is needed because Fortify registers its login/logout/etc.
     * routes globally (after tenant routes), so route('login') resolves
     * to the global route which has no domain constraint. The URL
     * generator then builds the URL from the request's root — which
     * must be the tenant host for the redirect to stay on the tenant
     * subdomain.
     */
    public function handle(Request $request, Closure $next): Response
    {
        app('url')->setRequest($request);

        return $next($request);
    }
}
