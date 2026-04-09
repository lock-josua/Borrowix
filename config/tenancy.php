<?php

use Stancl\Tenancy\Database\Models\Domain;

return [

    /*
    |--------------------------------------------------------------------------
    | Tenant Model
    |--------------------------------------------------------------------------
    | The custom Tenant model we created in Step 2.
    */
    'tenant_model' => \App\Models\Tenant::class,

    /*
    |--------------------------------------------------------------------------
    | Domain Model
    |--------------------------------------------------------------------------
    */
    'domain_model' => Domain::class,

    /*
    |--------------------------------------------------------------------------
    | Central Domains
    |--------------------------------------------------------------------------
    | Domains that serve the central application (landing page, super-admin).
    | Tenant subdomains are derived from these (e.g. demo-school.huwam.test).
    | Used by PreventAccessFromCentralDomains and InitializeTenancyBySubdomain.
    */
    'central_domains' => [
        // 'huwam.test',   // local dev (Laravel Valet)
        // 'huwam.com',    // production
        'localhost', // uncomment if using *.localhost local dev
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenancy Bootstrappers
    |--------------------------------------------------------------------------
    | These run automatically on every tenant request after identification.
    | DatabaseTenancyBootstrapper switches the default DB connection to the
    | tenant's dedicated database — this is the core of multi-DB tenancy.
    */
    'bootstrappers' => [
        Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\QueueTenancyBootstrapper::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    | Tenant databases are automatically named: tenant_{id}
    | e.g. tenant_demo-school, tenant_xavier-university
    */
    'database' => [
        'central_connection' => env('DB_CONNECTION', 'mysql'),
        'template_tenant_connection' => null,
        'prefix' => 'tenant_',
        'suffix' => '',
        'managers' => [
            'mysql' => Stancl\Tenancy\TenantDatabaseManagers\MySQLDatabaseManager::class,
            'pgsql' => Stancl\Tenancy\TenantDatabaseManagers\PostgreSQLDatabaseManager::class,
            'sqlite' => Stancl\Tenancy\TenantDatabaseManagers\SQLiteDatabaseManager::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Parameters
    |--------------------------------------------------------------------------
    | Tenant-specific migrations live in database/migrations/tenant/
    | They run automatically in each new tenant DB when a tenant is created.
    */
    'migration_parameters' => [
        '--path' => [database_path('migrations/tenant')],
        '--realpath' => true,
    ],

    'seeder_parameters' => [
        '--class' => 'Database\Seeders\TenantDatabaseSeeder',
    ],

    /*
    |--------------------------------------------------------------------------
    | Filesystem Tenancy Configuration
    |--------------------------------------------------------------------------
    | Used by FilesystemTenancyBootstrapper.
    |
    | asset_helper_tenancy is set to false so that Vite-compiled assets
    | (JS/CSS in public/build/) load from the same path on all domains.
    | Without this, asset() URLs get prefixed with /tenancy/ and break.
    */
    'filesystem' => [
        'suffix_base' => 'tenant',
        'disks' => [
            'local',
            'public',
        ],
        'root_override' => [
            'local' => '%storage_path%/app/',
            'public' => '%storage_path%/app/public/',
        ],
        'suffix_storage_path' => true,
        'asset_helper_tenancy' => false,
    ],

];
