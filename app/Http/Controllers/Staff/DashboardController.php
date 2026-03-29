<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
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

        return Inertia::render('staff/dashboard', [
            'stats' => $stats,
            'urgentTransactions' => $urgentTransactions,
        ]);
    }
}
