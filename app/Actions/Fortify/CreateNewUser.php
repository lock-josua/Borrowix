<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\SystemLogService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            'school_name' => ['required', 'string', 'max:255'],
            'admin_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        // Convert "Demo School" → "demo-school" (used as tenant ID and subdomain)
        $slug = Str::slug($input['school_name']);

        // SECURITY: Guard against duplicate school names that would create duplicate tenant IDs
        if (Tenant::where('id', $slug)->exists()) {
            throw ValidationException::withMessages([
                'school_name' => 'A school with this name already exists. Please try a slightly different name.',
            ]);
        }

        // Step 1: Create the Tenant record in the CENTRAL database.
        // This automatically fires:
        //   TenantCreated → CreateDatabase (creates tenant_demo-school in MySQL)
        //                 → MigrateDatabase (runs all files in database/migrations/tenant/)
        // All this happens synchronously before the next line executes.
        $tenant = Tenant::create([
            'id' => $slug,
            'school_email' => $input['email'],
            'admin_email' => $input['email'],
            'contact_number' => $input['contact_number'] ?? null,
            // These attributes have no dedicated column, so they are automatically
            // stored in the `data` JSON column by the package:
            'school_name' => $input['school_name'],
        ]);

        // Step 2: Register the subdomain for this tenant.
        // Stores "demo-school" in the domains table.
        // InitializeTenancyBySubdomain will match requests to
        // demo-school.huwam.test → this tenant.
        // IMPORTANT: Store only the subdomain slug, NOT the full hostname.
        $tenant->domains()->create([
            'domain' => $slug,
        ]);

        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan' => 'monthly',
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays(config('subscription.trial_days', 14)),
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        $schoolName = $tenant->school_name ?? $slug;
        SystemLogService::log(
            'school_registered',
            "New school registered: {$schoolName}",
            $tenant->id,
            'system'
        );

        // Step 3: Run code inside the tenant's new database.
        // $tenant->run() switches to tenant_demo-school, runs the callback,
        // then automatically returns to the central DB.
        // Create the admin user inside the tenant's new database.
        $tenant->run(function () use ($input) {
            $user = User::create([
                'name' => $input['admin_name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);

            $user->syncRoles(['admin']);
        });

        // SECURITY: Return an empty unsaved User so Fortify's type contract is
        // satisfied. A User() with no id cannot produce a real Auth session.
        // The RegisterResponse binding in FortifyServiceProvider intercepts
        // the response before any session is written.
        return new User;
    }
}
