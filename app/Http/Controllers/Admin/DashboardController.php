<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
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
            'total_equipment' => Equipment::forCurrentSchool()->count(),
            'available_equipment' => Equipment::forCurrentSchool()
                ->where('status', EquipmentStatus::Available)->count(),
            'pending_requests' => BorrowRequest::forCurrentSchool()
                ->where('status', BorrowRequestStatus::Pending)->count(),
            'active_loans' => BorrowTransaction::forCurrentSchool()
                ->where('status', BorrowTransactionStatus::Active)->count(),
            'overdue_loans' => BorrowTransaction::forCurrentSchool()
                ->where('status', BorrowTransactionStatus::Overdue)->count(),
            'total_students' => User::forCurrentSchool()
                ->where('role', 'student')->count(),
            'total_staff' => User::forCurrentSchool()
                ->where('role', 'staff')->count(),
        ];

        $pendingRequests = BorrowRequest::with(['requester', 'equipment'])
            ->forCurrentSchool()
            ->where('status', BorrowRequestStatus::Pending)
            ->latest()
            ->take(5)
            ->get();

        $overdueTransactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->forCurrentSchool()
            ->where('status', BorrowTransactionStatus::Overdue)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'pendingRequests' => $pendingRequests,
            'overdueTransactions' => $overdueTransactions,
            'school' => $school,
        ]);
    }
}
