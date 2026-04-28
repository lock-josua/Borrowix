<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnforceSubscription
{
    private const ALLOWED_ROUTES = [
        'login',
        'login.store',
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
        'admin.subscription.index',
        'admin.subscription.checkout',
        'admin.subscription.success',
        'admin.subscription.cancel-return',
        // 'admin.dashboard',
        'admin.settings.index',
        'admin.settings.update',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if (! $tenant) {
            return $next($request);
        }

        if ($request->routeIs(...self::ALLOWED_ROUTES)) {
            return $next($request);
        }

        // Always read status from the subscriptions table — never from tenant JSON.
        // $tenant->status is legacy and unreliable after the schema refactor.
        $subscription = \App\Models\Subscription::where('tenant_id', $tenant->id)
            ->latest()
            ->first();

        $status = $subscription?->status ?? 'trialing';

        if (in_array($status, ['trialing', 'subscribed'])) {
            return $next($request);
        }

        if ($status === 'suspended') {
            return $next($request);
        }

        if ($status === 'trial_expired') {
            return $this->handleExpired($request);
        }

        return $next($request);
    }

    private function handleExpired(Request $request): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $role = Auth::user()->role;
        $roleValue = $role instanceof \App\Enums\UserRole ? $role->value : ($role ?? 'student');

        if ($roleValue === 'admin') {
            $subscription = Subscription::where('tenant_id', tenant()->id)->latest()->first();
            $plans = config('subscription.plans');

            return Inertia::render('trial-expired-admin', [
                'schoolName' => tenant()->school_name ?? tenant()->id,
                'plans' => $plans,
                'subscription' => $subscription ? [
                    'status' => $subscription->status,
                    'trial_ends_at' => $subscription->trial_ends_at,
                ] : null,
            ])->toResponse($request)->setStatusCode(402);
        }

        return Inertia::render('trial-expired-block', [
            'schoolName' => tenant()->school_name ?? tenant()->id,
            'contactEmail' => tenant()->school_email,
        ])->toResponse($request)->setStatusCode(402);
    }
}
