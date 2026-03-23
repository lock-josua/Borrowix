<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SystemLog;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // --- Tenant counts ---
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('data->status', 'active')->count();
        $suspendedTenants = Tenant::where('data->status', 'suspended')->count();

        // New schools registered in the current calendar month
        $newThisMonth = Tenant::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // --- Plan breakdown ---
        $planBreakdown = [
            'free' => Tenant::where('data->plan', 'free')->count(),
            'basic' => Tenant::where('data->plan', 'basic')->count(),
            'pro' => Tenant::where('data->plan', 'pro')->count(),
        ];

        // --- Revenue (from active subscriptions) ---
        $monthlyRevenue = $this->calculateMonthlyRevenue();

        // --- Revenue snapshot for the card ---
        $revenueSnapshot = [
            'monthly_recurring' => $monthlyRevenue,
            'annual_recurring' => $this->calculateAnnualRevenue(),
        ];

        // --- Alerts: things that need super admin attention ---
        $alerts = $this->buildAlerts();

        // --- Recent schools ---
        $recentSchools = Tenant::with('domains')->latest()->take(5)->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->school_name ?? $t->id,
                'school_email' => $t->school_email,
                'plan' => $t->plan ?? 'free',
                'status' => $t->status ?? 'active',
                'subdomain' => $t->domains->first()?->domain,
                'school_url' => $t->domains->first()?->domain
                    ? 'http://'.$t->domains->first()->domain.'.'.config('tenancy.central_domains')[0].':8000'
                    : null,
                'created_at' => $t->created_at,
            ]);

        // --- School growth (last 6 months) ---
        $schoolsGrowth = Tenant::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, count(*) as total')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->map(fn ($total, $month) => ['month' => $month, 'total' => (int) $total])
            ->values()
            ->toArray();

        // --- System activity log (last 15 events) ---
        $activityLog = SystemLog::with('tenant')
            ->latest()
            ->take(15)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'description' => $log->description,
                'tenant_id' => $log->tenant_id,
                'tenant_name' => $log->tenant?->school_name ?? $log->tenant_id,
                'actor' => $log->actor,
                'created_at' => $log->created_at,
                'time_ago' => $log->created_at->diffForHumans(),
            ]);

        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'total_schools' => $totalTenants,
                'active_schools' => $activeTenants,
                'suspended_schools' => $suspendedTenants,
                'new_this_month' => $newThisMonth,
                'monthly_revenue' => $monthlyRevenue,
                'plan_breakdown' => $planBreakdown,
            ],
            'revenueSnapshot' => $revenueSnapshot,
            'recentSchools' => $recentSchools,
            'schoolsGrowth' => $schoolsGrowth,
            'activityLog' => $activityLog,
            'alerts' => $alerts,
        ]);
    }

    private function calculateMonthlyRevenue(): int
    {
        $prices = Subscription::PRICES;
        $total = 0;

        Subscription::where('status', 'active')
            ->where('billing_cycle', 'monthly')
            ->select('plan')
            ->get()
            ->each(function ($sub) use (&$total, $prices) {
                $total += $prices[$sub->plan]['monthly'] ?? 0;
            });

        return $total;
    }

    private function calculateAnnualRevenue(): int
    {
        $prices = Subscription::PRICES;
        $total = 0;

        Subscription::where('status', 'active')
            ->where('billing_cycle', 'annual')
            ->select('plan')
            ->get()
            ->each(function ($sub) use (&$total, $prices) {
                $total += $prices[$sub->plan]['annual'] ?? 0;
            });

        return $total;
    }

    private function buildAlerts(): array
    {
        $alerts = [];

        // Past-due subscriptions
        $pastDue = Subscription::where('status', 'past_due')->count();
        if ($pastDue > 0) {
            $alerts[] = [
                'type' => 'error',
                'title' => "{$pastDue} past-due subscription".($pastDue > 1 ? 's' : ''),
                'description' => 'Schools with failed payments need follow-up.',
                'action_url' => '/super-admin/subscriptions',
                'action_label' => 'View subscriptions',
            ];
        }

        // Suspended schools > 30 days
        $longSuspended = Tenant::where('data->status', 'suspended')
            ->where('updated_at', '<=', now()->subDays(30))
            ->count();
        if ($longSuspended > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => "{$longSuspended} school".($longSuspended > 1 ? 's' : '').' suspended 30+ days',
                'description' => 'Consider offboarding or reaching out.',
                'action_url' => '/super-admin/schools?status=suspended',
                'action_label' => 'View schools',
            ];
        }

        // Schools on free plan for 90+ days (conversion opportunity)
        $freeFor90Days = Tenant::where('data->plan', 'free')
            ->where('created_at', '<=', now()->subDays(90))
            ->count();
        if ($freeFor90Days > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => "{$freeFor90Days} school".($freeFor90Days > 1 ? 's' : '').' on Free plan 90+ days',
                'description' => 'Conversion opportunity — consider outreach.',
                'action_url' => '/super-admin/schools?plan=free',
                'action_label' => 'View schools',
            ];
        }

        return $alerts;
    }
}
