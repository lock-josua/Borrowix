<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Notifications\TransactionReturned;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BorrowTransactionController extends Controller
{
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

        abort_if($borrowTransaction->isReturned(), 422, 'This item has already been returned.');

        $request->validate([
            'return_condition_notes' => ['nullable', 'string', 'max:500'],
            'fine_amount' => ['nullable', 'numeric', 'min:0'],
            'fine_reason' => ['nullable', 'string', 'max:255'],
        ]);

        $borrowTransaction->update([
            'status' => BorrowTransactionStatus::Returned,
            'returned_at' => now(),
            'returned_to' => Auth::id(),
            'return_condition_notes' => $request->return_condition_notes,
            'fine_amount' => $request->fine_amount ?? 0,
            'fine_reason' => $request->fine_reason,
        ]);

        // Return quantity back to equipment
        $equipment = $borrowTransaction->equipment;
        $equipment->increment('available_quantity');

        // Set status back to available if it was borrowed
        if ($equipment->fresh()->available_quantity > 0 && $equipment->status === EquipmentStatus::Borrowed) {
            $equipment->update(['status' => EquipmentStatus::Available]);
        }

        // Send notification to the borrower
        $borrowTransaction->borrower->notify(new TransactionReturned($borrowTransaction, Auth::user()->name));

        return redirect()
            ->route('admin.transactions.index')
            ->with('success', 'Item marked as returned.');
    }
}
