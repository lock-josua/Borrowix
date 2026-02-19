<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SchoolSeeder extends Seeder
{
    /**
     * Creates a demo school with a School Admin account for development.
     */
    public function run(): void
    {
        $school = School::updateOrCreate(
            ['slug' => 'demo-school'],
            [
                'name'           => 'Demo School',
                'email'          => 'admin@demoschool.com',
                'address'        => '123 Main Street, Cagayan de Oro City',
                'contact_number' => '09123456789',
                'plan'           => 'free',
                'status'         => 'active',
            ]
        );

        // School Admin
        User::updateOrCreate(
            ['email' => 'admin@demoschool.com'],
            [
                'name'              => 'School Admin',
                'password'          => Hash::make('admin123'),
                'role'              => 'admin',
                'school_id'         => $school->id,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("School created: {$school->name}");
        $this->command->info('School Admin: admin@demoschool.com / admin123');
    }
}