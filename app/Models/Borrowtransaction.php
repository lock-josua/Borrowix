<?php

namespace App\Models;

use App\Enums\BorrowTransactionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        // school_id REMOVED
        'borrow_request_id',
        'borrower_id',
        'equipment_id',
        'issued_by',
        'returned_to',
        'issued_at',
        'due_date',
        'returned_at',
        'status',
        'fine_amount',
        'fine_reason',
        'return_condition_notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'due_date' => 'datetime',
            'returned_at' => 'datetime',
            'fine_amount' => 'decimal:2',
            'status' => BorrowTransactionStatus::class,
        ];
    }

    // school() REMOVED
    // scopeForCurrentSchool() REMOVED

    public function borrowRequest(): BelongsTo
    {
        return $this->belongsTo(BorrowRequest::class);
    }

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function returnedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    public function isActive(): bool
    {
        return $this->status === BorrowTransactionStatus::Active;
    }

    public function isReturned(): bool
    {
        return $this->status === BorrowTransactionStatus::Returned;
    }

    public function isOverdue(): bool
    {
        return $this->status === BorrowTransactionStatus::Overdue
            || ($this->status === BorrowTransactionStatus::Active && now()->isAfter($this->due_date));
    }

    public function hasFine(): bool
    {
        return $this->fine_amount > 0;
    }
}
