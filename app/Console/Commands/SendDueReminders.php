<?php

namespace App\Console\Commands;

use App\Enums\BorrowTransactionStatus;
use App\Models\BorrowTransaction;
use App\Notifications\TransactionDueReminder;
use Illuminate\Console\Command;

class SendDueReminders extends Command
{
    protected $signature = 'transactions:send-reminders';

    protected $description = 'Send reminders to borrowers one hour before due date';

    public function handle(): int
    {
        $transactions = BorrowTransaction::where('status', BorrowTransactionStatus::Active)
            ->where('due_date', '>', now())
            ->where('due_date', '<=', now()->addHour())
            ->whereNull('reminder_sent_at')
            ->with(['borrower', 'equipment'])
            ->get();

        if ($transactions->isEmpty()) {
            $this->info('No due reminders to send.');

            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($transactions as $transaction) {
            $transaction->borrower->notify(new TransactionDueReminder($transaction));
            $transaction->update(['reminder_sent_at' => now()]);
            $count++;
        }

        $this->info("Sent {$count} reminder(s).");

        return Command::SUCCESS;
    }
}
