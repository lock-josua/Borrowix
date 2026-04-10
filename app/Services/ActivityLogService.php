<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    public static function log(
        string $eventType,
        string $description,
        ?int $userId = null,
        ?array $metadata = null
    ): void {
        ActivityLog::create([
            'event_type' => $eventType,
            'description' => $description,
            'user_id' => $userId,
            'metadata' => $metadata,
        ]);
    }
}
