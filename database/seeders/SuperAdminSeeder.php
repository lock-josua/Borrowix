<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seeds the super_admin into the CENTRAL users table.
     * No tenant context needed — this runs on the central DB.
     */
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

        $user = User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('superadmin123'),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('super_admin');

        $this->command->info('Super Admin created: superadmin@gmail.com / superadmin123');
        $this->command->info('Login at: http://huwam.test');
    }
}
