<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Models\BorrowTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BorrowTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $transactions = BorrowTransaction::with(['borrower', 'equipment'])
            ->forCurrentSchool()
            ->when($request->status, fn ($q) => $q->where('status', BorrowTransactionStatus::from($request->status)))
            ->when($request->search, fn ($q) => $q->whereHas('borrower', fn ($q) => $q->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('staff/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(BorrowTransaction $borrowTransaction): Response
    {
        abort_if($borrowTransaction->school_id !== app('current_school')->id, 403);

        $borrowTransaction->load(['borrower', 'equipment', 'issuedBy', 'borrowRequest']);

        return Inertia::render('staff/transactions/show', [
            'transaction' => $borrowTransaction,
        ]);
    }

    public function markReturned(Request $request, BorrowTransaction $borrowTransaction): RedirectResponse
    {
        abort_if($borrowTransaction->school_id !== app('current_school')->id, 403);
        abort_if($borrowTransaction->isReturned(), 422, 'This item has already been returned.');

        $request->validate([
            'return_condition_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $borrowTransaction->update([
            'status' => BorrowTransactionStatus::Returned,
            'returned_at' => now(),
            'returned_to' => Auth::id(),
            'return_condition_notes' => $request->return_condition_notes,
        ]);

        // Return quantity to equipment
        $equipment = $borrowTransaction->equipment;
        $equipment->increment('available_quantity');

        if ($equipment->fresh()->available_quantity > 0 && $equipment->status === EquipmentStatus::Borrowed) {
            $equipment->update(['status' => EquipmentStatus::Available]);
        }

        return redirect()
            ->route('staff.transactions.index')
            ->with('success', 'Item marked as returned.');
    }
}
