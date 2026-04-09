<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'available_equipment' => Equipment::where('status', 'available')->count(),
            'active_loans' => BorrowTransaction::where('status', 'active')->count(),
            'overdue_loans' => BorrowTransaction::where('status', 'overdue')->count(),
        ];

        $urgentTransactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->where('status', 'active')
            ->where('due_date', '<=', now()->endOfDay())
            ->latest('due_date')
            ->take(10)
            ->get();

        // Chart data: Daily transactions for last 30 days
        $dailyTransactions = BorrowTransaction::selectRaw('DATE(issued_at) as date, COUNT(*) as count')
            ->where('issued_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'count' => (int) $item->count,
                ];
            });

        // Chart data: Top 5 most borrowed equipment
        $topEquipment = BorrowTransaction::selectRaw('equipment_id, COUNT(*) as count')
            ->groupBy('equipment_id')
            ->orderByDesc('count')
            ->take(5)
            ->with('equipment:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->equipment->name ?? 'Unknown',
                    'count' => (int) $item->count,
                ];
            });

        return Inertia::render('staff/dashboard', [
            'stats' => $stats,
            'urgentTransactions' => $urgentTransactions,
            'chartData' => [
                'dailyTransactions' => $dailyTransactions,
                'topEquipment' => $topEquipment,
            ],
        ]);
    }
}
