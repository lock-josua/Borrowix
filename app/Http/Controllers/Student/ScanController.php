<?php

namespace App\Http\Controllers\Student;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('student/scan');
    }

    public function resolve(Request $request): JsonResponse
    {
        $request->validate([
            'qr_token' => ['required', 'string', 'size:36'],
        ]);

        $equipment = \App\Models\Equipment::where('qr_code', $request->qr_token)
            ->with('category')
            ->first();

        if (! $equipment) {
            return response()->json([
                'error' => 'QR code not recognised. Please scan a valid equipment QR.',
            ], 404);
        }

        if (in_array($equipment->status, [EquipmentStatus::Retired, EquipmentStatus::UnderRepair])) {
            return response()->json([
                'error' => "This equipment is currently {$equipment->status->value} and cannot be borrowed.",
            ], 422);
        }

        if ($equipment->available_quantity < 1) {
            return response()->json([
                'error' => 'All units of this equipment are currently borrowed.',
            ], 422);
        }

        $hasActiveTransaction = BorrowTransaction::where('borrower_id', Auth::id())
            ->where('equipment_id', $equipment->id)
            ->where('status', BorrowTransactionStatus::Active)
            ->exists();

        if ($hasActiveTransaction) {
            return response()->json([
                'error' => 'You already have an active loan for this equipment.',
            ], 422);
        }

        $hasPendingRequest = BorrowRequest::where('user_id', Auth::id())
            ->where('equipment_id', $equipment->id)
            ->where('status', BorrowRequestStatus::Pending)
            ->exists();

        if ($hasPendingRequest) {
            return response()->json([
                'error' => 'You already have a pending borrow request for this equipment.',
            ], 422);
        }

        return response()->json([
            'equipment' => [
                'id' => $equipment->id,
                'name' => $equipment->name,
                'brand' => $equipment->brand,
                'model' => $equipment->model,
                'available_quantity' => $equipment->available_quantity,
                'status' => $equipment->status->value,
                'image_url' => $equipment->image_url,
                'category' => $equipment->category
                    ? ['name' => $equipment->category->name]
                    : null,
            ],
        ]);
    }
}
