<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

class SubscriptionSeeder extends Seeder
{
    /**
     * Seed tenants + subscriptions so the Super Admin analytics charts
     * show meaningful data (growth, plan/status/billing breakdown, revenue).
     *
     * Each tenant gets:
     *   - a database created and migrated
     *   - an admin user seeded into that tenant's DB
     */
    public function run(): void
    {
        $schools = $this->schoolData();

        foreach ($schools as $data) {
            $tenant = Tenant::firstOrCreate(
                ['id' => $data['id']],
                [
                    'school_email' => $data['email'],
                    'admin_email' => $data['email'],
                    'contact_number' => $data['phone'],
                    'school_name' => $data['name'],
                    'plan' => $data['plan'],
                    'status' => 'active',
                ]
            );

            // Back-date created_at for the growth chart
            $tenant->update(['created_at' => $data['created_at']]);

            $tenant->domains()->firstOrCreate(['domain' => $data['id']]);

            // Create tenant database if it doesn't exist
            if (! $tenant->database()->manager()->databaseExists($tenant->database()->getName())) {
                $tenant->database()->manager()->createDatabase($tenant);
            }

            // Run tenant migrations
            Artisan::call('tenants:migrate', ['--tenants' => $tenant->id, '--force' => true]);

            // Seed admin user into tenant DB
            $tenant->run(function () use ($data) {
                User::updateOrCreate(
                    ['email' => $data['email']],
                    [
                        'name' => $data['name'].' Admin',
                        'password' => Hash::make('admin123'),
                        'role' => 'admin',
                        'email_verified_at' => now(),
                    ]
                );
            });

            Subscription::updateOrCreate(
                ['tenant_id' => $tenant->id],
                [
                    'plan' => $data['plan'],
                    'status' => $data['status'],
                    'billing_cycle' => $data['billing_cycle'],
                    'discount_amount' => $data['discount'],
                    'current_period_start' => $data['created_at'],
                    'current_period_end' => $data['billing_cycle'] === 'annual'
                        ? $data['created_at']->addYear()
                        : $data['created_at']->addMonth(),
                ]
            );
        }

        $this->command->info('Seeded '.count($schools).' schools with subscriptions and admin users.');
    }

    /**
     * @return array<int, array{
     *   id: string, name: string, email: string, phone: string,
     *   plan: string, status: string, billing_cycle: string,
     *   discount: int, created_at: Carbon
     * }>
     */
    private function schoolData(): array
    {
        return [
            // --- January ---
            [
                'id' => 'xavier-university', 'name' => 'Xavier University',
                'email' => 'admin@xavier.edu.ph', 'phone' => '09171234501',
                'plan' => 'pro', 'status' => 'active', 'billing_cycle' => 'annual',
                'discount' => 0, 'created_at' => Carbon::create(2026, 1, 5),
            ],
            [
                'id' => 'lourdes-college', 'name' => 'Lourdes College',
                'email' => 'admin@lourdes.edu.ph', 'phone' => '09171234502',
                'plan' => 'basic', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 1, 12),
            ],
            [
                'id' => 'coc-phoenix', 'name' => 'Cagayan Colleges - Phoenix',
                'email' => 'admin@coc-phoenix.edu.ph', 'phone' => '09171234503',
                'plan' => 'free', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 1, 20),
            ],

            // --- February ---
            [
                'id' => 'mindanao-state', 'name' => 'Mindanao State University',
                'email' => 'admin@msu.edu.ph', 'phone' => '09171234504',
                'plan' => 'pro', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 100, 'created_at' => Carbon::create(2026, 2, 3),
            ],
            [
                'id' => 'ustp-cdo', 'name' => 'USTP Cagayan de Oro',
                'email' => 'admin@ustp.edu.ph', 'phone' => '09171234505',
                'plan' => 'basic', 'status' => 'active', 'billing_cycle' => 'annual',
                'discount' => 0, 'created_at' => Carbon::create(2026, 2, 10),
            ],
            [
                'id' => 'golden-valley', 'name' => 'Golden Valley College',
                'email' => 'admin@goldenvalley.edu.ph', 'phone' => '09171234506',
                'plan' => 'free', 'status' => 'trialing', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 2, 18),
            ],

            // --- March ---
            [
                'id' => 'philippine-chinese', 'name' => 'Philippine Chinese School',
                'email' => 'admin@pcs.edu.ph', 'phone' => '09171234507',
                'plan' => 'basic', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 50, 'created_at' => Carbon::create(2026, 3, 1),
            ],
            [
                'id' => 'capitol-university', 'name' => 'Capitol University',
                'email' => 'admin@capitol.edu.ph', 'phone' => '09171234508',
                'plan' => 'pro', 'status' => 'active', 'billing_cycle' => 'annual',
                'discount' => 0, 'created_at' => Carbon::create(2026, 3, 8),
            ],
            [
                'id' => 'pilgrim-college', 'name' => 'Pilgrim Christian College',
                'email' => 'admin@pilgrim.edu.ph', 'phone' => '09171234509',
                'plan' => 'free', 'status' => 'canceled', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 3, 14),
            ],
            [
                'id' => 'divine-word', 'name' => 'Divine Word College',
                'email' => 'admin@divineword.edu.ph', 'phone' => '09171234510',
                'plan' => 'basic', 'status' => 'past_due', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 3, 22),
            ],

            // --- April ---
            [
                'id' => 'agusan-del-norte', 'name' => 'Agusan del Norte Academy',
                'email' => 'admin@adna.edu.ph', 'phone' => '09171234511',
                'plan' => 'pro', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 200, 'created_at' => Carbon::create(2026, 4, 2),
            ],
            [
                'id' => 'st-rita', 'name' => "St. Rita's College",
                'email' => 'admin@strita.edu.ph', 'phone' => '09171234512',
                'plan' => 'basic', 'status' => 'active', 'billing_cycle' => 'annual',
                'discount' => 0, 'created_at' => Carbon::create(2026, 4, 9),
            ],
            [
                'id' => 'bulua-national', 'name' => 'Bulua National High School',
                'email' => 'admin@bulua.edu.ph', 'phone' => '09171234513',
                'plan' => 'free', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 4, 15),
            ],
            [
                'id' => 'macasandig', 'name' => 'Macasandig Elementary',
                'email' => 'admin@macasandig.edu.ph', 'phone' => '09171234514',
                'plan' => 'free', 'status' => 'paused', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 4, 21),
            ],

            // --- May ---
            [
                'id' => 'lapasan-national', 'name' => 'Lapasan National High School',
                'email' => 'admin@lapasan.edu.ph', 'phone' => '09171234515',
                'plan' => 'basic', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 5, 4),
            ],
            [
                'id' => 'carmen-national', 'name' => 'Carmen National High School',
                'email' => 'admin@carmen.edu.ph', 'phone' => '09171234516',
                'plan' => 'pro', 'status' => 'trialing', 'billing_cycle' => 'annual',
                'discount' => 0, 'created_at' => Carbon::create(2026, 5, 11),
            ],
            [
                'id' => 'indahag-elementary', 'name' => 'Indahag Elementary School',
                'email' => 'admin@indahag.edu.ph', 'phone' => '09171234517',
                'plan' => 'free', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 5, 19),
            ],

            // --- June ---
            [
                'id' => 'puerto-national', 'name' => 'Puerto National High School',
                'email' => 'admin@puerto.edu.ph', 'phone' => '09171234518',
                'plan' => 'basic', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 75, 'created_at' => Carbon::create(2026, 6, 1),
            ],
            [
                'id' => 'consolacion-college', 'name' => 'Consolacion College',
                'email' => 'admin@consolacion.edu.ph', 'phone' => '09171234519',
                'plan' => 'pro', 'status' => 'active', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 6, 10),
            ],
            [
                'id' => 'kibungsod-school', 'name' => 'Kibungsod Integrated School',
                'email' => 'admin@kibungsod.edu.ph', 'phone' => '09171234520',
                'plan' => 'free', 'status' => 'canceled', 'billing_cycle' => 'monthly',
                'discount' => 0, 'created_at' => Carbon::create(2026, 6, 18),
            ],
        ];
    }
}
