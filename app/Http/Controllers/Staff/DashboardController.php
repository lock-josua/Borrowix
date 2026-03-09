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
        $school = app('current_school');

        $stats = [
            'available_equipment' => Equipment::where('school_id', $school->id)
                ->where('status', 'available')->count(),
            'active_loans' => BorrowTransaction::where('school_id', $school->id)
                ->where('status', 'active')->count(),
            'overdue_loans' => BorrowTransaction::where('school_id', $school->id)
                ->where('status', 'overdue')->count(),
        ];

        // Transactions due today or already overdue — staff needs to action these
        $urgentTransactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->where('school_id', $school->id)
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
