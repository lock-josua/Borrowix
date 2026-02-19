<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
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
            'trial_ends_at'        => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end'   => 'datetime',
            'canceled_at'          => 'datetime',
            'grace_period_ends_at' => 'datetime',
            'discount_amount'      => 'decimal:2',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    // -------------------------------------------------------
    // Status Helper Methods
    // -------------------------------------------------------

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