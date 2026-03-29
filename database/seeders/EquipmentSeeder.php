<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EquipmentSeeder extends Seeder
{
    /**
     * Seeds staff, students, categories, and equipment
     * into the demo-school tenant database.
     */
    public function run(): void
    {
        /** @var Tenant|\Stancl\Tenancy\Database\Concerns\TenantRun $tenant */
        $tenant = Tenant::find('demo-school');

        if (! $tenant) {
            $this->command->error('Run SchoolSeeder first: php artisan db:seed --class=SchoolSeeder');

            return;
        }

        $tenant->run(function () {

            // Seed staff user
            User::updateOrCreate(
                ['email' => 'staff@demoschool.com'],
                [
                    'name' => 'Demo Staff',
                    'password' => Hash::make('staff123'),
                    'role' => 'staff',
                    'email_verified_at' => now(),
                ]
            );

            // Seed student users
            foreach ([
                ['name' => 'Juan dela Cruz',  'email' => 'juan@demoschool.com'],
                ['name' => 'Maria Santos',    'email' => 'maria@demoschool.com'],
                ['name' => 'Pedro Reyes',     'email' => 'pedro@demoschool.com'],
            ] as $student) {
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

            // Seed categories — no school_id needed (each DB is one school)
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

        $this->command->info('Equipment seeder complete for demo-school.');
        $this->command->info('Staff:   staff@demoschool.com / staff123');
        $this->command->info('Student: juan@demoschool.com / student123');
    }
}
