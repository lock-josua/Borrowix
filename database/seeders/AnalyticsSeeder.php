<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AnalyticsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding analytics data...');

        // Clear existing data to avoid confusion
        \DB::table('subscription_payments')->delete();
        \DB::table('subscriptions')->delete();
        \DB::table('domains')->delete();
        \DB::table('tenants')->delete();

        $plans = ['monthly', 'annually'];
        $statuses = ['trialing', 'subscribed', 'trial_expired', 'suspended'];
        $amounts = ['monthly' => 499.00, 'annually' => 4999.00];

        // Create 60 tenants spread over the last 12 months with an upward trend
        for ($i = 0; $i < 60; $i++) {
            // Trend: weighted towards recent months for better "growth" visualization
            $monthsAgo = (int) (pow(rand(0, 100) / 100, 1.5) * 11);
            $createdAt = Carbon::now()->subMonths($monthsAgo)->subDays(rand(0, 28));
            $id = 'school-'.Str::random(5);

            $tenant = Tenant::create([
                'id' => $id,
                'school_name' => 'School '.strtoupper(Str::random(3)),
                'school_email' => $id.'@example.com',
                'admin_email' => 'admin@'.$id.'.example.com',
                'contact_number' => '09'.rand(100000000, 999999999),
                'address' => 'Sample Address '.$i,
                'status' => 'active',
            ]);

            // Force dates
            \DB::table('tenants')->where('id', $id)->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);

            $tenant->domains()->create(['domain' => $id]);

            $status = $statuses[array_rand($statuses)];
            $plan = $plans[array_rand($plans)];

            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan' => $plan,
                'status' => $status,
                'current_period_start' => $createdAt,
                'current_period_end' => (clone $createdAt)->addMonth(),
                'trial_ends_at' => (clone $createdAt)->addDays(14),
            ]);

            \DB::table('subscriptions')->where('id', $subscription->id)->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);

            // If subscribed, add some payments
            if ($status === 'subscribed' || $status === 'suspended') {
                // Add payments from the creation month until now
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
        }

        $this->command->info('Analytics data seeded successfully!');
    }
}
