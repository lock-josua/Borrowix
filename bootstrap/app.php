<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnforceSubscription;
use App\Http\Middleware\EnsureSchoolIsActive;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // CRITICAL: InitializeTenancyBySubdomain must run BEFORE the web
        // middleware group reads the session (StartSession). If it runs after,
        // the session is read from the central DB and User::find() loads the
        // super_admin instead of the tenant user — causing wrong redirects.
        $middleware->prepend(
            \App\Http\Middleware\InitializeTenancyBySubdomainOrSkip::class,
        );

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            SecurityHeaders::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register route middleware aliases
        $middleware->alias([
            'role' => CheckRole::class,
            'role.spatie' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'school.active' => EnsureSchoolIsActive::class,
            'subscription.enforce' => EnforceSubscription::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return app(\App\Exceptions\Handler::class)->render($request, $e);
            }
        });
    })->create();
