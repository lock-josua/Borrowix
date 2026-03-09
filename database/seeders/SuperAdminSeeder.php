<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Creates the one and only Super Admin account.
     * This account has no school_id — it manages the entire platform.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('superadmin123'),
                'role' => 'super_admin',
                'school_id' => null,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin created: superadmin@borrowix.com / superadmin123');
    }
}
