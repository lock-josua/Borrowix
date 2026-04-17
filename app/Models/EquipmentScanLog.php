<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentScanLog extends Model
{
    protected $table = 'equipment_scan_logs';

    protected $fillable = [
        'user_id',
        'equipment_id',
        'qr_token_scanned',
        'result',
        'failure_reason',
        'ip_address',
        'scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
