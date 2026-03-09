<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use App\Models\School;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        // Schools growth — count of new schools per month for the last 6 months
        $schoolsGrowth = School::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, count(*) as total')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Borrowing activity — transactions per month for the last 6 months
        $borrowingActivity = BorrowTransaction::selectRaw('DATE_FORMAT(issued_at, "%Y-%m") as month, count(*) as total')
            ->where('issued_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top 5 most active schools by transaction count
        $topSchools = School::withCount('borrowTransactions')
            ->orderByDesc('borrow_transactions_count')
            ->take(5)
            ->get(['id', 'name', 'plan']);

        // Platform totals
        $totals = [
            'schools' => School::count(),
            'users' => User::whereNot('role', 'super_admin')->count(),
            'equipment' => Equipment::count(),
            'transactions' => BorrowTransaction::count(),
            'overdue' => BorrowTransaction::where('status', 'overdue')->count(),
        ];

        return Inertia::render('super-admin/analytics/index', [
            'schoolsGrowth' => $schoolsGrowth,
            'borrowingActivity' => $borrowingActivity,
            'topSchools' => $topSchools,
            'totals' => $totals,
        ]);
    }
}
