<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate(UserRole::SuperAdmin->value);
});

test('super admin settings page can be rendered', function () {
    /** @var User $user */
    $user = User::factory()->create([
        'role' => UserRole::SuperAdmin,
    ]);

    $response = $this->actingAs($user)->get(route('super-admin.settings'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('super-admin/settings/index')
        ->where('user.name', $user->name)
        ->where('user.email', $user->email)
    );
});

test('super admin can update profile and changing email clears verification', function () {
    /** @var User $user */
    $user = User::factory()->create([
        'role' => UserRole::SuperAdmin,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->patch(route('super-admin.settings.profile.update'), [
        'name' => 'Updated Super Admin',
        'email' => 'updated-super-admin@example.com',
    ]);

    $response->assertRedirect(route('super-admin.settings'));
    $response->assertSessionHas('success', 'Profile updated.');

    $user->refresh();

    expect($user->name)->toBe('Updated Super Admin');
    expect($user->email)->toBe('updated-super-admin@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('super admin password update validates current password', function () {
    /** @var User $user */
    $user = User::factory()->create([
        'role' => UserRole::SuperAdmin,
    ]);

    $response = $this->actingAs($user)->from(route('super-admin.settings'))->put(route('super-admin.settings.password.update'), [
        'current_password' => 'wrong-password',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ]);

    $response->assertRedirect(route('super-admin.settings'));
    $response->assertSessionHasErrors('current_password');
});

test('super admin can change password with correct current password', function () {
    /** @var User $user */
    $user = User::factory()->create([
        'role' => UserRole::SuperAdmin,
        'password' => 'old-password',
    ]);

    $response = $this->actingAs($user)->put(route('super-admin.settings.password.update'), [
        'current_password' => 'old-password',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ]);

    $response->assertRedirect(route('super-admin.settings'));
    $response->assertSessionHas('success', 'Password changed.');

    $user->refresh();

    expect(Hash::check('new-password-123', $user->password))->toBeTrue();
});
