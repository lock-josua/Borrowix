<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\PermissionRegistrar;
use Stancl\JobPipeline\JobPipeline;
use Stancl\Tenancy\Events;
use Stancl\Tenancy\Jobs;
use Stancl\Tenancy\Listeners;

class TenancyServiceProvider extends ServiceProvider
{
    /**
     * Map tenancy events to their listeners/job pipelines.
     *
     * When TenantCreated fires (on Tenant::create()), the JobPipeline
     * runs these jobs IN ORDER:
     *   1. CreateDatabase  — creates the MySQL DB: e.g. tenant_demo-school
     *   2. MigrateDatabase — runs all files in database/migrations/tenant/
     *
     * This is what auto-provisions a database when a school registers.
     */
    public function events(): array
    {
        return [
            Events\TenantCreated::class => [
                JobPipeline::make([
                    Jobs\CreateDatabase::class,
                    Jobs\MigrateDatabase::class,
                    Jobs\SeedDatabase::class,
                ])->send(function (Events\TenantCreated $event) {
                    return $event->tenant;
                })->toListener(),
            ],

            // When tenancy is initialized (DB switched), run the bootstrappers.
            Events\TenancyInitialized::class => [
                Listeners\BootstrapTenancy::class,
                function (Events\TenancyInitialized $event) {
                    app(PermissionRegistrar::class)->forgetCachedPermissions();
                },
            ],

            // When tenancy ends, revert to the central DB connection.
            Events\TenancyEnded::class => [
                Listeners\RevertToCentralContext::class,
            ],
        ];
    }

    public function register(): void {}

    public function boot(): void
    {
        $this->bootEvents();
        $this->mapRoutes();
    }

    protected function bootEvents(): void
    {
        foreach ($this->events() as $event => $listeners) {
            foreach ($listeners as $listener) {
                Event::listen($event, $listener);
            }
        }
    }

    protected function mapRoutes(): void
    {
        if (file_exists(base_path('routes/tenant.php'))) {
            // Only register tenant routes when the current host is NOT a central domain.
            // This prevents InitializeTenancyBySubdomain from firing on localhost
            // and throwing NotASubdomainException.
            $centralDomains = config('tenancy.central_domains', []);
            $host = request()->getHost();

            if (! in_array($host, $centralDomains)) {
                Route::middleware('web')
                    ->group(base_path('routes/tenant.php'));
            }
        }
    }
}
