<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seeds the super_admin into the CENTRAL users table.
     * No tenant context needed — this runs on the central DB.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('superadmin123'),
                'role'              => 'super_admin',
                // school_id REMOVED — super_admin has no school
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin created: superadmin@gmail.com / superadmin123');
        $this->command->info('Login at: http://huwam.test');
    }
}
