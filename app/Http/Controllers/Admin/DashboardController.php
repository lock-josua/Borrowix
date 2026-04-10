<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use App\Models\User;
use Carbon\Carbon;
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

        $tenant = tenant();

        $recentActivity = ActivityLog::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'description' => $log->description,
                'user_name' => $log->user?->name ?? 'System',
                'created_at' => $log->created_at->toIsoString(),
                'time_ago' => $log->created_at->diffForHumans(),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'pendingRequests' => $pendingRequests,
            'overdueTransactions' => $overdueTransactions,
            'recentActivity' => $recentActivity,
            'chartData' => [
                'dailyTransactions' => $dailyTransactions,
                'topEquipment' => $topEquipment,
            ],
            'school' => [
                'name' => $tenant->school_name ?? $tenant->id,
                'plan' => $tenant->plan ?? 'free',
                'status' => $tenant->status ?? 'active',
            ],
        ]);
    }
}
