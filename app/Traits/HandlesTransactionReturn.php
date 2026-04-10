<?php

namespace App\Traits;

use App\Enums\BorrowTransactionStatus;
use App\Enums\EquipmentStatus;
use App\Models\BorrowTransaction;
use App\Notifications\TransactionReturned;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

trait HandlesTransactionReturn
{
    protected function processReturn(Request $request, BorrowTransaction $borrowTransaction): void
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

        $this->updateEquipmentAvailability($borrowTransaction);
        $this->sendReturnNotification($borrowTransaction);
        $this->logReturnActivity($borrowTransaction, $request->fine_amount ?? 0);
    }

    protected function updateEquipmentAvailability(BorrowTransaction $borrowTransaction): void
    {
        $equipment = $borrowTransaction->equipment;
        $equipment->increment('available_quantity');

        if ($equipment->fresh()->available_quantity > 0 && $equipment->status === EquipmentStatus::Borrowed) {
            $equipment->update(['status' => EquipmentStatus::Available]);
        }
    }

    protected function sendReturnNotification(BorrowTransaction $borrowTransaction): void
    {
        $borrowTransaction->borrower->notify(
            new TransactionReturned($borrowTransaction, Auth::user()->name)
        );
    }

    protected function logReturnActivity(BorrowTransaction $borrowTransaction, float $fineAmount): void
    {
        ActivityLogService::log(
            'transaction_returned',
            "Marked transaction #{$borrowTransaction->id} as returned",
            Auth::id(),
            [
                'transaction_id' => $borrowTransaction->id,
                'equipment_id' => $borrowTransaction->equipment_id,
                'borrower_id' => $borrowTransaction->borrower_id,
                'fine_amount' => $fineAmount,
            ]
        );
    }
}
