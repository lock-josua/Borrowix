<?php

namespace App\Http\Controllers\Student;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BorrowHistoryController extends Controller
{
    public function index(): Response
    {
        $this->authorize(Permission::HistoryViewAny->value);

        $history = BorrowTransaction::with('equipment')
            ->where('borrower_id', Auth::id())
            ->latest('issued_at')
            ->paginate(15);

        return Inertia::render('student/history/index', [
            'history' => $history,
        ]);
    }

    public function show(BorrowTransaction $borrowTransaction): Response
    {
        $this->authorize(Permission::HistoryViewAny->value);

        abort_if($borrowTransaction->borrower_id !== Auth::id(), 403, 'Unauthorized.');

        $borrowTransaction->load(['equipment.category', 'issuedBy', 'returnedTo', 'borrowRequest']);

        return Inertia::render('student/history/show', [
            'transaction' => $borrowTransaction,
        ]);
    }
}
