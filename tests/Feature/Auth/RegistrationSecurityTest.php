<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// Bug 1 — Registration must never produce a central domain session
// ---------------------------------------------------------------------------

test('registering a school does not authenticate the user on the central domain', function () {
    $this->post('/register', [
        'school_name' => 'Security Test School',
        'admin_name' => 'Admin User',
        'email' => 'admin@securitytest.edu',
        'password' => 'password123!',
        'password_confirmation' => 'password123!',
    ]);

    expect(Auth::check())->toBeFalse();
    $this->assertGuest();
})->group('security');

test('registering a school redirects to the tenant subdomain login page', function () {
    $response = $this->post('/register', [
        'school_name' => 'Redirect Test School',
        'admin_name' => 'Admin User',
        'email' => 'admin@redirecttest.edu',
        'password' => 'password123!',
        'password_confirmation' => 'password123!',
    ]);

    $slug = Str::slug('Redirect Test School');
    $centralDomain = config('tenancy.central_domains')[0];

    $response->assertRedirect("http://{$slug}.{$centralDomain}:8000/login");
})->group('security');

test('registering a school with a duplicate name returns a validation error', function () {
    Tenant::create([
        'id' => 'duplicate-school',
        'school_email' => 'first@duplicate.edu',
        'admin_email' => 'first@duplicate.edu',
        'school_name' => 'Duplicate School',
        'plan' => 'free',
        'status' => 'active',
    ]);

    $response = $this->post('/register', [
        'school_name' => 'Duplicate School',
        'admin_name' => 'Another Admin',
        'email' => 'second@duplicate.edu',
        'password' => 'password123!',
        'password_confirmation' => 'password123!',
    ]);

    $response->assertSessionHasErrors('school_name');
    $this->assertGuest();
})->group('security');

// ---------------------------------------------------------------------------
// Bug 2 — Google OAuth must never create a new central user
// ---------------------------------------------------------------------------

test('google oauth callback rejects unknown google identities', function () {
    \Laravel\Socialite\Facades\Socialite::shouldReceive('driver->user')
        ->andReturn((object) [
            'getId' => fn () => 'unknown-google-id-999',
            'getEmail' => fn () => 'attacker@gmail.com',
            'getName' => fn () => 'Attacker',
        ]);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect('/login');
    $response->assertSessionHasErrors('google');
    $this->assertGuest();
    expect(User::where('email', 'attacker@gmail.com')->exists())->toBeFalse();
})->group('security');

test('google oauth callback does not insert a new row into the central users table', function () {
    $countBefore = User::count();

    \Laravel\Socialite\Facades\Socialite::shouldReceive('driver->user')
        ->andReturn((object) [
            'getId' => fn () => 'new-google-id-999',
            'getEmail' => fn () => 'newperson@gmail.com',
            'getName' => fn () => 'New Person',
        ]);

    $this->get('/auth/google/callback');

    expect(User::count())->toBe($countBefore);
})->group('security');

test('google oauth callback allows an existing central user to authenticate', function () {
    $superAdmin = User::factory()->create([
        'email' => 'superadmin@borrowix.com',
        'role' => 'super_admin',
        'google_id' => null,
    ]);

    \Laravel\Socialite\Facades\Socialite::shouldReceive('driver->user')
        ->andReturn((object) [
            'getId' => fn () => 'google-id-superadmin-123',
            'getEmail' => fn () => 'superadmin@borrowix.com',
            'getName' => fn () => 'Super Admin',
        ]);

    $response = $this->get('/auth/google/callback');

    $this->assertAuthenticatedAs($superAdmin);
    $response->assertRedirect('/dashboard');
})->group('security');
