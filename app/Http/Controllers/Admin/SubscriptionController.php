<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $tenant = tenant();
        $subscription = Subscription::where('tenant_id', $tenant->id)->latest()->first();

        return Inertia::render('admin/subscription/index', [
            'school' => [
                'name' => $tenant->school_name ?? $tenant->id,
                'plan' => $tenant->plan ?? 'free',
                'status' => $tenant->status ?? 'active',
            ],
            'subscription' => $subscription,
        ]);
    }

    public function upgrade(Request $request): RedirectResponse
    {
        $request->validate(['plan' => ['required', 'in:basic,pro']]);

        return redirect()
            ->route('admin.subscription.index')
            ->with('info', 'Payment gateway integration coming soon.');
    }

    public function cancel(): RedirectResponse
    {
        $tenant = tenant();

        Subscription::where('tenant_id', $tenant->id)
            ->latest()
            ->first()
            ?->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);

        $tenant->update(['plan' => 'free']);

        return redirect()
            ->route('admin.subscription.index')
            ->with('success', 'Subscription canceled. You are now on the Free plan.');
    }
}
