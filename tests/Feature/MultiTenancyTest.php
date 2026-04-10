<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission as SpatiePermission;
use Spatie\Permission\Models\Role as SpatieRole;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Database\Seeders\RolePermissionSeeder::class);
});

describe('Tenant Model Tests', function () {
    test('tenant can be created', function () {
        $tenant = Tenant::create([
            'id' => 'test-school-'.uniqid(),
            'school_email' => 'admin@testschool.com',
            'admin_email' => 'admin@testschool.com',
            'contact_number' => '09123456789',
            'school_name' => 'Test School',
            'plan' => 'free',
            'status' => 'active',
        ]);

        expect($tenant->id)->toBeTruthy();
        expect($tenant->school_name)->toBe('Test School');
    });

    test('tenant has domains relationship', function () {
        $tenant = Tenant::create([
            'id' => 'test-domain-'.uniqid(),
            'school_email' => 'admin@test.com',
            'admin_email' => 'admin@test.com',
            'school_name' => 'Test Domain School',
            'plan' => 'free',
            'status' => 'active',
        ]);

        $domain = $tenant->domains()->create(['domain' => $tenant->id]);

        expect($domain->tenant_id)->toBe($tenant->id);
        expect($domain->domain)->toBe($tenant->id);
    });
});

describe('Central vs Tenant Database Isolation', function () {
    test('central users table exists in central database', function () {
        expect(Schema::hasTable('users'))->toBeTrue();
    });

    test('tenant tables do not exist in central database', function () {
        expect(Schema::hasTable('categories'))->toBeFalse();
        expect(Schema::hasTable('equipment'))->toBeFalse();
        expect(Schema::hasTable('borrow_requests'))->toBeFalse();
        expect(Schema::hasTable('borrow_transactions'))->toBeFalse();
    });

    test('tenant model uses central connection', function () {
        $tenant = Tenant::create([
            'id' => 'test-connection-'.uniqid(),
            'school_email' => 'admin@testconn.com',
            'admin_email' => 'admin@testconn.com',
            'school_name' => 'Test Connection School',
            'plan' => 'free',
            'status' => 'active',
        ]);

        // In tests, the connection is SQLite (from phpunit.xml)
        expect($tenant->getConnectionName())->toBe('sqlite');
    });
});

describe('User Role in Tenant Context', function () {
    test('user can be created with role', function () {
        $user = User::factory()->create([
            'role' => 'student',
        ]);

        expect($user->role->value)->toBe('student');
    });

    test('user can be assigned to role', function () {
        $user = User::factory()->create(['role' => 'staff']);
        $user->syncRoles(['staff']);

        expect($user->hasRole('staff'))->toBeTrue();
    });

    test('user has multiple roles possible', function () {
        $user = User::factory()->create(['role' => 'staff']);
        $user->syncRoles(['staff']);

        $adminUser = User::factory()->create(['role' => 'admin']);
        $adminUser->syncRoles(['admin']);

        $studentUser = User::factory()->create(['role' => 'student']);
        $studentUser->syncRoles(['student']);

        expect($user->hasRole('staff'))->toBeTrue();
        expect($adminUser->hasRole('admin'))->toBeTrue();
        expect($studentUser->hasRole('student'))->toBeTrue();
    });
});

describe('Tenant Configuration Tests', function () {
    test('tenant database prefix is configured', function () {
        $prefix = config('tenancy.database.prefix');
        expect($prefix)->toBe('tenant_');
    });

    test('tenant model is correctly configured', function () {
        $tenantModel = config('tenancy.tenant_model');
        expect($tenantModel)->toBe(App\Models\Tenant::class);
    });

    test('central domains are configured', function () {
        $centralDomains = config('tenancy.central_domains');
        expect($centralDomains)->toContain('localhost');
    });
});

describe('Role Permission Seeding in Tenant Context', function () {
    test('roles can be created in tenant database', function () {
        $adminRole = SpatieRole::findOrCreate('admin');
        $staffRole = SpatieRole::findOrCreate('staff');
        $studentRole = SpatieRole::findOrCreate('student');

        expect($adminRole->name)->toBe('admin');
        expect($staffRole->name)->toBe('staff');
        expect($studentRole->name)->toBe('student');
    });

    test('permissions can be created in tenant database', function () {
        $permission = SpatiePermission::findOrCreate('request.viewAny');

        expect($permission->name)->toBe('request.viewAny');
    });

    test('admin role has all permissions', function () {
        $adminRole = SpatieRole::findOrCreate('admin');

        $permissions = [
            'equipment.viewAny',
            'request.viewAny',
            'request.create',
            'request.approve',
            'transaction.viewAny',
            'transaction.create',
            'transaction.return',
        ];

        $adminRole->syncPermissions($permissions);

        expect($adminRole->hasPermissionTo('request.approve'))->toBeTrue();
        expect($adminRole->hasPermissionTo('transaction.return'))->toBeTrue();
    });
});
