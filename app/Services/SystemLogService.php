<?php

namespace App\Services;

use App\Models\SystemLog;

class SystemLogService
{
    /**
     * Write a platform activity log entry.
     */
    public static function log(
        string $eventType,
        string $description,
        ?string $tenantId = null,
        string $actor = 'system',
        ?array $metadata = null
    ): void {
        SystemLog::create([
            'event_type' => $eventType,
            'description' => $description,
            'tenant_id' => $tenantId,
            'actor' => $actor,
            'metadata' => $metadata,
        ]);
    }
}
