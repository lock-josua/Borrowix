<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $connection = 'mysql';

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
