<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
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
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function borrowRequest(): BelongsTo
    {
        return $this->belongsTo(BorrowRequest::class);
    }

    // The student who borrowed
    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    // Staff who released the equipment
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    // Staff who received the return
    public function returnedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    // -------------------------------------------------------
    // Status Helper Methods
    // -------------------------------------------------------

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isReturned(): bool
    {
        return $this->status === 'returned';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'overdue'
            || ($this->status === 'active' && now()->isAfter($this->due_date));
    }

    public function hasFine(): bool
    {
        return $this->fine_amount > 0;
    }
}
