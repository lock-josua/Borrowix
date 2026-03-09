<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ScopeToSchool
{
    /**
     * Handle an incoming request.
     *
     * Shares the authenticated user's school with the rest of the
     * request lifecycle so controllers don't have to look it up
     * repeatedly. Accessible via:
     *
     *   $request->attributes->get('school')
     *   app('current_school')
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isSuperAdmin() && $user->school_id) {
            $school = $user->school;

            // Make school available via request attributes
            $request->attributes->set('school', $school);

            // Also bind it in the service container for easy access anywhere
            app()->instance('current_school', $school);
        }

        return $next($request);
    }
}
