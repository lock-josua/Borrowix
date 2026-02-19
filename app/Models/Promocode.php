<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'applicable_plan',
        'max_uses',
        'times_used',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'is_active'      => 'boolean',
            'expires_at'     => 'datetime',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // -------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && now()->isAfter($this->expires_at)) {
            return false;
        }

        if ($this->max_uses !== null && $this->times_used >= $this->max_uses) {
            return false;
        }

        return true;
    }

    // Compute the discounted price given an original amount
    public function computeDiscount(float $amount): float
    {
        if ($this->discount_type === 'percentage') {
            return round($amount * ($this->discount_value / 100), 2);
        }

        // Fixed discount — never exceeds the original amount
        return min($this->discount_value, $amount);
    }
}