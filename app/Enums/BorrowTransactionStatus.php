<?php

namespace App\Enums;

enum BorrowTransactionStatus: string
{
    case Active = 'active';
    case Returned = 'returned';
    case Overdue = 'overdue';
}
