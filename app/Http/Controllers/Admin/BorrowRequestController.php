<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Notifications\BorrowRequestApproved;
use App\Notifications\BorrowRequestRejected;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BorrowRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize(Permission::RequestViewAny->value);

        $requests = BorrowRequest::with(['requester', 'equipment'])
            ->when($request->status, fn ($q) => $q->where('status', BorrowRequestStatus::from($request->status)))
            ->when($request->search, fn ($q) => $q->whereHas('requester', fn ($q) => $q->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->getViewPrefix().'/requests/index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(BorrowRequest $borrowRequest): Response
    {
        $this->authorize(Permission::RequestViewAny->value);

        $borrowRequest->load(['requester', 'equipment.category', 'processedBy']);

        return Inertia::render($this->getViewPrefix().'/requests/show', [
            'borrowRequest' => $borrowRequest,
        ]);
    }

    public function approve(Request $request, BorrowRequest $borrowRequest): RedirectResponse
    {
        $this->authorize(Permission::RequestApprove->value);

        $request->validate([
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        if (! $borrowRequest->isPending()) {
            return back()->with('error', 'This request has already been processed.');
        }

        // Use DB transaction with row lock to prevent race conditions
        return DB::transaction(function () use ($borrowRequest, $request) {
            // Lock the equipment row to prevent concurrent approvals
            $equipment = \App\Models\Equipment::where('id', $borrowRequest->equipment_id)->lockForUpdate()->first();

            if (! $equipment->isAvailable()) {
                return back()->with('error', 'This equipment is no longer available.');
            }

            // Approve the request
            $borrowRequest->update([
                'status' => BorrowRequestStatus::Approved,
                'processed_by' => Auth::id(),
                'remarks' => $request->remarks,
                'processed_at' => now(),
            ]);

            // Create the active transaction
            BorrowTransaction::create([
                'borrow_request_id' => $borrowRequest->id,
                'borrower_id' => $borrowRequest->user_id,
                'equipment_id' => $borrowRequest->equipment_id,
                'issued_by' => Auth::id(),
                'issued_at' => now(),
                'due_date' => $borrowRequest->expected_return_date,
                'status' => BorrowTransactionStatus::Active,
            ]);

            // Decrement available quantity
            $equipment->decrement('available_quantity');

            // Update equipment status if fully borrowed
            if ($equipment->fresh()->available_quantity === 0) {
                $equipment->update(['status' => EquipmentStatus::Borrowed]);
            }

            // Send notification to the student
            $borrowRequest->requester->notify(new BorrowRequestApproved($borrowRequest, Auth::user()->name));

            return redirect()
                ->route($this->getRedirectRoute())
                ->with('success', 'Request approved and transaction created.');
        });
    }

    public function reject(Request $request, BorrowRequest $borrowRequest): RedirectResponse
    {
        $this->authorize(Permission::RequestReject->value);

        abort_if(! $borrowRequest->isPending(), 422, 'This request has already been processed.');

        $request->validate([
            'remarks' => ['required', 'string', 'max:500'],
        ]);

        $borrowRequest->update([
            'status' => BorrowRequestStatus::Rejected,
            'processed_by' => Auth::id(),
            'remarks' => $request->remarks,
            'processed_at' => now(),
        ]);

        // Send notification to the student
        $borrowRequest->requester->notify(new BorrowRequestRejected($borrowRequest, Auth::user()->name));

        return redirect()
            ->route($this->getRedirectRoute())
            ->with('success', 'Request rejected.');
    }

    private function getRedirectRoute(): string
    {
        return request()->routeIs('staff.*') ? 'staff.requests.index' : 'admin.requests.index';
    }

    private function getViewPrefix(): string
    {
        return request()->routeIs('staff.*') ? 'staff' : 'admin';
    }
}
