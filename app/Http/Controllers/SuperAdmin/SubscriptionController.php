<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Services\SystemLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $subscriptions = Subscription::with('tenant')->latest()->paginate(15)
            ->through(fn ($subscription) => [
                'id' => $subscription->id,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'current_period_end' => $subscription->current_period_end,
                'discount_amount' => $subscription->discount_amount,
                'created_at' => $subscription->created_at,
                'school' => [
                    'id' => $subscription->tenant->id,
                    'name' => $subscription->tenant->school_name ?? $subscription->tenant->id,
                    'email' => $subscription->tenant->school_email,
                ],
                'promo_code' => $subscription->promoCode
                    ? ['code' => $subscription->promoCode->code]
                    : null,
            ]);

        $breakdown = Subscription::selectRaw('plan, count(*) as total')
            ->groupBy('plan')
            ->pluck('total', 'plan')
            ->toArray();

        return Inertia::render('super-admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'breakdown' => $breakdown,
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();
        $paymentHistory = Subscription::where('tenant_id', $tenant->id)
            ->latest()
            ->get(['plan', 'status', 'billing_cycle', 'current_period_start', 'current_period_end', 'created_at']);

        return Inertia::render('super-admin/subscriptions/show', [
            'school' => $tenant,
            'subscription' => $subscription,
            'paymentHistory' => $paymentHistory,
        ]);
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:'.implode(',', Subscription::PLANS)],
            'status' => ['required', 'in:'.implode(',', Subscription::STATUSES)],
            'billing_cycle' => ['required', 'in:'.implode(',', Subscription::BILLING_CYCLES)],
        ]);

        $currentPlan = $tenant->plan ?? 'free';

        Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan' => $validated['plan'],
                'status' => $validated['status'],
                'billing_cycle' => $validated['billing_cycle'],
            ]
        );

        $tenant->update(['plan' => $validated['plan']]);

        SystemLogService::log(
            'subscription_updated',
            "Subscription for {$tenant->school_name} set to ".ucfirst($validated['plan']).' ('.ucfirst($validated['status']).', '.ucfirst($validated['billing_cycle']).')',
            $tenant->id,
            'super_admin'
        );

        Mail::to($tenant->school_email)->send(new PlanChangedMail(
            schoolName: $tenant->school_name ?? $tenant->id,
            oldPlan: $currentPlan,
            newPlan: $validated['plan'],
            adminEmail: $tenant->school_email,
        ));

        return redirect()
            ->route('super-admin.subscriptions.show', $tenant)
            ->with('success', 'Subscription updated.');
    }
}
