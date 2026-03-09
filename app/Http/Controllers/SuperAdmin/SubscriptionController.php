<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Subscription;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $subscriptions = Subscription::with('school')
            ->latest()
            ->paginate(15);

        $breakdown = Subscription::selectRaw('plan, count(*) as total')
            ->groupBy('plan')
            ->pluck('total', 'plan')
            ->toArray();

        return Inertia::render('super-admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'breakdown' => $breakdown,
        ]);
    }

    public function show(School $school): Response
    {
        $school->load('subscription');

        $paymentHistory = $school->subscription()
            ->latest()
            ->get(['plan', 'status', 'billing_cycle', 'current_period_start', 'current_period_end', 'created_at']);

        return Inertia::render('super-admin/subscriptions/show', [
            'school' => $school,
            'paymentHistory' => $paymentHistory,
        ]);
    }
}
