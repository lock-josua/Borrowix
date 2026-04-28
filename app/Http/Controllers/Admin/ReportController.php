<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowTransactionStatus;
use App\Enums\Permission;
use App\Exports\ReportExport;
use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

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

    public function export(Request $request): SymfonyResponse
    {
        $this->authorize(Permission::ReportExport->value);

        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();
        $type = $request->type ?? 'excel';

        $transactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->whereBetween('issued_at', [$from, $to])
            ->latest('issued_at')
            ->get()
            ->map(fn ($t) => [
                'borrower' => ['name' => $t->borrower?->name ?? '—'],
                'equipment' => ['name' => $t->equipment?->name ?? '—'],
                'issued_at' => $t->issued_at,
                'due_date' => $t->due_date,
                'returned_at' => $t->returned_at,
                'status' => $t->status->value ?? '—',
                'fine_amount' => $t->fine_amount ?? 0,
            ])->toArray();

        $topEquipment = BorrowTransaction::selectRaw('equipment_id, count(*) as total')
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('equipment_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('equipment:id,name')
            ->get()
            ->map(fn ($e) => [
                'equipment' => ['name' => $e->equipment?->name ?? '—'],
                'total' => $e->total,
            ])->toArray();

        $topBorrowers = BorrowTransaction::selectRaw('borrower_id, count(*) as total')
            ->whereBetween('issued_at', [$from, $to])
            ->groupBy('borrower_id')
            ->orderByDesc('total')
            ->take(5)
            ->with('borrower:id,name,email')
            ->get()
            ->map(fn ($b) => [
                'borrower' => ['name' => $b->borrower?->name ?? '—', 'email' => $b->borrower?->email ?? '—'],
                'total' => $b->total,
            ])->toArray();

        $summary = [
            'total_transactions' => count($transactions),
            'returned' => collect($transactions)->where('status', BorrowTransactionStatus::Returned->value)->count(),
            'overdue' => collect($transactions)->where('status', BorrowTransactionStatus::Overdue->value)->count(),
            'active' => collect($transactions)->where('status', BorrowTransactionStatus::Active->value)->count(),
        ];

        if ($type === 'pdf') {
            $pdf = Pdf::loadView('pdf.report', compact('transactions', 'topEquipment', 'topBorrowers', 'summary', 'from', 'to'));

            return $pdf->download("report-{$from}-to-{$to}.pdf");
        }

        $filename = "report-{$from}-to-{$to}.xlsx";
        $export = new ReportExport($transactions, $topEquipment, $topBorrowers, $summary, $from, $to);
        $spreadsheet = $export->spreadsheet();

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
