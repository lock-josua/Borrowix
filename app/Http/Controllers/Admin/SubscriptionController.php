<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $school = app('current_school');
        $school->load('subscription');

        return Inertia::render('admin/subscription/index', [
            'school'       => $school,
            'subscription' => $school->subscription,
        ]);
    }

    public function upgrade(Request $request): RedirectResponse
    {
        $request->validate([
            'plan' => ['required', 'in:basic,pro'],
        ]);

        // Payment gateway checkout will be wired up in Phase 5
        // For now redirect to a placeholder checkout page
        return redirect()
            ->route('admin.subscription.index')
            ->with('info', 'Payment gateway integration coming in Phase 5.');
    }

    public function cancel(): RedirectResponse
    {
        $school = app('current_school');

        $school->subscription()->update([
            'status'      => 'canceled',
            'canceled_at' => now(),
        ]);

        $school->update(['plan' => 'free']);

        return redirect()
            ->route('admin.subscription.index')
            ->with('success', 'Subscription canceled. You are now on the Free plan.');
    }
}