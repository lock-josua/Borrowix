<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowTransactionStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Traits\HandlesTransactionReturn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BorrowTransactionController extends Controller
{
    use HandlesTransactionReturn;

    public string $routePrefix = 'admin';

    public function index(Request $request): Response
    {
        $transactions = BorrowTransaction::with(['borrower', 'equipment', 'issuedBy'])
            ->when($request->status, fn ($q) => $q->where('status', BorrowTransactionStatus::from($request->status)))
            ->when($request->search, fn ($q) => $q->whereHas('borrower', fn ($q) => $q->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(BorrowTransaction $borrowTransaction): Response
    {
        $this->authorize(Permission::TransactionViewAny->value);

        $borrowTransaction->load(['borrower', 'equipment.category', 'issuedBy', 'returnedTo', 'borrowRequest']);

        return Inertia::render('admin/transactions/show', [
            'transaction' => $borrowTransaction,
        ]);
    }

    public function markReturned(Request $request, BorrowTransaction $borrowTransaction): RedirectResponse
    {
        $this->authorize(Permission::TransactionReturn->value);

        $this->processReturn($request, $borrowTransaction);

        return redirect()
            ->route('admin.transactions.index')
            ->with('success', 'Item marked as returned.');
    }
}
