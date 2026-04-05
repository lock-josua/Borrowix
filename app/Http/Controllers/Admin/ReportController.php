<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowTransactionStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize(Permission::ReportView->value);

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

    public function export(Request $request): StreamedResponse
    {
        $this->authorize(Permission::ReportExport->value);

        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        $transactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->whereBetween('issued_at', [$from, $to])
            ->latest('issued_at')
            ->get();

        $topEquipment = BorrowTransaction::selectRaw('equipment_id, count(*) as total')
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('equipment_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('equipment:id,name')
            ->get();

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

        $filename = "report-{$from}-to-{$to}.csv";

        return response()->streamDownload(function () use ($transactions, $topEquipment, $topBorrowers, $summary, $from, $to) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Report Period', $from, 'to', $to]);
            fputcsv($handle, []);

            fputcsv($handle, ['=== SUMMARY ===']);
            fputcsv($handle, ['Metric', 'Count']);
            fputcsv($handle, ['Total Transactions', $summary['total_transactions']]);
            fputcsv($handle, ['Returned', $summary['returned']]);
            fputcsv($handle, ['Active', $summary['active']]);
            fputcsv($handle, ['Overdue', $summary['overdue']]);
            fputcsv($handle, []);

            fputcsv($handle, ['=== TRANSACTIONS ===']);
            fputcsv($handle, ['Borrower', 'Equipment', 'Issued At', 'Due Date', 'Returned At', 'Status', 'Fine']);
            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->borrower?->name ?? '—',
                    $t->equipment?->name ?? '—',
                    $t->issued_at,
                    $t->due_date,
                    $t->returned_at ?? '—',
                    $t->status->value ?? '—',
                    $t->fine_amount > 0 ? '₱'.$t->fine_amount : '—',
                ]);
            }
            fputcsv($handle, []);

            fputcsv($handle, ['=== TOP EQUIPMENT ===']);
            fputcsv($handle, ['#', 'Equipment', 'Times Borrowed']);
            foreach ($topEquipment as $index => $e) {
                fputcsv($handle, [
                    $index + 1,
                    $e->equipment?->name ?? '—',
                    $e->total,
                ]);
            }
            fputcsv($handle, []);

            fputcsv($handle, ['=== TOP BORROWERS ===']);
            fputcsv($handle, ['#', 'Name', 'Email', 'Times Borrowed']);
            foreach ($topBorrowers as $index => $b) {
                fputcsv($handle, [
                    $index + 1,
                    $b->borrower?->name ?? '—',
                    $b->borrower?->email ?? '—',
                    $b->total,
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
