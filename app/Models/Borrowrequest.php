<?php

namespace App\Models;

use App\Enums\BorrowRequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BorrowRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        // school_id REMOVED
        'user_id',
        'equipment_id',
        'purpose',
        'borrow_date',
        'expected_return_date',
        'status',
        'processed_by',
        'remarks',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'borrow_date' => 'datetime',
            'expected_return_date' => 'datetime',
            'processed_at' => 'datetime',
            'status' => BorrowRequestStatus::class,
        ];
    }

    // school() REMOVED
    // scopeForCurrentSchool() REMOVED

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(BorrowTransaction::class);
    }

    public function isPending(): bool
    {
        return $this->status === BorrowRequestStatus::Pending;
    }

    public function isApproved(): bool
    {
        return $this->status === BorrowRequestStatus::Approved;
    }

    public function isRejected(): bool
    {
        return $this->status === BorrowRequestStatus::Rejected;
    }

    public function isCanceled(): bool
    {
        return $this->status === BorrowRequestStatus::Canceled;
    }
}
