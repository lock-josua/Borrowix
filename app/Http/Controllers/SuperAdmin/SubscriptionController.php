<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Services\SubscriptionService;
use App\Services\SystemLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService
    ) {}

    public function index(): Response
    {
        $filters = [
            'search' => request('search', ''),
            'status' => request('status', ''),
            'plan' => request('plan', ''),
        ];

        $subscriptions = Subscription::with('tenant')
            ->when($filters['search'], fn ($q) => $q->whereHas('tenant', fn ($t) => $t
                ->where('data->school_name', 'like', "%{$filters['search']}%")
                ->orWhere('school_email', 'like', "%{$filters['search']}%")
            ))
            ->when($filters['status'], fn ($q) => $q->where('status', $filters['status']))
            ->when($filters['plan'], fn ($q) => $q->where('plan', $filters['plan']))
            ->latest()
            ->paginate(15)
            ->through(fn ($s) => [
                'id' => $s->id,
                'plan' => $s->plan,
                'status' => $s->status,
                'trial_ends_at' => $s->trial_ends_at,
                'trial_days_remaining' => $s->trialDaysRemaining(),
                'current_period_end' => $s->current_period_end,
                'created_at' => $s->created_at,
                'school' => [
                    'id' => $s->tenant->id,
                    'name' => $s->tenant->school_name ?? $s->tenant->id,
                    'email' => $s->tenant->school_email,
                ],
            ]);

        $totalRevenue = SubscriptionPayment::where('status', 'completed')->sum('amount');
        $monthlyRevenue = SubscriptionPayment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');
        $annualRevenue = SubscriptionPayment::where('status', 'completed')
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $statusBreakdown = Subscription::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $planBreakdown = Subscription::whereNotNull('plan')
            ->selectRaw('plan, count(*) as total')
            ->groupBy('plan')
            ->pluck('total', 'plan')
            ->toArray();

        return Inertia::render('super-admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => $filters,
            'statusBreakdown' => $statusBreakdown,
            'planBreakdown' => $planBreakdown,
            'revenue' => [
                'total' => (float) $totalRevenue,
                'monthly' => (float) $monthlyRevenue,
                'annual' => (float) $annualRevenue,
            ],
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();
        $payments = $subscription
            ? $subscription->payments()->latest('paid_at')->get()
            : collect();

        return Inertia::render('super-admin/subscriptions/show', [
            'school' => [
                'id' => $tenant->id,
                'name' => $tenant->school_name ?? $tenant->id,
                'email' => $tenant->school_email,
                'status' => $tenant->status,
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'plan' => $subscription->plan,
                'paypal_subscription_id' => $subscription->paypal_subscription_id,
                'trial_ends_at' => $subscription->trial_ends_at,
                'trial_days_remaining' => $subscription->trialDaysRemaining(),
                'current_period_start' => $subscription->current_period_start,
                'current_period_end' => $subscription->current_period_end,
                'canceled_at' => $subscription->canceled_at,
                'suspension_reason' => $subscription->suspension_reason,
                'trial_warning_sent' => $subscription->trial_warning_sent,
            ] : null,
            'payments' => $payments->map(fn ($p) => [
                'id' => $p->id,
                'plan' => $p->plan,
                'amount' => $p->amount,
                'currency' => $p->currency,
                'status' => $p->status,
                'paid_at' => $p->paid_at,
            ]),
        ]);
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:trialing,subscribed,trial_expired,suspended'],
            'plan' => ['nullable', 'in:monthly,annually'],
        ]);

        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->firstOrFail();

        $subscription->update([
            'status' => $validated['status'],
            'plan' => $validated['plan'] ?? $subscription->plan,
        ]);

        $tenant->update([
            'status' => $validated['status'],
            'plan' => $validated['plan'] ?? $tenant->plan,
        ]);

        SystemLogService::log(
            'subscription_overridden',
            "Subscription manually set to {$validated['status']} for {$tenant->school_name}",
            $tenant->id,
            'super_admin'
        );

        return redirect()
            ->route('super-admin.subscriptions.show', $tenant)
            ->with('success', 'Subscription updated.');
    }
}
