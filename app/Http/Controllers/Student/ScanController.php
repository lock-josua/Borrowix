<?php

namespace App\Http\Controllers\Student;

use App\Enums\BorrowRequestStatus;
use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use App\Models\EquipmentScanLog;
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

        $qrToken = $request->qr_token;
        $userId = Auth::id();
        $ipAddress = $request->ip();

        $equipment = Equipment::where('qr_code', $qrToken)
            ->with('category')
            ->first();

        if (! $equipment) {
            $this->logScan(
                userId: $userId,
                qrToken: $qrToken,
                result: 'not_found',
                failureReason: 'QR code not recognised',
                ipAddress: $ipAddress,
            );

            return response()->json([
                'error' => 'QR code not recognised. Please scan a valid equipment QR.',
            ], 404);
        }

        if (in_array($equipment->status, [EquipmentStatus::Retired, EquipmentStatus::UnderRepair])) {
            $this->logScan(
                userId: $userId,
                equipmentId: $equipment->id,
                qrToken: $qrToken,
                result: 'unavailable',
                failureReason: "Equipment is {$equipment->status->value}",
                ipAddress: $ipAddress,
            );

            return response()->json([
                'error' => "This equipment is currently {$equipment->status->value} and cannot be borrowed.",
            ], 422);
        }

        if ($equipment->available_quantity < 1) {
            $this->logScan(
                userId: $userId,
                equipmentId: $equipment->id,
                qrToken: $qrToken,
                result: 'unavailable',
                failureReason: 'No available quantity',
                ipAddress: $ipAddress,
            );

            return response()->json([
                'error' => 'All units of this equipment are currently borrowed.',
            ], 422);
        }

        $hasActiveTransaction = BorrowTransaction::where('borrower_id', $userId)
            ->where('equipment_id', $equipment->id)
            ->where('status', BorrowTransactionStatus::Active)
            ->exists();

        if ($hasActiveTransaction) {
            $this->logScan(
                userId: $userId,
                equipmentId: $equipment->id,
                qrToken: $qrToken,
                result: 'already_borrowed',
                failureReason: 'User has active loan for this equipment',
                ipAddress: $ipAddress,
            );

            return response()->json([
                'error' => 'You already have an active loan for this equipment.',
            ], 422);
        }

        $hasPendingRequest = BorrowRequest::where('user_id', $userId)
            ->where('equipment_id', $equipment->id)
            ->where('status', BorrowRequestStatus::Pending)
            ->exists();

        if ($hasPendingRequest) {
            $this->logScan(
                userId: $userId,
                equipmentId: $equipment->id,
                qrToken: $qrToken,
                result: 'already_requested',
                failureReason: 'User has pending request for this equipment',
                ipAddress: $ipAddress,
            );

            return response()->json([
                'error' => 'You already have a pending borrow request for this equipment.',
            ], 422);
        }

        $this->logScan(
            userId: $userId,
            equipmentId: $equipment->id,
            qrToken: $qrToken,
            result: 'success',
            ipAddress: $ipAddress,
        );

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

    private function logScan(
        int $userId,
        string $qrToken,
        string $result,
        ?int $equipmentId = null,
        ?string $failureReason = null,
        ?string $ipAddress = null,
    ): void {
        EquipmentScanLog::create([
            'user_id' => $userId,
            'equipment_id' => $equipmentId,
            'qr_token_scanned' => $qrToken,
            'result' => $result,
            'failure_reason' => $failureReason,
            'ip_address' => $ipAddress,
            'scanned_at' => now(),
        ]);
    }
}
