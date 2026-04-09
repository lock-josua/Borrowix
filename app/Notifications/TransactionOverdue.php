<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionOverdue extends Notification
{
    use Queueable;

    public function __construct(public $transaction) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $equipmentName = property_exists($this->transaction, 'equipment')
            ? ($this->transaction->equipment?->name ?? 'equipment')
            : 'equipment';

        return [
            'title' => 'Equipment Overdue',
            'message' => "Your borrowed {$equipmentName} is now overdue. Please return it as soon as possible.",
            'transaction_id' => $this->transaction->id ?? null,
            'equipment_id' => $this->transaction->equipment_id ?? null,
            'action_url' => '/borrow/transactions',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $equipmentName = property_exists($this->transaction, 'equipment')
            ? ($this->transaction->equipment?->name ?? 'equipment')
            : 'equipment';

        return (new MailMessage)
            ->subject('Equipment Overdue - Action Required')
            ->line("Your borrowed {$equipmentName} is now overdue.")
            ->line('Due date was: '.($this->transaction->due_date?->format('M j, Y g:i A') ?? 'N/A'))
            ->action('View Details', url('/borrow/transactions'))
            ->line('Please return the equipment as soon as possible to avoid further penalties.');
    }
}
