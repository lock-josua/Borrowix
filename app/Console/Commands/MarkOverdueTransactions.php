<?php

namespace App\Console\Commands;

use App\Enums\BorrowTransactionStatus;
use App\Models\BorrowTransaction;
use App\Notifications\TransactionOverdue;
use Illuminate\Console\Command;

class MarkOverdueTransactions extends Command
{
    protected $signature = 'transactions:mark-overdue';

    protected $description = 'Mark active transactions as overdue when past due date and send notifications';

    public function handle(): int
    {
        $overdueTransactions = BorrowTransaction::where('status', BorrowTransactionStatus::Active)
            ->where('due_date', '<', now())
            ->with(['borrower', 'equipment'])
            ->get();

        if ($overdueTransactions->isEmpty()) {
            $this->info('No overdue transactions found.');

            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($overdueTransactions as $transaction) {
            $transaction->update(['status' => BorrowTransactionStatus::Overdue]);

            if (is_null($transaction->overdue_notification_sent_at)) {
                $transaction->borrower->notify(new TransactionOverdue($transaction));
                $transaction->update(['overdue_notification_sent_at' => now()]);
            }

            $count++;
        }

        $this->info("Marked {$count} transaction(s) as overdue.");

        return Command::SUCCESS;
    }
}
