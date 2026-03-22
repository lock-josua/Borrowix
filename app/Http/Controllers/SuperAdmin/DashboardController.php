<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalTenants     = Tenant::count();
        $activeTenants    = Tenant::where('data->status', 'active')->count();
        $suspendedTenants = Tenant::where('data->status', 'suspended')->count();

        $planBreakdown = [
            'free'  => Tenant::where('data->plan', 'free')->count(),
            'basic' => Tenant::where('data->plan', 'basic')->count(),
            'pro'   => Tenant::where('data->plan', 'pro')->count(),
        ];

        $recentTenants = Tenant::with('domains')->latest()->take(5)->get()
            ->map(fn ($t) => [
                'id'             => $t->id,
                'name'           => $t->school_name ?? $t->id,
                'school_email'   => $t->school_email,
                'contact_number' => $t->contact_number ?? '',
                'plan'           => $t->plan ?? 'free',
                'status'         => $t->status ?? 'active',
                'domain'         => $t->domains->first()?->domain,
                'created_at'     => $t->created_at,
            ]);

        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'total_schools'     => $totalTenants,
                'active_schools'    => $activeTenants,
                'suspended_schools' => $suspendedTenants,
                'plan_breakdown'    => $planBreakdown,
                'total_users'       => 0,
                'total_students'    => 0,
                'total_staff'       => 0,
            ],
            'recentSchools' => $recentTenants,
        ]);
    }
}
