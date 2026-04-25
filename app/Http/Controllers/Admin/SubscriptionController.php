<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $tenant = tenant();
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();
        $plans = config('subscription.plans');

        return Inertia::render('admin/subscription/index', [
            'school' => [
                'name' => $tenant->school_name ?? $tenant->id,
                'status' => $tenant->status ?? 'trialing',
                'plan' => $tenant->plan ?? null,
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'plan' => $subscription->plan,
                'trial_ends_at' => $subscription->trial_ends_at,
                'trial_days_remaining' => $subscription->trialDaysRemaining(),
                'current_period_end' => $subscription->current_period_end,
                'paypal_subscription_id' => $subscription->paypal_subscription_id,
            ] : null,
            'plans' => $plans,
            'payments' => $subscription
                ? $subscription->payments()
                    ->latest('paid_at')
                    ->take(10)
                    ->get(['plan', 'amount', 'currency', 'status', 'paid_at'])
                : [],
        ]);
    }
}
