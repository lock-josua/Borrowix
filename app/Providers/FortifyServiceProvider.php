<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // SECURITY: Override Fortify's default RegisterResponse to prevent
        // Auth::login() from authenticating a tenant user on the central domain.
        // This intercepts the response before any session is written and redirects
        // the new school admin to their tenant subdomain login instead.
        $this->app->singleton(RegisterResponse::class, function () {
            return new class implements RegisterResponse
            {
                public function toResponse($request)
                {
                    $slug = \Illuminate\Support\Str::slug($request->input('school_name', ''));
                    $centralDomain = config('tenancy.central_domains')[0];
                    $subdomainUrl = "http://{$slug}.{$centralDomain}:8000";
                    $loginUrl = "{$subdomainUrl}/login";
                    $adminEmail = $request->input('email', '');
                    $schoolName = $request->input('school_name', '');

                    // Send the registration confirmation email.
                    // The user already set their own password, so no reset token is needed.
                    \Illuminate\Support\Facades\Mail::to($adminEmail)->send(
                        new \App\Mail\SchoolRegisteredMail(
                            schoolName: $schoolName,
                            adminEmail: $adminEmail,
                            subdomainUrl: $subdomainUrl,
                            loginUrl: $loginUrl,
                        )
                    );

                    // Store the school details in the session so the success page can display them.
                    // Use session()->put() not ->with() because ->with() only survives one redirect
                    // and we need the data available when RegisterSuccessController renders the page.
                    $request->session()->put('registered_school', [
                        'school_name' => $schoolName,
                        'subdomain_url' => $subdomainUrl,
                        'login_url' => $loginUrl,
                        'admin_email' => $adminEmail,
                    ]);

                    return redirect()->route('register.success');
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => true,
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
