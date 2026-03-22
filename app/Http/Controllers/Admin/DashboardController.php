<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
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
        $stats = [
            'total_equipment' => Equipment::count(),
            'available_equipment' => Equipment::where('status', EquipmentStatus::Available)->count(),
            'pending_requests' => BorrowRequest::where('status', BorrowRequestStatus::Pending)->count(),
            'active_loans' => BorrowTransaction::where('status', BorrowTransactionStatus::Active)->count(),
            'overdue_loans' => BorrowTransaction::where('status', BorrowTransactionStatus::Overdue)->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_staff' => User::where('role', 'staff')->count(),
        ];

        $pendingRequests = BorrowRequest::with(['requester', 'equipment'])
            ->where('status', BorrowRequestStatus::Pending)
            ->latest()
            ->take(5)
            ->get();

        $overdueTransactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->where('status', BorrowTransactionStatus::Overdue)
            ->latest()
            ->take(5)
            ->get();

        $tenant = tenant();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'pendingRequests' => $pendingRequests,
            'overdueTransactions' => $overdueTransactions,
            'school' => [
                'name' => $tenant->school_name ?? $tenant->id,
                'plan' => $tenant->plan ?? 'free',
                'status' => $tenant->status ?? 'active',
            ],
        ]);
    }
}
