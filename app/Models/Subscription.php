<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    /**
     * Always use the central database connection.
     * The subscriptions table lives in the central DB,
     * not in any tenant database.
     */
    protected $connection = 'mysql';

    public const PLANS = ['free', 'basic', 'pro'];

    public const STATUSES = ['active', 'trialing', 'past_due', 'canceled', 'paused'];

    public const BILLING_CYCLES = ['monthly', 'annual'];

    public const PRICES = [
        'free' => ['monthly' => 0, 'annual' => 0],
        'basic' => ['monthly' => 499, 'annual' => 4_990],
        'pro' => ['monthly' => 999, 'annual' => 9_990],
    ];

    protected $fillable = [
        'tenant_id',  // was school_id — now references tenants table
        'plan',
        'status',
        'billing_cycle',
        'stripe_subscription_id',
        'paymongo_subscription_id',
        'promo_code_id',
        'discount_amount',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'canceled_at',
        'grace_period_ends_at',
        'card_brand',
        'card_last_four',
    ];

    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'canceled_at' => 'datetime',
            'grace_period_ends_at' => 'datetime',
            'discount_amount' => 'decimal:2',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isTrialing(): bool
    {
        return $this->status === 'trialing';
    }

    public function isPastDue(): bool
    {
        return $this->status === 'past_due';
    }

    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }

    public function isWithinGracePeriod(): bool
    {
        return $this->grace_period_ends_at !== null
            && now()->isBefore($this->grace_period_ends_at);
    }
}
