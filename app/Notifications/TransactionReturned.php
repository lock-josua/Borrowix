<?php

namespace App\Notifications;

use App\Models\BorrowTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TransactionReturned extends Notification
{
    use Queueable;

    public function __construct(
        public BorrowTransaction $transaction,
        public string $returnedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Equipment Returned',
            'message' => "Your borrowed {$this->transaction->equipment->name} has been marked as returned by {$this->returnedByName}.",
            'transaction_id' => $this->transaction->id,
            'equipment_id' => $this->transaction->equipment_id,
            'equipment_name' => $this->transaction->equipment->name,
            'returned_by' => $this->returnedByName,
            'return_condition_notes' => $this->transaction->return_condition_notes,
            'fine_amount' => $this->transaction->fine_amount,
            'action_url' => '/history/'.$this->transaction->id,
        ];
    }
}
