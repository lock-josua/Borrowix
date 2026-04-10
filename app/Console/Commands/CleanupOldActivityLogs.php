<?php

namespace App\Console\Commands;

use App\Models\SystemLog;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupOldActivityLogs extends Command
{
    protected $signature = 'activity-logs:cleanup {--dry-run : Show what would be deleted without actually deleting}';

    protected $description = 'Clean up activity logs and system logs older than 30 days';

    public function handle(): int
    {
        $days = 30;
        $cutoff = now()->subDays($days);

        $this->info("Cleaning up logs older than {$days} days (before {$cutoff->toDateTimeString()})...");

        // Clean up central system logs
        $systemCount = SystemLog::where('created_at', '<', $cutoff)->count();

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN - No records will be deleted.');
            $this->line("Would delete {$systemCount} central system logs.");

            // For dry-run, we can't easily count tenant activity logs without switching to each tenant
            $this->line('Tenant activity logs: would delete from each tenant database (cannot preview without connecting).');

            return self::SUCCESS;
        }

        // Delete from central system logs
        $systemDeleted = SystemLog::where('created_at', '<', $cutoff)->delete();
        $this->info("Deleted {$systemDeleted} central system logs.");

        // Delete from each tenant's activity_logs table
        $tenants = Tenant::all();
        $totalActivityDeleted = 0;

        foreach ($tenants as $tenant) {
            $deleted = $tenant->run(function () use ($cutoff) {
                return DB::table('activity_logs')->where('created_at', '<', $cutoff)->delete();
            });
            $totalActivityDeleted += $deleted;
            $this->line("Deleted {$deleted} activity logs from {$tenant->id}");
        }

        $this->info("Deleted {$totalActivityDeleted} tenant activity logs total.");

        return self::SUCCESS;
    }
}
