<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SchoolSeeder extends Seeder
{
    /**
     * Creates a demo tenant in the central DB, registers its subdomain,
     * then seeds the admin user into the tenant's own database.
     */
    public function run(): void
    {
        // Create tenant in central DB.
        // If 'demo-school' already exists, firstOrCreate skips Tenant::create()
        // and the TenantCreated event does NOT fire (no duplicate DB creation).
        /** @var Tenant|\Stancl\Tenancy\Database\Concerns\TenantRun $tenant */
        $tenant = Tenant::firstOrCreate(
            ['id' => 'demo-school'],
            [
                'school_email' => 'admin@demoschool.com',
                'admin_email' => 'admin@demoschool.com',
                'contact_number' => '09123456789',
                // These go into the data JSON column:
                'school_name' => 'Demo School',
                'plan' => 'free',
                'status' => 'active',
                'address' => '123 Main Street, Cagayan de Oro City',
            ]
        );

        // Register the subdomain: "demo-school" → demo-school.huwam.test
        $tenant->domains()->firstOrCreate(['domain' => 'demo-school']);

        Subscription::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan' => 'free',
                'status' => 'active',
                'billing_cycle' => 'monthly',
                'current_period_start' => now(),
                'current_period_end' => now()->addMonth(),
            ]
        );

        // Create the tenant database if it doesn't exist
        if (! $tenant->database()->manager()->databaseExists($tenant->database()->getName())) {
            $tenant->database()->manager()->createDatabase($tenant);
            $this->command->info('Created tenant database: '.$tenant->database()->getName());
        }

        // Run tenant migrations
        $this->command->info('Running tenant migrations...');
        \Illuminate\Support\Facades\Artisan::call('tenants:migrate', ['--tenants' => $tenant->id]);

        // Seed tenant roles and permissions before creating admin user
        \Illuminate\Support\Facades\Artisan::call('tenants:seed', [
            '--tenants' => $tenant->id,
            '--class' => 'Database\Seeders\TenantDatabaseSeeder',
        ]);

        // Note: Demo data (categories, equipment, staff, students) is seeded by
        // SubscriptionSeeder which runs TenantDataSeeder for all tenants.

        // Seed admin user inside the tenant's database using $tenant->run()
        $tenant->run(function () {
            $user = User::updateOrCreate(
                ['email' => 'admin@demoschool.com'],
                [
                    'name' => 'School Admin',
                    'password' => Hash::make('admin123'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]
            );

            $user->syncRoles(['admin']);
        });

        $this->command->info('Demo School created.');
        $this->command->info('Access at: http://demo-school.localhost');
        $this->command->info('Login: admin@demoschool.com / admin123');
    }
}
