<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
<<<<<<< HEAD
        // User::factory(10)->create();
        $this->call(UserSeeder::class);

      
=======
        $this->call([
            SuperAdminSeeder::class,    // seeds central DB: super_admin user
            SchoolSeeder::class,        // creates tenant + domain + seeds tenant admin
            EquipmentSeeder::class,     // seeds equipment + staff + students into tenant DB
            SubscriptionSeeder::class,  // seeds 20 schools with varied subscriptions for analytics
        ]);
>>>>>>> 65b9d549be5954929b98db672d6bddd487df64ee
    }
}
