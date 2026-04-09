<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantUserSeeder extends Seeder
{
    /**
     * Seeds 2 students and 1 staff into every tenant database.
     *
     * Run SchoolSeeder (or SubscriptionSeeder) first so tenants exist.
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error('No tenants found. Run SchoolSeeder or SubscriptionSeeder first.');

            return;
        }

        $this->command->info('Seeding users for '.$tenants->count().' tenant(s)...');

        foreach ($tenants as $tenant) {
            $this->seedUsers($tenant);
        }

        $this->command->info('Tenant user seeder complete.');
    }

    protected function seedUsers(Tenant $tenant): void
    {
        $tenantId = $tenant->id;
        $domain = $tenant->domains()->first()?->domain ?? $tenantId;

        $this->command->info("Seeding users for tenant: {$tenantId}");

        $tenant->run(function () use ($domain) {
            // 1 staff
            User::updateOrCreate(
                ['email' => 'staff@'.$domain.'.com'],
                [
                    'name' => 'Staff User',
                    'password' => Hash::make('staff123'),
                    'role' => 'staff',
                    'email_verified_at' => now(),
                ]
            );

            // 2 students
            $students = [
                ['name' => 'Student One', 'email' => 'student1@'.$domain.'.com'],
                ['name' => 'Student Two', 'email' => 'student2@'.$domain.'.com'],
            ];

            foreach ($students as $student) {
                User::updateOrCreate(
                    ['email' => $student['email']],
                    [
                        'name' => $student['name'],
                        'password' => Hash::make('student123'),
                        'role' => 'student',
                        'email_verified_at' => now(),
                    ]
                );
            }
        });

        $this->command->info("Done: {$tenantId} (staff@{$domain}.com, student1@{$domain}.com, student2@{$domain}.com)");
    }
}
