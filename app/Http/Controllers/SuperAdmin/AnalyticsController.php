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
        return Tenant::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, count(*) as total')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->map(fn ($total, $month) => ['month' => $month, 'total' => (int) $total])
            ->values()
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
        $monthlyRevenue = SubscriptionPayment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $annualRevenue = SubscriptionPayment::where('status', 'completed')
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $totalRevenue = SubscriptionPayment::where('status', 'completed')
            ->sum('amount');

        return [
            'monthly_recurring' => (float) $monthlyRevenue,
            'annual_recurring' => (float) $annualRevenue,
            'total' => (float) $totalRevenue,
        ];
    }
}
