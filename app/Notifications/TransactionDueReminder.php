<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionDueReminder extends Notification
{
    use Queueable;

    public function __construct(public $transaction) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $dueIn = now()->diffForHumans($this->transaction->due_date, true);
        $equipmentName = property_exists($this->transaction, 'equipment')
            ? ($this->transaction->equipment?->name ?? 'equipment')
            : 'equipment';

        return [
            'title' => 'Equipment Due Soon',
            'message' => "Your borrowed {$equipmentName} is due in {$dueIn}. Please return it on time.",
            'transaction_id' => $this->transaction->id ?? null,
            'equipment_id' => $this->transaction->equipment_id ?? null,
            'action_url' => '/borrow/transactions',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $dueIn = now()->diffForHumans($this->transaction->due_date, true);
        $equipmentName = property_exists($this->transaction, 'equipment')
            ? ($this->transaction->equipment?->name ?? 'equipment')
            : 'equipment';

        return (new MailMessage)
            ->subject('Equipment Due Soon')
            ->line("Your borrowed {$equipmentName} is due in {$dueIn}.")
            ->line('Due date: '.($this->transaction->due_date?->format('M j, Y g:i A') ?? 'N/A'))
            ->action('View Details', url('/borrow/transactions'))
            ->line('Please return the equipment on time to avoid overdue penalties.');
    }
}
