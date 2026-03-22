<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,    // seeds central DB: super_admin user
            SchoolSeeder::class,        // creates tenant + domain + seeds tenant admin
            EquipmentSeeder::class,     // seeds equipment + staff + students into tenant DB
            SubscriptionSeeder::class,  // seeds 20 schools with varied subscriptions for analytics
        ]);
    }
}
