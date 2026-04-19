<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QrCodeService
{
    public function generateTokenForEquipment(Model $equipment): string
    {
        $token = (string) Str::uuid();

        $equipment->update(['qr_code' => $token]);

        return $token;
    }

    public function regenerateTokenForEquipment(Model $equipment): string
    {
        return $this->generateTokenForEquipment($equipment);
    }
}
