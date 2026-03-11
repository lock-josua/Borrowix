<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;
use App\Enums\BorrowRequestStatus;

class BorrowRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
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

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------

    public function scopeForCurrentSchool(Builder $query): void
    {
        $query->where('school_id', app('current_school')->id);
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    // The student/staff who submitted the request
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    // The admin/staff who approved or rejected
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(BorrowTransaction::class);
    }

    // -------------------------------------------------------
    // Status Helper Methods
    // -------------------------------------------------------

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
