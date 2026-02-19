<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'school_id',
        'category_id',
        'name',
        'description',
        'serial_number',
        'model',
        'brand',
        'quantity',
        'available_quantity',
        'status',
        'qr_code',
        'condition_notes',
        'damage_photo',
    ];

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function borrowRequests(): HasMany
    {
        return $this->hasMany(BorrowRequest::class);
    }

    public function borrowTransactions(): HasMany
    {
        return $this->hasMany(BorrowTransaction::class);
    }

    // -------------------------------------------------------
    // Status Helper Methods
    // -------------------------------------------------------

    public function isAvailable(): bool
    {
        return $this->available_quantity > 0;
    }

    public function isUnderRepair(): bool
    {
        return $this->status === 'under_repair';
    }

    public function isRetired(): bool
    {
        return $this->status === 'retired';
    }
}