<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $connection = 'mysql';

    /**
     * Valid enum values enforced by MySQL:
     *   plan   : 'monthly' | 'annually'
     *   status : 'trialing' | 'subscribed' | 'trial_expired' | 'suspended'
     *
     * There is no 'free' plan and no 'active' status.
     * Legacy JSON data on the Tenant model may have plan='free' or status='active' —
     * those values are stale and should be ignored in favor of this table.
     *
     * A tenant's access status is always derived from this table, not from tenant()->plan
     * or tenant()->status. Use $tenant->subscription->status for all status checks.
     */
    protected $fillable = [
        'tenant_id',
        'plan',
        'status',
        'paypal_subscription_id',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'suspension_reason',
        'canceled_at',
        'trial_warning_sent',
    ];

    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'canceled_at' => 'datetime',
            'trial_warning_sent' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    public function isTrialing(): bool
    {
        return $this->status === 'trialing';
    }

    public function isSubscribed(): bool
    {
        return $this->status === 'subscribed';
    }

    public function isTrialExpired(): bool
    {
        return $this->status === 'trial_expired';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trialing', 'subscribed']);
    }

    public function isAccessBlocked(): bool
    {
        return in_array($this->status, ['trial_expired', 'suspended']);
    }

    public function trialDaysRemaining(): int
    {
        if (! $this->trial_ends_at || ! $this->isTrialing()) {
            return 0;
        }

        return (int) max(0, now()->diffInDays($this->trial_ends_at, false));
    }
}
