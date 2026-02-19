<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EquipmentSeeder extends Seeder
{
    /**
     * Creates sample staff, students, categories, and equipment
     * for the demo school so you can test the borrowing workflow immediately.
     */
    public function run(): void
    {
        $school = School::where('slug', 'demo-school')->firstOrFail();

        // -------------------------------------------------------
        // Staff
        // -------------------------------------------------------
        User::updateOrCreate(
            ['email' => 'staff@demoschool.com'],
            [
                'name'              => 'Demo Staff',
                'password'          => Hash::make('staff123'),
                'role'              => 'staff',
                'school_id'         => $school->id,
                'email_verified_at' => now(),
            ]
        );

        // -------------------------------------------------------
        // Students
        // -------------------------------------------------------
        $students = [
            ['name' => 'Juan dela Cruz',  'email' => 'juan@demoschool.com'],
            ['name' => 'Maria Santos',    'email' => 'maria@demoschool.com'],
            ['name' => 'Pedro Reyes',     'email' => 'pedro@demoschool.com'],
        ];

        foreach ($students as $student) {
            User::updateOrCreate(
                ['email' => $student['email']],
                [
                    'name'              => $student['name'],
                    'password'          => Hash::make('student123'),
                    'role'              => 'student',
                    'school_id'         => $school->id,
                    'email_verified_at' => now(),
                ]
            );
        }

        // -------------------------------------------------------
        // Categories
        // -------------------------------------------------------
        $categoryNames = ['Laptops', 'Tablets', 'Projectors', 'Cameras', 'Audio Equipment'];
        $categories = [];

        foreach ($categoryNames as $name) {
            $categories[$name] = Category::updateOrCreate(
                ['school_id' => $school->id, 'name' => $name]
            );
        }

        // -------------------------------------------------------
        // Equipment
        // -------------------------------------------------------
        $items = [
            [
                'name'               => 'Dell Latitude 5520',
                'category'           => 'Laptops',
                'brand'              => 'Dell',
                'model'              => 'Latitude 5520',
                'serial_number'      => 'DL-5520-001',
                'quantity'           => 5,
                'available_quantity' => 5,
                'status'             => 'available',
                'description'        => '15.6" laptop, Intel i5, 8GB RAM, 256GB SSD',
            ],
            [
                'name'               => 'Lenovo ThinkPad E14',
                'category'           => 'Laptops',
                'brand'              => 'Lenovo',
                'model'              => 'ThinkPad E14',
                'serial_number'      => 'LN-E14-001',
                'quantity'           => 3,
                'available_quantity' => 3,
                'status'             => 'available',
                'description'        => '14" laptop, Intel i5, 8GB RAM, 512GB SSD',
            ],
            [
                'name'               => 'iPad 10th Generation',
                'category'           => 'Tablets',
                'brand'              => 'Apple',
                'model'              => 'iPad 10th Gen',
                'serial_number'      => 'AP-IPAD-001',
                'quantity'           => 10,
                'available_quantity' => 10,
                'status'             => 'available',
                'description'        => '10.9" iPad with Wi-Fi, 64GB',
            ],
            [
                'name'               => 'Epson EB-X51 Projector',
                'category'           => 'Projectors',
                'brand'              => 'Epson',
                'model'              => 'EB-X51',
                'serial_number'      => 'EP-X51-001',
                'quantity'           => 4,
                'available_quantity' => 4,
                'status'             => 'available',
                'description'        => '3800 lumens XGA projector',
            ],
            [
                'name'               => 'Canon EOS M50 Camera',
                'category'           => 'Cameras',
                'brand'              => 'Canon',
                'model'              => 'EOS M50',
                'serial_number'      => 'CN-M50-001',
                'quantity'           => 2,
                'available_quantity' => 1,
                'status'             => 'available',
                'description'        => 'Mirrorless camera with 18-150mm lens kit',
            ],
            [
                'name'               => 'Sony WH-1000XM5 Headphones',
                'category'           => 'Audio Equipment',
                'brand'              => 'Sony',
                'model'              => 'WH-1000XM5',
                'serial_number'      => 'SN-XM5-001',
                'quantity'           => 6,
                'available_quantity' => 6,
                'status'             => 'available',
                'description'        => 'Noise-cancelling wireless headphones',
            ],
        ];

        foreach ($items as $item) {
            Equipment::updateOrCreate(
                [
                    'school_id'     => $school->id,
                    'serial_number' => $item['serial_number'],
                ],
                [
                    'category_id'        => $categories[$item['category']]->id,
                    'name'               => $item['name'],
                    'brand'              => $item['brand'],
                    'model'              => $item['model'],
                    'quantity'           => $item['quantity'],
                    'available_quantity' => $item['available_quantity'],
                    'status'             => $item['status'],
                    'description'        => $item['description'],
                ]
            );
        }

        $this->command->info('Staff created:   staff@demoschool.com / staff123');
        $this->command->info('Students created: juan@demoschool.com, maria@demoschool.com, pedro@demoschool.com / student123');
        $this->command->info(count($categoryNames) . ' categories and ' . count($items) . ' equipment items created.');
    }
}