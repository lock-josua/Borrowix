<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $activeLoans = BorrowTransaction::with('equipment')
            ->where('borrower_id', $user->id)
            ->where('status', 'active')
            ->orderBy('due_date')
            ->get();

        $pendingRequests = BorrowRequest::with('equipment')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->get();

        $stats = [
            'active_loans'    => $activeLoans->count(),
            'pending_requests' => $pendingRequests->count(),
            'overdue_loans'    => BorrowTransaction::where('borrower_id', $user->id)
                                    ->where('status', 'overdue')->count(),
        ];

        return Inertia::render('student/dashboard', [
            'stats'           => $stats,
            'activeLoans'     => $activeLoans,
            'pendingRequests' => $pendingRequests,
        ]);
    }
}