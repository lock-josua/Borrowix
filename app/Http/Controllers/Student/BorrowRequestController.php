<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Enums\BorrowRequestStatus;
use App\Enums\EquipmentStatus;
use App\Models\BorrowRequest;
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
        $requests = BorrowRequest::with('equipment')
            ->where('user_id', Auth::id())
            // users only see their own, school constraint enforced elsewhere if needed
            ->latest()
            ->paginate(15);

        return Inertia::render('student/borrow-requests/index', [
            'requests' => $requests,
        ]);
    }

    public function create(): Response
    {
        $equipment = Equipment::forCurrentSchool()
            ->where('status', EquipmentStatus::Available)
            ->where('available_quantity', '>', 0)
            ->with('category')
            ->get(['id', 'name', 'brand', 'model', 'available_quantity', 'category_id']);

        return Inertia::render('student/borrow-requests/create', [
            'equipment' => $equipment,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $school = app('current_school');

        $validated = $request->validate([
            'equipment_id' => ['required', 'exists:equipment,id'],
            'purpose' => ['required', 'string', 'max:500'],
            'borrow_date' => ['required', 'date', 'after_or_equal:now'],
            'expected_return_date' => ['required', 'date', 'after:borrow_date'],
        ]);

        // Make sure the equipment belongs to the student's school
        $equipment = Equipment::forCurrentSchool()
            ->where('id', $validated['equipment_id'])
            ->firstOrFail();

        abort_if(! $equipment->isAvailable(), 422, 'This equipment is not available for borrowing.');

        BorrowRequest::create([
            ...$validated,
            'school_id' => $school->id,
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
