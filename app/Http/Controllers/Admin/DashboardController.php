<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $school = app('current_school');

        $stats = [
            'total_equipment'    => Equipment::where('school_id', $school->id)->count(),
            'available_equipment' => Equipment::where('school_id', $school->id)
                                        ->where('status', 'available')->count(),
            'pending_requests'   => BorrowRequest::where('school_id', $school->id)
                                        ->where('status', 'pending')->count(),
            'active_loans'       => BorrowTransaction::where('school_id', $school->id)
                                        ->where('status', 'active')->count(),
            'overdue_loans'      => BorrowTransaction::where('school_id', $school->id)
                                        ->where('status', 'overdue')->count(),
            'total_students'     => User::where('school_id', $school->id)
                                        ->where('role', 'student')->count(),
            'total_staff'        => User::where('school_id', $school->id)
                                        ->where('role', 'staff')->count(),
        ];

        $pendingRequests = BorrowRequest::with(['requester', 'equipment'])
            ->where('school_id', $school->id)
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        $overdueTransactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->where('school_id', $school->id)
            ->where('status', 'overdue')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats'               => $stats,
            'pendingRequests'     => $pendingRequests,
            'overdueTransactions' => $overdueTransactions,
            'school'              => $school,
        ]);
    }
}