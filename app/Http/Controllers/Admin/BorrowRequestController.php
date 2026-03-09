<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BorrowRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $school = app('current_school');

        $requests = BorrowRequest::with(['requester', 'equipment'])
            ->where('school_id', $school->id)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->whereHas('requester', fn ($q) => $q->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/requests/index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(BorrowRequest $borrowRequest): Response
    {
        $this->authorizeSchool($borrowRequest);

        $borrowRequest->load(['requester', 'equipment.category', 'processedBy']);

        return Inertia::render('admin/requests/show', [
            'borrowRequest' => $borrowRequest,
        ]);
    }

    public function approve(Request $request, BorrowRequest $borrowRequest): RedirectResponse
    {
        $this->authorizeSchool($borrowRequest);

        abort_if(! $borrowRequest->isPending(), 422, 'This request has already been processed.');
        abort_if(! $borrowRequest->equipment->isAvailable(), 422, 'This equipment is no longer available.');

        $request->validate([
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        // Approve the request
        $borrowRequest->update([
            'status' => 'approved',
            'processed_by' => Auth::id(),
            'remarks' => $request->remarks,
            'processed_at' => now(),
        ]);

        // Create the active transaction
        BorrowTransaction::create([
            'school_id' => $borrowRequest->school_id,
            'borrow_request_id' => $borrowRequest->id,
            'borrower_id' => $borrowRequest->user_id,
            'equipment_id' => $borrowRequest->equipment_id,
            'issued_by' => Auth::id(),
            'issued_at' => now(),
            'due_date' => $borrowRequest->expected_return_date,
            'status' => 'active',
        ]);

        // Decrement available quantity
        $borrowRequest->equipment->decrement('available_quantity');

        // Update equipment status if fully borrowed
        if ($borrowRequest->equipment->fresh()->available_quantity === 0) {
            $borrowRequest->equipment->update(['status' => 'borrowed']);
        }

        return redirect()
            ->route('admin.requests.index')
            ->with('success', 'Request approved and transaction created.');
    }

    public function reject(Request $request, BorrowRequest $borrowRequest): RedirectResponse
    {
        $this->authorizeSchool($borrowRequest);

        abort_if(! $borrowRequest->isPending(), 422, 'This request has already been processed.');

        $request->validate([
            'remarks' => ['required', 'string', 'max:500'],
        ]);

        $borrowRequest->update([
            'status' => 'rejected',
            'processed_by' => Auth::id(),
            'remarks' => $request->remarks,
            'processed_at' => now(),
        ]);

        return redirect()
            ->route('admin.requests.index')
            ->with('success', 'Request rejected.');
    }

    private function authorizeSchool(BorrowRequest $borrowRequest): void
    {
        abort_if($borrowRequest->school_id !== app('current_school')->id, 403, 'Unauthorized.');
    }
}
