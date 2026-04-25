<?php

namespace App\Services;

use App\Mail\SubscriptionActivatedMail;
use App\Mail\TrialEndingMail;
use App\Mail\TrialExpiredMail;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Mail;

class SubscriptionService
{
    public function startTrial(Tenant $tenant): Subscription
    {
        $trialDays = config('subscription.trial_days', 14);

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'plan' => null,
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays($trialDays),
        ]);

        $tenant->update(['status' => 'trialing']);

        return $subscription;
    }

    public function expireTrial(Subscription $subscription): void
    {
        $subscription->update(['status' => 'trial_expired']);
        $subscription->tenant->update(['status' => 'trial_expired']);

        Mail::to($subscription->tenant->school_email)
            ->send(new TrialExpiredMail(
                schoolName: $subscription->tenant->school_name ?? $subscription->tenant->id,
                adminEmail: $subscription->tenant->school_email,
            ));

        SystemLogService::log(
            'trial_expired',
            "Trial expired for {$subscription->tenant->school_name}",
            $subscription->tenant_id,
            'system'
        );
    }

    public function sendTrialWarning(Subscription $subscription): void
    {
        $subscription->update(['trial_warning_sent' => true]);

        Mail::to($subscription->tenant->school_email)
            ->send(new TrialEndingMail(
                schoolName: $subscription->tenant->school_name ?? $subscription->tenant->id,
                adminEmail: $subscription->tenant->school_email,
                daysRemaining: $subscription->trialDaysRemaining(),
            ));

        SystemLogService::log(
            'trial_warning_sent',
            "Trial warning email sent to {$subscription->tenant->school_name}",
            $subscription->tenant_id,
            'system'
        );
    }

    public function activate(Subscription $subscription, string $plan, array $paypalData): void
    {
        $nextBillingTime = $paypalData['billing_info']['next_billing_time'] ?? null;

        $subscription->update([
            'status' => 'subscribed',
            'plan' => $plan,
            'paypal_subscription_id' => $paypalData['id'],
            'current_period_start' => now(),
            'current_period_end' => $nextBillingTime
                ? CarbonImmutable::parse($nextBillingTime)
                : ($plan === 'monthly' ? now()->addMonth() : now()->addYear()),
            'trial_ends_at' => null,
        ]);

        $subscription->tenant->update([
            'status' => 'subscribed',
            'plan' => $plan,
        ]);

        $amount = config("subscription.plans.{$plan}.price");
        SubscriptionPayment::create([
            'tenant_id' => $subscription->tenant_id,
            'subscription_id' => $subscription->id,
            'paypal_subscription_id' => $paypalData['id'],
            'plan' => $plan,
            'amount' => $amount,
            'currency' => 'PHP',
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        Mail::to($subscription->tenant->school_email)
            ->send(new SubscriptionActivatedMail(
                schoolName: $subscription->tenant->school_name ?? $subscription->tenant->id,
                plan: $plan,
                amount: $amount,
                nextBilling: $subscription->fresh()->current_period_end,
            ));

        SystemLogService::log(
            'subscription_activated',
            "Subscription activated for {$subscription->tenant->school_name} — Plan: {$plan}",
            $subscription->tenant_id,
            'admin'
        );
    }

    public function suspend(Subscription $subscription, string $reason): void
    {
        $subscription->update([
            'status' => 'suspended',
            'suspension_reason' => $reason,
        ]);
    }

    public function reactivate(Subscription $subscription): void
    {
        $newStatus = $subscription->paypal_subscription_id ? 'subscribed' : 'trial_expired';

        $subscription->update([
            'status' => $newStatus,
            'suspension_reason' => null,
        ]);
    }
}
