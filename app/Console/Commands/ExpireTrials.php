<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ExpireTrials extends Command
{
    protected $signature = 'subscriptions:expire-trials';

    protected $description = 'Expire trials that have ended and send warning emails for trials ending soon.';

    public function handle(SubscriptionService $subscriptionService): int
    {
        $warningDays = config('subscription.trial_warning_days_remaining', 10);

        $warningSubscriptions = Subscription::where('status', 'trialing')
            ->where('trial_warning_sent', false)
            ->whereNotNull('trial_ends_at')
            ->get()
            ->filter(fn ($s) => $s->trialDaysRemaining() === $warningDays);

        foreach ($warningSubscriptions as $subscription) {
            $subscriptionService->sendTrialWarning($subscription);
            $this->info("Warning email sent: {$subscription->tenant_id}");
        }

        $expiredSubscriptions = Subscription::where('status', 'trialing')
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<=', now())
            ->with('tenant')
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscriptionService->expireTrial($subscription);
            $this->info("Trial expired: {$subscription->tenant_id}");
        }

        $this->info('Done. Warned: '.$warningSubscriptions->count().' | Expired: '.$expiredSubscriptions->count());

        return self::SUCCESS;
    }
}
