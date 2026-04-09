<?php

namespace App\Notifications;

use App\Models\BorrowRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BorrowRequestRejected extends Notification
{
    use Queueable;

    public function __construct(
        public BorrowRequest $borrowRequest,
        public string $processedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Borrow Request Rejected',
            'message' => "Your request for {$this->borrowRequest->equipment->name} has been rejected by {$this->processedByName}.",
            'borrow_request_id' => $this->borrowRequest->id,
            'equipment_id' => $this->borrowRequest->equipment_id,
            'equipment_name' => $this->borrowRequest->equipment->name,
            'processed_by' => $this->processedByName,
            'remarks' => $this->borrowRequest->remarks,
            'action_url' => '/borrow-requests/'.$this->borrowRequest->id,
        ];
    }
}
