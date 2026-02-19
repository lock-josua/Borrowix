<?php

namespace App\Http\Controllers\Admin;

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
        $school = app('current_school');

        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        // Transactions within date range
        $transactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->where('school_id', $school->id)
            ->whereBetween('issued_at', [$from, $to])
            ->latest('issued_at')
            ->get();

        // Most borrowed equipment
        $topEquipment = BorrowTransaction::selectRaw('equipment_id, count(*) as total')
            ->where('school_id', $school->id)
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('equipment_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('equipment:id,name')
            ->get();

        // Most active borrowers
        $topBorrowers = BorrowTransaction::selectRaw('borrower_id, count(*) as total')
            ->where('school_id', $school->id)
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('borrower_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('borrower:id,name,email')
            ->get();

        $summary = [
            'total_transactions' => $transactions->count(),
            'returned'           => $transactions->where('status', 'returned')->count(),
            'overdue'            => $transactions->where('status', 'overdue')->count(),
            'active'             => $transactions->where('status', 'active')->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'transactions' => $transactions,
            'topEquipment' => $topEquipment,
            'topBorrowers' => $topBorrowers,
            'summary'      => $summary,
            'filters'      => ['from' => $from, 'to' => $to],
        ]);
    }
}