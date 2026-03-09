<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class School extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'logo',
        'address',
        'contact_number',
        'plan',
        'status',
        'suspension_reason',
        'stripe_customer_id',
        'paymongo_customer_id',
    ];

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function admin(): HasOne
    {
        return $this->hasOne(User::class)->where('role', 'admin');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'staff');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function borrowRequests(): HasMany
    {
        return $this->hasMany(BorrowRequest::class);
    }

    public function borrowTransactions(): HasMany
    {
        return $this->hasMany(BorrowTransaction::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    // -------------------------------------------------------
    // Status Helper Methods
    // -------------------------------------------------------

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isOnFreePlan(): bool
    {
        return $this->plan === 'free';
    }

    public function isOnBasicPlan(): bool
    {
        return $this->plan === 'basic';
    }

    public function isOnProPlan(): bool
    {
        return $this->plan === 'pro';
    }

    // Returns true if school can access Basic+ features
    public function hasPaidPlan(): bool
    {
        return in_array($this->plan, ['basic', 'pro']);
    }
}
