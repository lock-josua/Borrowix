<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
    ];

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

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }
}
