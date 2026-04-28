<?php

namespace App\Models;

use App\Enums\EquipmentStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['image_url'];

    /**
     * NOTE on image columns:
     *   image        — primary display photo for the equipment listing (Cloudinary URL).
     *                  Set when equipment is created or updated via the equipment form.
     *   damage_photo — photo taken at time of return when the borrower reports damage.
     *                  Set during the return flow, not at equipment creation.
     *
     * Both store Cloudinary secure URLs (https://res.cloudinary.com/...).
     * The imageUrl accessor wraps `image` for frontend consumption.
     * damage_photo is accessed directly — no accessor defined.
     */
    protected $fillable = [
        // school_id REMOVED
        'category_id',
        'name',
        'description',
        'serial_number',
        'model',
        'brand',
        'quantity',
        'available_quantity',
        'status',
        'condition_notes',
        'damage_photo',
        'image',
        'qr_code',
    ];

    protected function casts(): array
    {
        return ['status' => EquipmentStatus::class];
    }

    // school() REMOVED
    // scopeForCurrentSchool() REMOVED

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

    public function isAvailable(): bool
    {
        return $this->available_quantity > 0;
    }

    public function isUnderRepair(): bool
    {
        return $this->status === EquipmentStatus::UnderRepair;
    }

    public function isRetired(): bool
    {
        return $this->status === EquipmentStatus::Retired;
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image ? asset('storage/'.$this->image) : null,
        );
    }
}
