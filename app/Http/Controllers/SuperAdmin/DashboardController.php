<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalSchools = School::count();
        $activeSchools = School::where('status', 'active')->count();
        $suspendedSchools = School::where('status', 'suspended')->count();

        $planBreakdown = School::selectRaw('plan, count(*) as total')
            ->groupBy('plan')
            ->pluck('total', 'plan')
            ->toArray();

        $recentSchools = School::latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'plan', 'status', 'created_at']);

        $totalUsers = User::whereNot('role', 'super_admin')->count();
        $totalStudents = User::where('role', 'student')->count();
        $totalStaff = User::where('role', 'staff')->count();

        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'total_schools' => $totalSchools,
                'active_schools' => $activeSchools,
                'suspended_schools' => $suspendedSchools,
                'total_users' => $totalUsers,
                'total_students' => $totalStudents,
                'total_staff' => $totalStaff,
                'plan_breakdown' => $planBreakdown,
            ],
            'recentSchools' => $recentSchools,
        ]);
    }
}
