<?php

namespace App\Providers;

use App\Enums\Permission;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerGates();
    }

    /**
     * Register Gates for Spatie Permission integration.
     */
    protected function registerGates(): void
    {
        Gate::before(function ($user) {
            if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
                return true;
            }

            return null;
        });

        foreach (Permission::cases() as $permission) {
            Gate::define($permission->value, function ($user) use ($permission) {
                return $user->hasPermissionTo($permission->value);
            });
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
