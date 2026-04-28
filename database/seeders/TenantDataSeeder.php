<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds demo staff users, student users, equipment categories, and equipment
 * into ALL tenant databases that currently exist in the central DB.
 *
 * NOT called by DatabaseSeeder — run manually after SchoolSeeder:
 *   php artisan db:seed --class=TenantDataSeeder
 *
 * Requires at least one tenant to exist. Run SchoolSeeder first if none do.
 */
class TenantDataSeeder extends Seeder
{
    /**
     * Seeds 1 staff, 2 students, categories, and equipment
     * into ALL tenant databases.
     *
     * Run SchoolSeeder first to create tenants: php artisan db:seed --class=SchoolSeeder
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error('No tenants found. Run SchoolSeeder first: php artisan db:seed --class=SchoolSeeder');

            return;
        }

        $this->command->info('Found '.$tenants->count().' tenant(s). Seeding data...');

        foreach ($tenants as $tenant) {
            $this->seedTenant($tenant);
        }

        $this->command->info('Tenant data seeder complete for all tenants.');
    }

    /**
     * Seed data for a single tenant.
     */
    protected function seedTenant(Tenant $tenant): void
    {
        $tenantId = $tenant->id;
        $domain = $tenant->domains()->first()?->domain ?? $tenantId;

        $this->command->info("Seeding data for tenant: {$tenantId}");

        $tenant->run(function () use ($domain) {
            // Seed staff user
            $staffEmail = 'staff@'.$domain.'.com';
            $staff = User::updateOrCreate(
                ['email' => $staffEmail],
                [
                    'name' => 'John Smith',
                    'password' => Hash::make('staff123'),
                    'role' => 'staff',
                    'email_verified_at' => now(),
                ]
            );
            $staff->syncRoles(['staff']);

            // Seed 2 student users
            $students = [
                ['name' => 'Jane Doe',    'email' => 'jane@'.$domain.'.com'],
                ['name' => 'Mike Johnson', 'email' => 'mike@'.$domain.'.com'],
            ];

            foreach ($students as $student) {
                $user = User::updateOrCreate(
                    ['email' => $student['email']],
                    [
                        'name' => $student['name'],
                        'password' => Hash::make('student123'),
                        'role' => 'student',
                        'email_verified_at' => now(),
                    ]
                );
                $user->syncRoles(['student']);
            }

            // Seed categories
            $categories = [];
            foreach (['Laptops', 'Tablets', 'Projectors', 'Cameras', 'Audio Equipment'] as $name) {
                $categories[$name] = Category::updateOrCreate(['name' => $name]);
            }

            // Seed equipment
            $items = [
                [
                    'name' => 'Dell Latitude 5520',
                    'cat' => 'Laptops',
                    'brand' => 'Dell',
                    'model' => 'Latitude 5520',
                    'sn' => 'DL-5520-001',
                    'qty' => 5,
                    'desc' => '15.6" laptop, Intel i5, 8GB RAM, 256GB SSD',
                ],
                [
                    'name' => 'Lenovo ThinkPad E14',
                    'cat' => 'Laptops',
                    'brand' => 'Lenovo',
                    'model' => 'ThinkPad E14',
                    'sn' => 'LN-E14-001',
                    'qty' => 3,
                    'desc' => '14" laptop, Intel i5, 8GB RAM, 512GB SSD',
                ],
                [
                    'name' => 'iPad 10th Generation',
                    'cat' => 'Tablets',
                    'brand' => 'Apple',
                    'model' => 'iPad 10th Gen',
                    'sn' => 'AP-IPAD-001',
                    'qty' => 10,
                    'desc' => '10.9" iPad with Wi-Fi, 64GB',
                ],
                [
                    'name' => 'Epson EB-X51 Projector',
                    'cat' => 'Projectors',
                    'brand' => 'Epson',
                    'model' => 'EB-X51',
                    'sn' => 'EP-X51-001',
                    'qty' => 4,
                    'desc' => '3800 lumens XGA projector',
                ],
                [
                    'name' => 'Canon EOS M50 Camera',
                    'cat' => 'Cameras',
                    'brand' => 'Canon',
                    'model' => 'EOS M50',
                    'sn' => 'CN-M50-001',
                    'qty' => 2,
                    'desc' => 'Mirrorless camera with 18-150mm lens kit',
                ],
                [
                    'name' => 'Sony WH-1000XM5 Headphones',
                    'cat' => 'Audio Equipment',
                    'brand' => 'Sony',
                    'model' => 'WH-1000XM5',
                    'sn' => 'SN-XM5-001',
                    'qty' => 6,
                    'desc' => 'Noise-cancelling wireless headphones',
                ],
            ];

            foreach ($items as $item) {
                Equipment::updateOrCreate(
                    ['serial_number' => $item['sn']],
                    [
                        'category_id' => $categories[$item['cat']]->id,
                        'name' => $item['name'],
                        'brand' => $item['brand'],
                        'model' => $item['model'],
                        'quantity' => $item['qty'],
                        'available_quantity' => $item['qty'],
                        'status' => 'available',
                        'description' => $item['desc'],
                    ]
                );
            }
        });

        $this->command->info("Completed seeding for tenant: {$tenantId}");
    }
}
