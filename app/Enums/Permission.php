<?php

namespace App\Enums;

enum Permission: string
{
    case EquipmentViewAny = 'equipment.viewAny';
    case EquipmentCreate = 'equipment.create';
    case EquipmentUpdate = 'equipment.update';
    case EquipmentDelete = 'equipment.delete';

    case RequestViewAny = 'request.viewAny';
    case RequestCreate = 'request.create';
    case RequestApprove = 'request.approve';
    case RequestReject = 'request.reject';

    case TransactionViewAny = 'transaction.viewAny';
    case TransactionCreate = 'transaction.create';
    case TransactionReturn = 'transaction.return';

    case UserViewAny = 'user.viewAny';
    case UserCreate = 'user.create';
    case UserUpdate = 'user.update';
    case UserDelete = 'user.delete';

    case CategoryManage = 'category.manage';
    case ReportView = 'report.view';
    case ReportExport = 'report.export';
    case SettingsManage = 'settings.manage';
    case SubscriptionManage = 'subscription.manage';
    case RbacManage = 'rbac.manage';
}
