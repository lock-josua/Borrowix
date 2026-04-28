<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeds 6 fake historical tenants with full database setup and users for testing/analytics.
 *
 * NOT called by DatabaseSeeder — run manually only when you need demo analytics data:
 *   php artisan db:seed --class=AnalyticsSeeder
 *
 * WARNING: This seeder creates fake tenants in the central DB and their own tenant databases.
 * Run AFTER a fresh migrate+seed. Do not run in production.
 */
class AnalyticsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding 6 analytics tenants with full data...');

        // Clear existing data to avoid confusion
        \DB::table('subscription_payments')->delete();
        \DB::table('subscriptions')->delete();
        \DB::table('domains')->delete();
        \DB::table('tenants')->delete();

        $plans = ['monthly', 'annually'];
        $statuses = ['trialing', 'subscribed', 'trial_expired', 'suspended'];
        $amounts = ['monthly' => 999.00, 'annually' => 9990.00];

        for ($i = 0; $i < 6; $i++) {
            $status = $statuses[$i % 4];
            $plan = $plans[rand(0, 1)];

            // Trend: weighted towards recent months for better "growth" visualization
            $monthsAgo = (int) (pow(rand(0, 100) / 100, 1.5) * 11);
            $createdAt = Carbon::now()->subMonths($monthsAgo)->subDays(rand(0, 28));
            $id = 'school-'.($i + 1).'-'.Str::lower(Str::random(3));

            $tenant = Tenant::create([
                'id' => $id,
                'school_name' => 'Analytics School '.($i + 1),
                'school_email' => $id.'@example.com',
                'admin_email' => 'admin@'.$id.'.com',
                'contact_number' => '09'.rand(100000000, 999999999),
                'address' => 'Sample Address '.($i + 1),
            ]);

            // Force dates in central DB
            \DB::table('tenants')->where('id', $id)->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);

            $tenant->domains()->create(['domain' => $id]);

            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan' => $plan,
                'status' => $status,
                'current_period_start' => $createdAt,
                'current_period_end' => (clone $createdAt)->addMonth(),
                'trial_ends_at' => (clone $createdAt)->addDays(14),
            ]);

            \DB::table('subscriptions')->where('id', $subscription->id)->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);

            // If subscribed or suspended, add some payments
            if ($status === 'subscribed' || $status === 'suspended') {
                $paymentDate = clone $createdAt;
                while ($paymentDate <= Carbon::now()) {
                    $payment = SubscriptionPayment::create([
                        'tenant_id' => $tenant->id,
                        'subscription_id' => $subscription->id,
                        'plan' => $plan,
                        'amount' => $amounts[$plan],
                        'status' => 'completed',
                        'paid_at' => $paymentDate,
                    ]);

                    \DB::table('subscription_payments')->where('id', $payment->id)->update(['created_at' => $paymentDate, 'updated_at' => $paymentDate]);

                    if ($plan === 'monthly') {
                        $paymentDate->addMonth();
                    } else {
                        $paymentDate->addYear();
                    }
                }
            }

            // --- FULL TENANT SETUP ---
            $this->command->info("Setting up database for: {$id}...");

            // Create the tenant database if it doesn't exist
            if (! $tenant->database()->manager()->databaseExists($tenant->database()->getName())) {
                $tenant->database()->manager()->createDatabase($tenant);
            }

            // Run tenant migrations
            Artisan::call('tenants:migrate', ['--tenants' => $tenant->id, '--no-interaction' => true]);

            // Seed tenant roles and permissions
            Artisan::call('tenants:seed', [
                '--tenants' => $tenant->id,
                '--class' => 'Database\Seeders\TenantDatabaseSeeder',
                '--no-interaction' => true,
            ]);

            // Seed users inside the tenant's database
            $tenant->run(function () use ($id) {
                // 1. Admin
                User::create([
                    'name' => 'Admin User',
                    'email' => 'admin@'.$id.'.com',
                    'password' => Hash::make('admin123'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ])->syncRoles(['admin']);

                // 2. Staff
                User::create([
                    'name' => 'Staff User',
                    'email' => 'staff@'.$id.'.com',
                    'password' => Hash::make('staff123'),
                    'role' => 'staff',
                    'email_verified_at' => now(),
                ])->syncRoles(['staff']);

                // 3. Students (2)
                for ($j = 1; $j <= 2; $j++) {
                    User::create([
                        'name' => "Student User $j",
                        'email' => "student$j@".$id.'.com',
                        'password' => Hash::make('student123'),
                        'role' => 'student',
                        'email_verified_at' => now(),
                    ])->syncRoles(['student']);
                }
            });

            $this->command->info("Tenant {$id} seeded with status: {$status}");
        }

        $this->command->info('Analytics data with 6 full tenants seeded successfully!');
    }
}
