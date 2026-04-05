<?php

namespace App\Notifications;

use App\Models\BorrowTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionOverdue extends Notification
{
    use Queueable;

    public function __construct(public BorrowTransaction $transaction) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Equipment Overdue',
            'message' => "Your borrowed {$this->transaction->equipment->name} is now overdue. Please return it as soon as possible.",
            'transaction_id' => $this->transaction->id,
            'equipment_id' => $this->transaction->equipment_id,
            'action_url' => '/borrow/transactions',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Equipment Overdue - Action Required')
            ->line("Your borrowed {$this->transaction->equipment->name} is now overdue.")
            ->line("Due date was: {$this->transaction->due_date->format('M j, Y g:i A')}")
            ->action('View Details', url('/borrow/transactions'))
            ->line('Please return the equipment as soon as possible to avoid further penalties.');
    }
}
