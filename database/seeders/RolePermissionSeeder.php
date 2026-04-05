<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission as SpatiePermission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->createPermissions();

        $adminRole = $this->createRole(UserRole::Admin);
        $staffRole = $this->createRole(UserRole::Staff);
        $studentRole = $this->createRole(UserRole::Student);

        $adminRole->syncPermissions(
            array_map(fn (Permission $p) => $p->value, Permission::cases())
        );

        $staffRole->syncPermissions([
            Permission::EquipmentViewAny->value,
            Permission::TransactionViewAny->value,
            Permission::TransactionCreate->value,
            Permission::TransactionReturn->value,
            Permission::RequestViewAny->value,
            Permission::RequestApprove->value,
            Permission::RequestReject->value,
        ]);

        $studentRole->syncPermissions([
            Permission::EquipmentViewAny->value,
            Permission::RequestCreate->value,
        ]);

        $this->command->info('Roles and permissions seeded successfully.');
    }

    protected function createPermissions(): void
    {
        foreach (Permission::cases() as $permission) {
            SpatiePermission::findOrCreate($permission->value);
        }
    }

    protected function createRole(UserRole $role): Role
    {
        return Role::findOrCreate($role->value);
    }
}
