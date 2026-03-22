<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowTransactionStatus;
use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        // Transactions within date range
        $transactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->whereBetween('issued_at', [$from, $to])
            ->latest('issued_at')
            ->get();

        // Most borrowed equipment
        $topEquipment = BorrowTransaction::selectRaw('equipment_id, count(*) as total')
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('equipment_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('equipment:id,name')
            ->get();

        // Most active borrowers
        $topBorrowers = BorrowTransaction::selectRaw('borrower_id, count(*) as total')
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('borrower_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('borrower:id,name,email')
            ->get();

        $summary = [
            'total_transactions' => $transactions->count(),
            'returned' => $transactions->where('status', BorrowTransactionStatus::Returned)->count(),
            'overdue' => $transactions->where('status', BorrowTransactionStatus::Overdue)->count(),
            'active' => $transactions->where('status', BorrowTransactionStatus::Active)->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'transactions' => $transactions,
            'topEquipment' => $topEquipment,
            'topBorrowers' => $topBorrowers,
            'summary' => $summary,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }
}
