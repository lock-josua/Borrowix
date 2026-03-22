<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        [$schoolsGrowth, $planBreakdown, $statusBreakdown, $billingBreakdown, $discountStats, $revenue] = $this->gatherAnalytics();

        return Inertia::render('super-admin/analytics/index', [
            'schoolsGrowth' => $schoolsGrowth,
            'totals' => [
                'schools' => Tenant::count(),
            ],
            'planBreakdown' => $planBreakdown,
            'statusBreakdown' => $statusBreakdown,
            'billingBreakdown' => $billingBreakdown,
            'discountStats' => $discountStats,
            'revenue' => $revenue,
        ]);
    }

    private function gatherAnalytics(): array
    {
        $schoolsGrowth = $this->getSchoolsGrowth();
        $planBreakdown = $this->getGroupedCounts('plan');
        $statusBreakdown = $this->getGroupedCounts('status');
        $billingBreakdown = $this->getGroupedCounts('billing_cycle');
        $discountStats = $this->getDiscountStats();
        $revenue = $this->getRevenueEstimate($planBreakdown);

        return [$schoolsGrowth, $planBreakdown, $statusBreakdown, $billingBreakdown, $discountStats, $revenue];
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

    private function getGroupedCounts(string $column): array
    {
        return Subscription::select($column, DB::raw('count(*) as total'))
            ->whereNotNull($column)
            ->groupBy($column)
            ->pluck('total', $column)
            ->toArray();
    }

    private function getDiscountStats(): array
    {
        $withDiscount = Subscription::where('discount_amount', '>', 0)->count();
        $totalActive = Subscription::where('status', 'active')->count();

        return [
            'with_discount' => $withDiscount,
            'total_active' => $totalActive,
        ];
    }

    private function getRevenueEstimate(array $planBreakdown): array
    {
        $monthly = 0;
        $annual = 0;

        $monthlySubscriptions = Subscription::where('status', 'active')
            ->select('plan', 'billing_cycle', DB::raw('count(*) as total'))
            ->groupBy('plan', 'billing_cycle')
            ->get();

        foreach ($monthlySubscriptions as $row) {
            $price = Subscription::PRICES[$row->plan][$row->billing_cycle] ?? 0;
            $total = $price * $row->total;

            if ($row->billing_cycle === 'monthly') {
                $monthly += $total;
            } else {
                $annual += $total;
            }
        }

        return [
            'monthly_recurring' => $monthly,
            'annual_recurring' => $annual,
            'projected_yearly' => $monthly * 12 + $annual,
        ];
    }
}
