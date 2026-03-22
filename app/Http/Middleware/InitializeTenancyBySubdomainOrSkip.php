<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyBySubdomainOrSkip extends InitializeTenancyBySubdomain
{
    /**
     * Handle the request.
     *
     * If the current host is a central domain (e.g. localhost, huwam.test),
     * skip tenancy initialization entirely and pass through.
     *
     * If the current host IS a subdomain (e.g. demo-school.localhost),
     * delegate to the parent class which switches the DB connection.
     *
     * This is needed because this middleware runs globally (via prepend())
     * so that it fires BEFORE StartSession reads the session — ensuring the
     * correct tenant DB is active when the session and user are loaded.
     */
    public function handle($request, Closure $next)
    {
        $host = $request->getHost();
        $centralDomains = config('tenancy.central_domains', []);

        // If the host exactly matches a central domain, skip tenancy entirely.
        // This covers: localhost, huwam.test, huwam.com
        if (in_array($host, $centralDomains)) {
            return $next($request);
        }

        // Check if the host is a subdomain of a central domain.
        // e.g. demo-school.localhost → subdomain of localhost → tenant request
        // If it is NOT a subdomain of any central domain, also skip.
        $isSubdomainOfCentral = false;
        foreach ($centralDomains as $centralDomain) {
            if (str_ends_with($host, '.'.$centralDomain)) {
                $isSubdomainOfCentral = true;
                break;
            }
        }

        if (! $isSubdomainOfCentral) {
            // Host is unrelated to any central domain — skip to avoid errors
            return $next($request);
        }

        // This is a valid tenant subdomain — delegate to the parent
        // which extracts the subdomain, looks it up in the domains table,
        // and switches the DB connection.
        return parent::handle($request, $next);
    }
}
