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
        $activeTenants = Subscription::whereIn('status', ['trialing', 'subscribed'])->count();
        $suspendedTenants = Subscription::where('status', 'suspended')->count();

        // New schools registered in the current calendar month
        $newThisMonth = Tenant::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // --- Subscription plan breakdown (monthly vs annually) ---
        $planBreakdown = Subscription::whereNotNull('plan')
            ->selectRaw('plan, count(*) as total')
            ->groupBy('plan')
            ->pluck('total', 'plan')
            ->toArray();

        // --- Revenue (from active subscriptions) ---
        $mrr = $this->calculateMRR();

        // --- Revenue snapshot for the card ---
        $revenueSnapshot = [
            'monthly_recurring' => $mrr,
            'annual_recurring' => $this->calculateARR(),
        ];

        // --- Alerts: things that need super admin attention ---
        $alerts = $this->buildAlerts();

        // --- Recent schools ---
        $recentSchools = Tenant::with(['domains', 'subscription'])->latest()->take(5)->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->school_name ?? $t->id,
                'school_email' => $t->school_email,
                'plan' => $t->subscription?->plan ?? null,
                'status' => $t->subscription?->status ?? 'trialing',
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
                'monthly_revenue' => $mrr,
                'plan_breakdown' => $planBreakdown,
            ],
            'revenueSnapshot' => $revenueSnapshot,
            'recentSchools' => $recentSchools,
            'schoolsGrowth' => $schoolsGrowth,
            'activityLog' => $activityLog,
            'alerts' => $alerts,
        ]);
    }

    private function calculateMRR(): float
    {
        // Sum of (Monthly Plan Price) + (Annual Plan Price / 12) for all active subscribers
        $activeSubscriptions = Subscription::where('status', 'subscribed')->get();

        return $activeSubscriptions->sum(function ($sub) {
            $planKey = $sub->plan === 'annually' ? 'annually' : 'monthly';
            $price = config("subscription.plans.{$planKey}.price", 0);

            return $sub->plan === 'annually' ? ($price / 12) : $price;
        });
    }

    private function calculateARR(): float
    {
        return $this->calculateMRR() * 12;
    }

    private function buildAlerts(): array
    {
        $alerts = [];

        // Suspended subscriptions
        $suspendedSubs = Subscription::where('status', 'suspended')->count();
        if ($suspendedSubs > 0) {
            $alerts[] = [
                'type' => 'error',
                'title' => "{$suspendedSubs} suspended subscription".($suspendedSubs > 1 ? 's' : ''),
                'description' => 'Schools that have been suspended by super admin.',
                'action_url' => '/super-admin/subscriptions?status=suspended',
                'action_label' => 'View subscriptions',
            ];
        }

        // Trial expired - schools that need to subscribe
        $trialExpired = Subscription::where('status', 'trial_expired')->count();
        if ($trialExpired > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => "{$trialExpired} trial".($trialExpired > 1 ? 's' : '').' expired',
                'description' => 'Schools that need to subscribe to regain access.',
                'action_url' => '/super-admin/subscriptions?status=trial_expired',
                'action_label' => 'View subscriptions',
            ];
        }

        // Trialing for 90+ days (conversion opportunity)
        $trialingFor90Days = Subscription::where('status', 'trialing')
            ->where('created_at', '<=', now()->subDays(90))
            ->count();
        if ($trialingFor90Days > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => "{$trialingFor90Days} school".($trialingFor90Days > 1 ? 's' : '').' on trial 90+ days',
                'description' => 'Conversion opportunity — consider outreach.',
                'action_url' => '/super-admin/subscriptions?status=trialing',
                'action_label' => 'View subscriptions',
            ];
        }

        return $alerts;
    }
}
