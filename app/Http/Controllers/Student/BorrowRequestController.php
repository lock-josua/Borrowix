<?php

namespace App\Http\Controllers\Student;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BorrowRequestController extends Controller
{
    public function index(): Response
    {
        $this->authorize(Permission::RequestViewAny->value);

        $requests = BorrowRequest::with('equipment')
            ->where('user_id', Auth::id())
            // users only see their own, school constraint enforced elsewhere if needed
            ->latest()
            ->paginate(15);

        return Inertia::render('student/borrow-requests/index', [
            'requests' => $requests,
        ]);
    }

    public function create(Request $request): Response
    {
        $equipment = Equipment::where('status', EquipmentStatus::Available)
            ->where('available_quantity', '>', 0)
            ->with('category')
            ->get(['id', 'name', 'brand', 'model', 'available_quantity', 'category_id', 'image', 'description']);

        return Inertia::render('student/borrow-requests/create', [
            'equipment' => $equipment,
            'preselectedEquipmentId' => $request->query('equipment_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize(Permission::RequestCreate->value);

        $equipment = Equipment::where('id', $request->equipment_id)->firstOrFail();

        $validated = $request->validate([
            'equipment_id' => [
                'required',
                'exists:equipment,id',
                function ($attribute, $value, $fail) use ($equipment) {
                    if (! $equipment->isAvailable()) {
                        $fail('This equipment is not available for borrowing.');
                    }
                },
                function ($attribute, $value, $fail) {
                    $hasActiveTransaction = BorrowTransaction::where('borrower_id', auth()->id())
                        ->where('equipment_id', $value)
                        ->where('status', BorrowTransactionStatus::Active)
                        ->exists();

                    if ($hasActiveTransaction) {
                        $fail('You already have an active transaction for this equipment.');
                    }

                    $hasPendingRequest = BorrowRequest::where('user_id', auth()->id())
                        ->where('equipment_id', $value)
                        ->where('status', BorrowRequestStatus::Pending)
                        ->exists();

                    if ($hasPendingRequest) {
                        $fail('You already have a pending request for this equipment.');
                    }
                },
            ],
            'purpose' => ['required', 'string', 'max:500'],
            'borrow_date' => ['required', 'date', 'after_or_equal:now'],
            'expected_return_date' => ['required', 'date', 'after:borrow_date', 'before_or_equal:+30 days'],
        ]);

        BorrowRequest::create([
            ...$validated,
            'user_id' => Auth::id(),
            'status' => BorrowRequestStatus::Pending,
        ]);

        return redirect()
            ->route('student.requests.index')
            ->with('success', 'Borrow request submitted. Waiting for approval.');
    }

    public function show(BorrowRequest $borrowRequest): Response
    {
        $this->authorizeOwner($borrowRequest);

        $borrowRequest->load(['equipment.category', 'processedBy', 'transaction']);

        return Inertia::render('student/borrow-requests/show', [
            'borrowRequest' => $borrowRequest,
        ]);
    }

    public function cancel(BorrowRequest $borrowRequest): RedirectResponse
    {
        $this->authorizeOwner($borrowRequest);

        abort_if(! $borrowRequest->isPending(), 422, 'Only pending requests can be canceled.');

        $borrowRequest->update(['status' => BorrowRequestStatus::Canceled]);

        return redirect()
            ->route('student.requests.index')
            ->with('success', 'Request canceled.');
    }

    // Students can only manage their own requests
    private function authorizeOwner(BorrowRequest $borrowRequest): void
    {
        abort_if($borrowRequest->user_id !== Auth::id(), 403, 'Unauthorized.');
    }
}
