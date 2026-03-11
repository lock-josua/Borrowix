<?php

namespace App\Enums;

enum EquipmentStatus: string
{
    case Available = 'available';
    case Borrowed = 'borrowed';
    case UnderRepair = 'under_repair';
    case Reserved = 'reserved';
    case Retired = 'retired';
}
