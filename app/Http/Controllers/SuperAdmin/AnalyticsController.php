<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        [$schoolsGrowth, $subscriptionStats, $statusBreakdown, $revenue] = $this->gatherAnalytics();

        return Inertia::render('super-admin/analytics/index', [
            'schoolsGrowth' => $schoolsGrowth,
            'totals' => [
                'schools' => Tenant::count(),
            ],
            'subscriptionStats' => $subscriptionStats,
            'statusBreakdown' => $statusBreakdown,
            'revenue' => $revenue,
        ]);
    }

    private function gatherAnalytics(): array
    {
        $schoolsGrowth = $this->getSchoolsGrowth();
        $subscriptionStats = $this->getSubscriptionStats();
        $statusBreakdown = $this->getStatusBreakdown();
        $revenue = $this->getRevenue();

        return [$schoolsGrowth, $subscriptionStats, $statusBreakdown, $revenue];
    }

    private function getSchoolsGrowth(): array
    {
        return Tenant::leftJoin('subscriptions', 'tenants.id', '=', 'subscriptions.tenant_id')
            ->selectRaw('DATE_FORMAT(tenants.created_at, "%Y-%m-%d") as date')
            ->selectRaw('SUM(CASE WHEN subscriptions.plan = "annually" THEN 1 ELSE 0 END) as annual')
            ->selectRaw('SUM(CASE WHEN subscriptions.plan = "monthly" OR subscriptions.plan IS NULL THEN 1 ELSE 0 END) as monthly')
            ->where('tenants.created_at', '>=', now()->subMonths(12))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($item) => [
                'date' => $item->date,
                'annual' => (int) $item->annual,
                'monthly' => (int) $item->monthly,
            ])
            ->toArray();
    }

    private function getSubscriptionStats(): array
    {
        $totalSubscribed = Subscription::where('status', 'subscribed')->count();
        $totalTrialing = Subscription::where('status', 'trialing')->count();
        $totalTrialExpired = Subscription::where('status', 'trial_expired')->count();
        $totalSuspended = Subscription::where('status', 'suspended')->count();

        return [
            'subscribed' => $totalSubscribed,
            'trialing' => $totalTrialing,
            'trial_expired' => $totalTrialExpired,
            'suspended' => $totalSuspended,
        ];
    }

    private function getStatusBreakdown(): array
    {
        return Subscription::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();
    }

    private function getRevenue(): array
    {
        // 1. MRR (Monthly Recurring Revenue)
        // (Monthly Plan Price * Monthly Subscribers) + (Annual Plan Price / 12 * Annual Subscribers)
        $activeSubscriptions = Subscription::where('status', 'subscribed')->get();

        $mrr = $activeSubscriptions->sum(function ($sub) {
            $planKey = $sub->plan === 'annually' ? 'annually' : 'monthly';
            $price = config("subscription.plans.{$planKey}.price", 0);

            return $sub->plan === 'annually' ? ($price / 12) : $price;
        });

        // 2. ARR (Annual Recurring Revenue)
        $arr = $mrr * 12;

        // 3. Cash Flow (What was actually collected)
        $monthlyCashFlow = SubscriptionPayment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $totalRevenue = SubscriptionPayment::where('status', 'completed')
            ->sum('amount');

        return [
            'monthly_recurring' => (float) $mrr,
            'annual_recurring' => (float) $arr,
            'monthly_cash_flow' => (float) $monthlyCashFlow,
            'total' => (float) $totalRevenue,
        ];
    }
}
